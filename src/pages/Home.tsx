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
import { useParams } from "react-router-dom";
import { Constants, S3 } from "utils";
import { IDocument } from "interfaces";

// icons
import { DeleteForeverRounded, DownloadRounded } from "@mui/icons-material";

export const Home = () => {
  const { t } = useApp();
  const { theme } = useTheme();
  const { directory } = useParams();

  const attachmentRef = useRef<any>(null);
  const pageContainerRef = useRef<any>(null);
  const attachmentButtonRef = useRef<any>(null);
  const dropboxContainerRef = useRef<any>(null);

  const [percentage, setPercentage] = useState<number>(0);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);

  useEffect(() => {
    initDropbox();

    S3.ACTION_CALLBACK = handleActionCallback;

    S3.config(
      {
        endpoint: Constants.S3.ENDPOINT,
        accessKeyId: Constants.S3.ACCESS_KEY,
        secretAccessKey: Constants.S3.SECRET_KEY,
      },
      Constants.S3.BUCKET_NAME
    );

    fetchData();
  }, []);

  function fetchData() {
    S3.fetch(directory ?? "", false);
  }

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

        const files = [...e.dataTransfer.items].map((item: any) =>
          item.getAsFile()
        );

        files.length > 0 && S3.upload(directory ?? "", files);
      });
    }
  }

  function handleOnClick(e: any) {
    attachmentRef.current.click();
  }

  function handleOnChange(e: any) {
    const files = e.target.files;
    handleOnChangeCallback(files);
    S3.upload(directory ?? "", files);
  }

  function handleOnChangeCallback(files: File[]) {
    if (files.length === 0) {
      attachmentButtonRef.current.setAttribute(
        "data-label",
        attachmentButtonRef.current.dataset.init
      );
    } else {
      if (files.length === 1) {
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
    }
  }

  function handleActionCallback(response: any) {
    // console.log(response);

    switch (response.action) {
      case "fetch":
      case "upload":
      case "delete":
        setDocuments(response.values);
        break;
      case "progress":
        setPercentage(response.value);
        break;
      case "end":
        setPercentage(0);
        setInProgress(false);
        handleOnChangeCallback([]);
        attachmentRef.current.value = "";
        break;
      case "start":
        setInProgress(true);
        break;
    }
  }

  function keyToName(key: string, isDirectory: boolean): string {
    return isDirectory ? key.replace(/\//, "") : key.split("/").pop() ?? "";
  }

  function sizeToString(size: number): string {
    const sizes = ["b", "kb", "mb", "gb", "tb"];
    if (size === 0) return "0 b";
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const formattedSize = parseFloat((size / Math.pow(1024, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
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
        <input
          hidden
          multiple
          type="file"
          ref={attachmentRef}
          onChange={handleOnChange}
        />
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
          onClick={handleOnClick}
        />
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
        {documents.map((item: IDocument, i: number) => {
          return (
            <Box key={item.Key}>
              <ListItem
                secondaryAction={
                  <Stack direction="row" spacing={theme.spacing.md}>
                    <Custom.IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => S3.download(item.Key)}
                    >
                      <DownloadRounded />
                    </Custom.IconButton>
                    <Custom.IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => S3.remove(item.Key)}
                    >
                      <DeleteForeverRounded />
                    </Custom.IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={[
                      Constants.S3.ENDPOINT,
                      Constants.S3.BUCKET_NAME,
                      item.Key,
                    ].join("/")}
                  >
                    <Icon.File name={item.Key} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={keyToName(item.Key, false)}
                  secondary={sizeToString(item.Size ?? 0)}
                />
              </ListItem>
              {documents.length - 1 !== i && <Custom.Divider />}
            </Box>
          );
        })}
      </List>
    </Stack>
  );
};
