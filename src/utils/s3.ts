import AWS from "aws-sdk";
import { IDocument } from "interfaces";

interface IPart {
  ETag?: string;
  SignedUrl?: string;
  PartNumber: number;
}

class S3 {
  public IN_PROGRESS: boolean = false;
  public ACTION_CALLBACK = (response: any) => { };

  private BUCKET_NAME: string = "";
  private FILES: IDocument[] = [];
  private s3: AWS.S3;
  private props: { index: number; queue: File[]; maxKeys: number; chunkSize: number; threadsQuantity: number } = {
    index: -1,
    queue: [],
    maxKeys: 99, // max number of documents retrieved
    chunkSize: 5 * 1024 * 1024, // 5mb
    threadsQuantity: 5, // max concurrent uploads
  };

  private currentFileState: {
    file: File | null;
    uploadedSize: number;
    progressCache: Record<number, number>;
    activeConnections: Record<number, boolean>;
    parts: IPart[];
    uploadedParts: IPart[];
    fileId: string;
    fileKey: string;
    onProgress: (progress: { sent: number; total: number; percentage: number }) => void;
    onError: (error: any) => void;
  } = {
      file: null,
      uploadedSize: 0,
      progressCache: {},
      activeConnections: {},
      parts: [],
      uploadedParts: [],
      fileId: "",
      fileKey: "",
      onProgress: () => { },
      onError: () => { },
    };

  constructor() { }

  /* Action controller methods */
  private actionController = {
    initializeMultipartUpload: async (key: string): Promise<{ fileId: string; fileKey: string }> => {
      const multipartParams = { Bucket: this.BUCKET_NAME, Key: key };
      const response = await this.s3.createMultipartUpload(multipartParams).promise();
      return { fileId: response.UploadId ?? "", fileKey: response.Key ?? "" };
    },

    getMultipartPreSignedUrls: async (fileId: string, fileKey: string, chunks: number): Promise<IPart[]> => {
      const promises = Array.from({ length: chunks }, (_, i: number) =>
        this.s3.getSignedUrlPromise("uploadPart", {
          PartNumber: i + 1,
          Key: fileKey,
          UploadId: fileId,
          Bucket: this.BUCKET_NAME,
        })
      );
      const urls = await Promise.all(promises);
      return urls.map((url: string, i: number) => ({ SignedUrl: url, PartNumber: i + 1 }));
    },

    finalizeMultipartUpload: async (fileKey: string, fileId: string, parts: IPart[]): Promise<void> => {
      const cleanedParts = parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag }));

      const multipartParams = {
        Bucket: this.BUCKET_NAME,
        Key: fileKey,
        UploadId: fileId,
        MultipartUpload: { Parts: cleanedParts.sort((a, b) => a.PartNumber - b.PartNumber) },
      };

      await this.s3.completeMultipartUpload(multipartParams).promise();
    },

    list: async (prefix: string, delimiter: string = "") => {
      const listParams = { Bucket: this.BUCKET_NAME, MaxKeys: this.props.maxKeys, Prefix: prefix, Delimiter: delimiter };
      return await this.s3.listObjectsV2(listParams).promise();
    },

    fetch: async (fileKey: string): Promise<{ fileName: string, data: AWS.S3.Body | undefined, contentType: string | undefined }> => {
      const fetchParams = { Bucket: this.BUCKET_NAME, Key: fileKey };
      const response = await this.s3.getObject(fetchParams).promise();
      const fileName = fileKey.includes("/") ? fileKey.split("/").pop() ?? "" : fileKey;
      return { fileName, data: response.Body, contentType: response.ContentType };
    },

    remove: async (fileKey: string) => {
      const deleteParams = { Bucket: this.BUCKET_NAME, Key: fileKey };
      await this.s3.deleteObject(deleteParams).promise();
    },

    share: (fileKey: string) => {
      const urlParams = { Bucket: this.BUCKET_NAME, Key: fileKey, Expires: 60 };
      return this.s3.getSignedUrl("getObject", urlParams);
    },
  };

  /* UI Functions */

  private uploadNext(prefix: string, callback?: Function) {
    this.currentFileState.file = this.props.queue[++this.props.index];
    if (this.currentFileState.file) {
      this.startMultipartUpload(prefix, callback);
    } else {
      this.IN_PROGRESS = false;
      this.resetQueue();
      callback && callback(this.FILES);
    }
  }

  private async startMultipartUpload(prefix: string, callback?: Function) {
    this.ACTION_CALLBACK({ action: "start" });

    try {
      const fileName = [prefix, this.currentFileState.file!.name].join("/");
      const { fileId, fileKey } = await this.actionController.initializeMultipartUpload(fileName);

      this.currentFileState.fileId = fileId;
      this.currentFileState.fileKey = fileKey;

      const chunkCount = Math.ceil(this.currentFileState.file!.size / this.props.chunkSize);
      const parts = await this.actionController.getMultipartPreSignedUrls(fileId, fileKey, chunkCount);

      this.currentFileState.parts.push(...parts);
      this.sendNextPart(prefix, callback);
    } catch (error) {
      this.completeUpload(prefix, callback, error);
    }
  }

  private sendNextPart = (prefix: string, callback?: Function) => {
    const activeConnections = Object.keys(this.currentFileState.activeConnections).length;
    if (activeConnections >= this.props.threadsQuantity || !this.currentFileState.parts.length) {
      if (!activeConnections) this.completeUpload(prefix, callback);
      return;
    }

    const part = this.currentFileState.parts.pop();
    if (part) {
      const sentSize = (part.PartNumber - 1) * this.props.chunkSize;
      const chunk = this.currentFileState.file!.slice(sentSize, sentSize + this.props.chunkSize);
      this.sendChunk(chunk, part)
        .then(() => this.sendNextPart(prefix, callback))
        .catch((error) => {
          this.currentFileState.parts.push(part);
          this.completeUpload(prefix, callback, error);
        });
    }
  };

  private async sendChunk(chunk: Blob, part: IPart) {
    const signedUrl = part.SignedUrl;
    const response = await fetch(signedUrl!, { method: "PUT", body: chunk });
    const ETag = response.headers.get("ETag");

    if (ETag) {
      this.currentFileState.uploadedParts.push({
        PartNumber: part.PartNumber,
        ETag: ETag.replaceAll('"', ""),
      });

      const total = this.currentFileState.file!.size;
      const sent = Math.min(this.currentFileState.uploadedSize + chunk.size, this.currentFileState.file!.size);
      const percentage = Math.round((sent / total) * 100);

      this.ACTION_CALLBACK({
        action: "progress", value: percentage, index: this.props.index + 1, count: this.props.queue.length
      })

      this.currentFileState.uploadedSize += chunk.size;
    }
  }

  private completeUpload(prefix: string, callback?: Function, error?: any) {
    if (error) {
      this.currentFileState.onError(error);
      return;
    }
    this.finalizeUpload(prefix, callback);
  }

  private async finalizeUpload(prefix: string, callback?: Function) {

    try {
      await this.actionController.finalizeMultipartUpload(
        this.currentFileState.fileKey,
        this.currentFileState.fileId,
        this.currentFileState.uploadedParts
      );

      const fileInfo = { Key: this.currentFileState.fileKey, Size: this.currentFileState.file!.size };
      const existingIndex = this.FILES.findIndex(file => file.Key === fileInfo.Key);
      if (existingIndex === -1) {
        this.FILES.push(fileInfo);
      } else {
        this.FILES[existingIndex].Size = fileInfo.Size;
      }

      this.ACTION_CALLBACK({ action: "upload", value: fileInfo, values: this.FILES });
      this.uploadNext(prefix, callback);
    } catch (error) {
      this.currentFileState.onError(error);
    }
  }

  private resetQueue() {
    this.ACTION_CALLBACK({ action: "end" });
    this.currentFileState.uploadedSize = 0;
    this.currentFileState.progressCache = {};
    this.currentFileState.activeConnections = {};
    this.currentFileState.parts = [];
    this.currentFileState.uploadedParts = [];
    this.currentFileState.fileId = "";
    this.currentFileState.fileKey = "";
    this.props.index = -1;
  }

  /* Utility Functions */

  public config(credentials: AWS.S3.ClientConfiguration, bucketName: string) {
    this.BUCKET_NAME = bucketName;
    this.s3 = new AWS.S3({ ...credentials, s3ForcePathStyle: true });
  }

  public upload(prefix: string, files: File[], callback?: Function) {
    this.IN_PROGRESS = true;
    this.props.queue = files;
    this.uploadNext(prefix, callback);
  }

  public async fetch(prefix: string, delimiter: boolean = false) {
    const response = await this.actionController.list(prefix && `${prefix}/`, delimiter ? "/" : "");
    this.FILES = (delimiter ? response.CommonPrefixes?.map((item: AWS.S3.CommonPrefix) => ({ Delimiter: true, Key: item.Prefix?.replace("\\/", "") } as IDocument)) : response.Contents?.map((item: AWS.S3.Object) => ({ Key: item.Key, Size: item.Size } as IDocument))) as IDocument[];
    this.ACTION_CALLBACK({ action: "fetch", values: this.FILES });
  }

  public async stats(prefix: string) {
    const response = await this.actionController.list(prefix);
    const newResponse = response.Contents || [];
    return { total: newResponse.reduce((acc: number, value: AWS.S3.Object) => acc + (value.Size ?? 0), 0), count: Math.max(0, newResponse.length - 1) }
  }

  public async download(key: string) {
    try {
      const { fileName, data, contentType } = await this.actionController.fetch(key);
      if (!data) return;
      const blob = new Blob([data as BlobPart], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ?? "";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Download error: ", error);
    }
  }

  public async remove(key: string) {
    try {
      await this.actionController.remove(key);
      this.FILES = this.FILES.filter(file => file.Key !== key);
      this.ACTION_CALLBACK({ action: "delete", values: this.FILES });
    } catch (error) {
      console.error("Delete error: ", error);
    }
  }

  public share(key: string) {
    return this.actionController.share(key);
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new S3();