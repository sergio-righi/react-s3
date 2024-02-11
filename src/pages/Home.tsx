import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { Custom, Icon, Progress } from "components";
import { useApp, useTheme } from "contexts";
import { Constants, S3 } from "utils";
import { IFile } from "interfaces";

// icons
import { DeleteForeverRounded, DownloadRounded } from "@mui/icons-material";

export const Home = () => {
  const { t } = useApp();
  const { theme } = useTheme();

  const attachmentRef = useRef<any>(null);
  const pageContainerRef = useRef<any>(null);
  const attachmentButtonRef = useRef<any>(null);
  const dropboxContainerRef = useRef<any>(null);

  const [usage, setUsage] = useState<number>(0);
  const [dropbox, setDropbox] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(0);
  const [attachments, setAttachments] = useState<IFile[]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);

  useEffect(() => {
    initDropbox();
    updateDiskUsage();

    S3.FOLDER_NAME = "";

    S3.ACTION_CALLBACK = handleActionCallback;
    S3.CONFIRM_CALLBACK = handleConfirmCallback;

    // it retrieves the credentials
    S3.set({
      endpoint: Constants.S3_CREDENTIALS.ENDPOINT,
      accessKey: Constants.S3_CREDENTIALS.ACCESS_KEY,
      secretKey: Constants.S3_CREDENTIALS.SECRET_KEY,
      bucketName: Constants.S3_CREDENTIALS.BUCKET_NAME,
    });
  }, []);

  function initDropbox() {
    if (
      attachmentRef.current &&
      attachmentButtonRef.current &&
      dropboxContainerRef.current
    ) {
      pageContainerRef.current.addEventListener("dragenter", function (e: any) {
        dropboxContainerRef.current.classList.add("active");
      });

      pageContainerRef.current.addEventListener("dragleave", function (e: any) {
        if (
          ![pageContainerRef.current, dropboxContainerRef.current].includes(
            e.target
          )
        ) {
          dropboxContainerRef.current.classList.remove("active");
        }
      });

      dropboxContainerRef.current.addEventListener(
        "dragleave",
        function (e: any) {
          dropboxContainerRef.current.classList.remove("active");
        }
      );

      dropboxContainerRef.current.addEventListener(
        "dragover",
        function (e: any) {
          e.preventDefault();
        }
      );

      dropboxContainerRef.current.addEventListener("drop", function (e: any) {
        e.preventDefault();
        dropboxContainerRef.current.classList.remove("active");

        S3.put([...e.dataTransfer.items].map((item: any) => item.getAsFile()));
      });

      attachmentButtonRef.current.addEventListener("click", function (e: any) {
        attachmentRef.current.click();
      });

      attachmentRef.current.addEventListener("change", function (e: any) {
        const files = e.target.files;

        if (files.length === 0) {
          attachmentButtonRef.current.setAttribute(
            "data-label",
            attachmentButtonRef.current.dataset.init
          );
        } else if (files.length === 1) {
          attachmentButtonRef.current.setAttribute(
            "data-label",
            files[0].name + attachmentButtonRef.current.dataset.notMultiple
          );
        } else {
          attachmentButtonRef.current.setAttribute(
            "data-label",
            files.length + attachmentButtonRef.current.dataset.multiple
          );
        }

        S3.put(files);
      });
    }
  }

  function updateDiskUsage() {
    // TODO : check whether the file can be uploaded
    setUsage(0);
  }

  function handleActionCallback(response: any) {
    console.log(response);

    switch (response.action) {
      case "delete":
        setAttachments(response.values);
        break;
      case "fetch":
        setAttachments(response.values);
        break;
      case "progress":
        setPercentage(response.value);
        break;
      case "replace":
        // TODO : size calculation
        break;
      case "reset":
        setInProgress(false);
        attachmentRef.current.value = "";
        break;
      case "restart":
        setPercentage(0);
        break;
      case "start":
        setInProgress(true);
        break;
      case "upload":
        setAttachments(response.values);
        break;
    }
  }

  function handleConfirmCallback(message: any, onOk: any, onCancel: any) {
    onOk && onOk();
  }

  function keyToName(key: string): string {
    return key.replace(S3.FOLDER_NAME, "").replace(/\//, "");
  }

  function sizeToString(size: number): string {
    const sizes = ["b", "kb", "mb", "gb", "tb"];
    if (size === 0) return "0 b";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formattedSize = parseFloat((size / Math.pow(1024, i)).toFixed(2));
    return `~ ${formattedSize} ${sizes[i]}`;
  }

  return (
    <Stack
      ref={pageContainerRef}
      height={1}
      position="relative"
      p={theme.spacing.sm}
      gap={theme.spacing.md}
      className="page-container"
    >
      {/* dropbox container */}
      <Box
        ref={dropboxContainerRef}
        className="dropbox-container"
        sx={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          zIndex: -1,
          borderWidth: 4,
          visibility: "hidden",
          position: "absolute",
          borderStyle: "dashed",
          backgroundColor: theme.color.overlay,
          borderColor: theme.color.primary.accent,
          "&.active": {
            zIndex: 9,
            opacity: 1,
            visibility: "visible",
            transition: "opacity 300ms ease",
          },
        }}
      ></Box>
      {/* attachment container */}
      <Box className="attachment-container">
        <input ref={attachmentRef} type="file" multiple={true} hidden={true} />
        <Custom.Button
          ref={attachmentButtonRef}
          className="btn btn-primary"
          data-init={t.message.file.init}
          data-label={t.message.file.init}
          data-not-multiple={t.message.file.not_multiple}
          data-multiple={t.message.file.multiple}
          sx={{
            "&:before": {
              content: "attr(data-label)",
            },
          }}
        ></Custom.Button>
      </Box>
      {/* in progress bar */}
      {inProgress && <Progress.LinearProgressWithLabel value={percentage} />}
      {/* attachment container */}
      <List
        sx={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: theme.palette.border,
          borderRadius: theme.border.radius,
        }}
      >
        {attachments.map((item: IFile, i: number) => {
          return (
            <>
              <ListItem
                key={item.Key}
                secondaryAction={
                  <Stack direction="row" spacing={theme.spacing.md}>
                    <Custom.IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => S3.get(item.Key)}
                    >
                      <DownloadRounded />
                    </Custom.IconButton>
                    <Custom.IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => S3.remove(item.Key, item.Size)}
                    >
                      <DeleteForeverRounded />
                    </Custom.IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={[
                      Constants.S3_CREDENTIALS.ENDPOINT,
                      Constants.S3_CREDENTIALS.BUCKET_NAME,
                      item.Key,
                    ].join("/")}
                  >
                    <Icon.File name={item.Key} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={keyToName(item.Key)}
                  secondary={sizeToString(item.Size)}
                />
              </ListItem>
              {attachments.length - 1 !== i && <Custom.Divider />}
            </>
          );
        })}
      </List>
    </Stack>
  );
};
