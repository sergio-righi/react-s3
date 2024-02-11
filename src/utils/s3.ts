import AWS from "aws-sdk";
import { IFile } from "interfaces";

class S3 {

  /* begin ui declarations */

  public in_progress: boolean = false;

  public FOLDER_NAME: string = "";
  public BUCKET_NAME: string = "";
  public ARRAY_OF_FILES: IFile[] = [];

  public ACTION_CALLBACK = function (response: any) { };
  public CONFIRM_CALLBACK = function (message: string, onOk: any, onCancel: any) { };
  public FIND_CALLBACK = function (key: string): any { };

  /* end ui declarations */

  get PATH_NAME() {
    return this.FOLDER_NAME ? this.FOLDER_NAME + "/" : "";
  }

  /* begin declarations */

  /*
  * it controls the state for the flow and configurations
  */

  private props: any = {
    index: -1,
    queue: [],
    chunkSize: 5 * 1024 * 1024, // 5mb (minimum)
    threadsQuantity: 5, // number of parallel connections
  };

  /*
  * it controls the state for the file that is currently being uploaded
  */

  private current: any = {
    file: null,
    aborted: false,
    replaced: 0,
    uploadedSize: 0,
    progressCache: {},
    activeConnections: {},
    parts: [],
    uploadedParts: [],
    fileId: null,
    fileKey: null,
    onProgressFn: function () { },
    onErrorFn: function () { },
  };

  /*
  * s3 client instance and its properties
  */

  private s3: any;
  private config: any = {
    endpoint: "",
    accessKeyId: "",
    secretAccessKey: "",
    s3ForcePathStyle: true, // mandatory
  };

  /* end declarations */

  /* begin sdk actions */

  private ActionController: any = {

    /*
    * it inits the process by getting the key and file id
    * @param name the file name
    * @returns
    */

    initializeMultipartUpload: (params: any, callback: any) => {
      const multipartParams = {
        Bucket: this.BUCKET_NAME,
        Key: this.PATH_NAME + params.name,
      };

      this.s3.createMultipartUpload(multipartParams, (error: any, response: any) => {
        if (error) {
          callback(error, null);
        } else {
          callback(null, {
            fileId: response.UploadId,
            fileKey: response.Key,
          });
        }
      });
    },

    /*
    * it fetches the signed urls for each of the parts to be uploaded
    * @param fileKey retrieved from the init operation
    * @param fileId retrieved from the init operation
    * @returns
    */

    getMultipartPreSignedUrls: (params: any, callback: any) => {
      const promises = [];

      for (let i = 0; i < params.parts; i++) {
        promises.push(
          this.s3.getSignedUrlPromise("uploadPart", {
            PartNumber: i + 1,
            Bucket: this.BUCKET_NAME,
            Key: params.fileKey,
            UploadId: params.fileId,
          })
        );
      }

      Promise.all(promises)
        .then((response: any) => {
          const parts = response.map((item: any, i: number) => {
            return {
              signedUrl: item,
              PartNumber: i + 1,
            };
          });

          callback(null, {
            parts: parts,
          });
        })
        .catch((error: any) => {
          callback(error, null);
        });
    },

    /*
    * it finalizes the multipart upload process
    * @param fileKey retrieved from the init operation
    * @param fileId retrieved from the init operation
    * @param parts retrieved from the signed url operation
    * @returns
    */

    finalizeMultipartUpload: (params: any, callback: any) => {
      const multipartParams = {
        Bucket: this.BUCKET_NAME,
        Key: params.fileKey,
        UploadId: params.fileId,
        MultipartUpload: {
          Parts: params.parts.sort((a: any, b: any) => {
            return a.PartNumber - b.PartNumber;
          }),
        },
      };

      this.s3.completeMultipartUpload(multipartParams, (error: any) => {
        if (error) {
          callback(error);
        } else {
          callback(null);
        }
      });
    },

    /*
    * it list all the objects from the bucket
    * @param prefix if given, it filters the objects from a specific folder
    * @returns
    */

    list: (params: any, callback: any) => {
      const listParams = {
        Bucket: this.BUCKET_NAME,
        MaxKeys: 99, // max number of files fetched
        Prefix: params.prefix, // key prefix to be searched
      };

      this.s3.listObjectsV2(listParams, (error: any, response: any) => {
        if (error) {
          callback(error);
        } else {
          callback(null, response.Contents);
        }
      });
    },

    /*
    * it fetches a object from the bucket
    * @param fileKey the object key to be retrieved
    * @returns
    */

    fetch: (params: any, callback: any) => {
      const fetchParams = {
        Bucket: this.BUCKET_NAME,
        Key: params.fileKey,
      };

      const fileName = params.fileKey.match("/") ?
        params.fileKey.split("/")[1] :
        params.fileKey;

      this.s3.getObject(fetchParams, (error: any, response: any) => {
        if (error) {
          callback(error);
        } else {
          callback(null, {
            fileName: fileName,
            data: response.Body,
            contentType: response.ContentType,
          });
        }
      });
    },

    /*
    * it deletes a object from the bucket
    * @param fileKey the object key to be deleted
    * @returns
    */

    remove: (params: any, callback: any) => {
      const deleteParams = {
        Bucket: this.BUCKET_NAME,
        Key: params.fileKey,
      };

      this.CONFIRM_CALLBACK(
        "Are you sure you want to delete this file?",
        () => {
          this.s3.deleteObject(deleteParams, (error: any, response: any) => {
            console.log(error);
            if (error) {
              callback(error);
            } else {
              callback(null, response);
            }
          });
        },
        function () {
          // do nothing
        }
      );
    },

    /*
    * it generates a temporary signed url for sharing
    * @param fileKey the object key to be deleted
    * @returns
    */

    share: (params: any, callback: any) => {
      const urlParams = {
        Bucket: this.BUCKET_NAME,
        Key: params.fileKey,
        Expires: 60 // in seconds
      };

      this.s3.getSignedUrl("getObject", urlParams, (error: any, response: any) => {
        if (error) {
          console.log(error);
        } else {
          console.log(response);
        }
      });
    }
  };

  /* end sdk actions */

  /* begin ui functions */

  /*
  * it trigges when the user changes the file input
  * 1 - it starts the queue
  * @param files {array} the array of files
  * @returns
  */

  private uploadFile(files: Array<any>) {
    this.in_progress = true;
    this.props.queue = files;

    this.uploadNext();
  }

  /*
  * it triggers to start the queue or when the previous file has been sent
  * 1 - it tries to find a file with the same name on the table
  * 2 - if yes, it requests an action from the user
  * 2.1 - if ok, it starts the upload process
  * 2.2 - if cancel, it reset the properties and wait
  * 3 - if no, it picks the next file in the queue and it starts the upload process
  * @returns
  */

  private uploadNext() {
    this.current.file = this.props.queue[++this.props.index];

    if (this.current.file) {

      const elm = this.ARRAY_OF_FILES.find((item: IFile) => item.Key === this.PATH_NAME + this.current.file.name);
      if (elm) {
        this.current.replaced = elm.Size;

        this.CONFIRM_CALLBACK(
          "There is an existing file with the same name. Do you want to proceed?",
          () => this.start(),
          () => this.resetQueue()
        );

      } else {
        this.start();
      }
    } else {
      this.in_progress = false;

      this.resetQueue();
      this.resetAll();
    }
  }


  /*
  * it lists all the objects within the resource path provided filtered by a prefix (folder name)
  * 1 - it clears the current table rows
  * 2 - it inserts the objects from the response
  * @returns
  */

  private listObjects() {
    this.ActionController.list({
      prefix: this.FOLDER_NAME
    },
      (error: any, response: any) => {
        if (!response) {
          return;
        }

        this.ARRAY_OF_FILES = response;
        this.ACTION_CALLBACK({ action: "fetch", values: this.ARRAY_OF_FILES });
      }
    );
  }

  /*
  * it downloads the selected object
  * 1 - it fetches the object according to the selected one
  * 2 - it converts the response into binary
  * 3 - it creates a temp anchor to trigger the download
  * 4 - remove the temp anchor and clear data
  * @param evt the button clicked
  * @returns
  */

  private downloadObject(key: string) {
    this.ActionController.fetch({
      fileKey: key
    }, (error: any, response: any) => {
      if (error) return;

      const blob = new Blob([response.data], {
        type: response.contentType,
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = response.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => {
        return window.URL.revokeObjectURL(url);
      }, 1000);
    });
  }

  /*
  * it deletes the selected object
  * 1 - it tries to delete the given object key
  * 2 - if success, it removes the row from the table
  * 3 - if error, do nothing
  * @param evt the button clicked
  * @returns
  */

  private deleteObject(key: string, size: number) {
    this.ActionController.remove({
      fileKey: key,
      size: size
    }, (error: any, response: any) => {
      if (error) return;

      this.ARRAY_OF_FILES = [...this.ARRAY_OF_FILES.filter((item: IFile) => item.Key !== key)];
      this.ACTION_CALLBACK({ action: 'delete', value: { Key: key, Size: size }, values: this.ARRAY_OF_FILES });
    });
  }

  /*
  * it creates the instance of the client
  * @param params object containing bucket name, access key, secret key, and endpoint
  * @returns
  */

  private updateCredentials(params: any) {
    this.BUCKET_NAME = params.bucketName;

    this.config.endpoint = params.endpoint;
    this.config.accessKeyId = params.accessKey;
    this.config.secretAccessKey = params.secretKey;

    AWS.config.update(this.config);

    this.s3 = new AWS.S3();

    this.listObjects();
  }

  /* end ui functions */

  /* begin background functions */

  /*
  * it resets all the properties from the previous action
  */

  private resetQueue() {
    this.ACTION_CALLBACK({ action: "reset_queue" });

    this.current.aborted = false;
    this.current.replaced = 0;
    this.current.uploadedSize = 0;
    this.current.progressCache = {};
    this.current.activeConnections = {};
    this.current.parts = [];
    this.current.uploadedParts = [];
    this.current.fileId = null;
    this.current.fileKey = null;
    this.current.startTime = null;
    this.current.onProgressFn = function () { };
    this.current.onErrorFn = function () { };
  }

  /*
  * it resets all the properties for new flow
  */

  private resetAll() {
    this.ACTION_CALLBACK({ action: "reset" });

    this.current.file = null;

    this.props.index = -1;
    this.props.queue = [];
  }

  /* end background functions */

  /* begin multipart upload functions */

  /*
  * it triggers the multipart upload
  * 1 - it calls the init function to get the ID and Key
  * 2 - it calculates the number of parts
  * 3 - it creates an array of parts with respective signed url
  * @returns
  */

  private start() {
    this.ACTION_CALLBACK({ action: "start" });

    this.ActionController.initializeMultipartUpload({
      name: this.current.file.name
    }, (error: any, response: any) => {
      if (error) {
        this.complete(error);
      } else {
        this.current.fileId = response.fileId;
        this.current.fileKey = response.fileKey;

        const numberOfparts = Math.ceil(this.current.file.size / this.props.chunkSize);

        const multipartParams = {
          fileId: this.current.fileId,
          fileKey: this.current.fileKey,
          parts: numberOfparts,
        };

        this.ActionController.getMultipartPreSignedUrls(
          multipartParams,
          (error: any, response: any) => {
            if (error) {
              this.complete(error);
            } else {
              var newParts = response.parts;

              for (var i = 0; i < newParts.length; i++) {
                this.current.parts.push(newParts[i]);
              }

              this.sendNext();
            }
          }
        );
      }
    });
  }

  /*
  * it controls the number of parallel requests
  * 1 - if the number of connects is less than the number of threads allowed, send, otherwise, wait
  * 2 - if success, it triggers the next part
  * 3 - if error, add the part back to the queue
  * @returns
  */

  private sendNext() {
    const activeConnections = Object.keys(this.current.activeConnections).length;

    if (activeConnections >= this.props.threadsQuantity) {
      return;
    }

    if (!this.current.parts.length) {
      if (!activeConnections) {
        this.complete(null);
      }

      return;
    }

    const part = this.current.parts.pop();
    if (this.current.file && part) {
      const sentSize = (part.PartNumber - 1) * this.props.chunkSize;
      const chunk = this.current.file.slice(sentSize, sentSize + this.props.chunkSize);

      const sendChunkStarted = () => this.sendNext();

      this.sendChunk(chunk, part, sendChunkStarted)
        .then(() => this.sendNext())
        .catch((error: any) => {
          this.current.parts.push(part);

          this.complete(error);
        });
    }
  }

  /*
  * it controls the outcome of the multipart upload
  * 1 - if success, triggers the finalize function
  * 2 - if error, do nothing
  * @returns
  */

  private complete(error: any) {
    if (error && !this.current.aborted) {
      this.current.onErrorFn(error);
      return;
    }

    if (error) {
      this.current.onErrorFn(error);
      return;
    }

    this.sendCompleteRequest();
  }

  /*
  * it triggers the finalize function
  * 1 - if success, it inserts the new object to the attachments table
  * 2 - if error, call the error handler function
  * 3 - it resets all the properties from the previous action
  * @returns
  */

  private sendCompleteRequest() {
    if (this.current.fileId && this.current.fileKey) {
      const multipartParams = {
        fileId: this.current.fileId,
        fileKey: this.current.fileKey,
        parts: this.current.uploadedParts,
      };

      this.ActionController.finalizeMultipartUpload(
        multipartParams,
        (error: any) => {
          if (error) {
            this.current.onErrorFn(error);
          } else {

            const value = {
              Key: this.current.fileKey,
              Size: this.current.file.size,
              Old: this.current.replaced,
            }

            if (value.Old === 0) {
              this.ARRAY_OF_FILES = [...this.ARRAY_OF_FILES, value];
            } else {
              const oldValue = this.ARRAY_OF_FILES.find((item: IFile) => item.Key === value.Key);
              if (oldValue) {
                oldValue.Size = value.Size;
              }
            }

            this.ACTION_CALLBACK({
              action: this.current.replaced ? "replace" : "upload",
              value: value,
              values: this.ARRAY_OF_FILES
            });

            this.uploadNext();
          }
          this.resetQueue();
        }
      );
    }
  }

  /*
  * it calls the upload function with the part to be sent
  * @param chunk the Blob to be uploaded
  * @param part the part object with number and signed url
  * @param sendChunkStarted delegate function callback (it triggers next part)
  * @returns
  */

  private sendChunk(chunk: any, part: any, sendChunkStarted: any) {
    return new Promise((resolve: any, reject: any) => {
      this.upload(chunk, part, sendChunkStarted)
        .then((status: any) => {
          if (status !== 200) {
            reject(new Error("Failed chunk upload"));
            return;
          }

          resolve();
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /*
  * it handles the progress of the whole operation
  * @param part the number
  * @param evt the progress event
  * @returns
  */

  private handleProgress(part: any, evt: any) {
    if (this.current.file) {
      if (
        evt.type === "progress" ||
        evt.type === "error" ||
        evt.type === "abort"
      ) {
        this.current.progressCache[part] = evt.loaded;
      }

      if (evt.type === "uploaded") {
        this.current.uploadedSize += this.current.progressCache[part] || 0;
        delete this.current.progressCache[part];
      }

      const inProgress = Object.keys(this.current.progressCache)
        .map(Number)
        .reduce((memo, id) => (memo += this.current.progressCache[id]), 0);

      // it calculates the current progress

      const total = this.current.file.size;
      const sent = Math.min(this.current.uploadedSize + inProgress, this.current.file.size);
      const percentage = Math.round((sent / total) * 100);

      this.ACTION_CALLBACK({ action: "progress", value: percentage, index: this.props.index + 1, count: this.props.queue.length });

      this.current.onProgressFn({
        sent: sent,
        total: total,
        percentage: percentage,
      });
    }
  }

  /*
  * it performs the upload of the part
  * 1 - it creates the PUT request
  * 2 - it triggers the request
  * 3 - if success, check the part as uploaded and remove from active connections
  * 4 - if error, remove from active connections
  * @param chunk the Blob to be uploaded
  * @param part the part object with number and signed url
  * @param sendChunkStarted delegate function callback (it triggers next part)
  * @returns
  */

  private upload(chunk: any, part: any, sendChunkStarted: any) {
    return new Promise((resolve, reject) => {
      if (this.current.fileId && this.current.fileKey) {
        const xhr = (this.current.activeConnections[part.PartNumber - 1] =
          new XMLHttpRequest());

        sendChunkStarted();

        const progressListener = this.handleProgress.bind(this, part.PartNumber - 1);

        xhr.upload.addEventListener("progress", progressListener);

        xhr.addEventListener("error", progressListener);
        xhr.addEventListener("abort", progressListener);
        xhr.addEventListener("loadend", progressListener);

        xhr.open("PUT", part.signedUrl);

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const ETag = xhr.getResponseHeader("ETag");

            if (ETag) {
              const uploadedPart = {
                PartNumber: part.PartNumber,
                ETag: ETag.replaceAll('"', ""),
              };

              this.current.uploadedParts.push(uploadedPart);

              resolve(xhr.status);
              delete this.current.activeConnections[part.PartNumber - 1];
            }
          }
        };

        xhr.onerror = (error: any) => {
          reject(error);
          delete this.current.activeConnections[part.PartNumber - 1];
        };

        xhr.onabort = () => {
          reject(new Error("Upload canceled by user"));
          delete this.current.activeConnections[part.PartNumber - 1];
        };

        xhr.send(chunk);
      }
    });
  }

  /*
  * it handles the progress
  */

  private onProgress(onProgress: any) {
    this.current.onProgressFn = onProgress;
    return this;
  }

  /*
  * it handles errors
  * 1 - it resets all the properties
  * @returns
  */

  private onError(onError: any) {
    this.resetQueue();

    this.current.onErrorFn = onError;
    return this;
  }

  /*
  * it handles abort action from the user
  * 1 - it cancels all the active connections
  * @returns
  */

  private abort() {
    Object.keys(this.current.activeConnections)
      .map(Number)
      .forEach((item: any) => {
        this.current.activeConnections[item].abort();
      });

    this.current.aborted = true;
  }

  /* end multipart upload functions */

  public put(evt: any) {
    return this.uploadFile(evt);
  }

  public get(key: string) {
    return this.downloadObject(key);
  }

  public remove(key: string, size: number) {
    return this.deleteObject(key, size);
  }

  public set(params: any) {
    return this.updateCredentials(params);
  }

  public fetch() {
    return this.listObjects();
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new S3();