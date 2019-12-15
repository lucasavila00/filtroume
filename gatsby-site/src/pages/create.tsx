import React from "react";

import { initializeIcons } from "office-ui-fabric-react";
import { makeNotificationNone } from "../creator/imgedit/helpers";
import { ImageEditor } from "../creator/imgedit/main";
import {
  INotificationError,
  INotificationUploaded,
  NotificationType,
  NotificationTypeEnum,
} from "../creator/types";
import "./index.css";
import "./normalize.css";
initializeIcons(/* optional base url */);

const createCentralizeStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const postData = async (url = "", data = {}) => {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "text/plain",
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.text(); // parses JSON response into native JavaScript objects
};

const shortIdToUrl = (shortId: string) =>
  "https://filterme.firebaseapp.com/" + shortId;
const Create: React.FunctionComponent = () => {
  const [notif, setNotif] = React.useState<NotificationType>(
    makeNotificationNone(),
  );
  const setNotifErr = (message?: string) => {
    const notifErr: INotificationError = {
      type: NotificationTypeEnum.error,
      message,
    };
    setNotif(notifErr);
  };
  const setNotifUploaded = (shortId: string) => {
    const notifUpload: INotificationUploaded = {
      type: NotificationTypeEnum.uploaded,
      url: shortIdToUrl(shortId),
    };
    setNotif(notifUpload);
  };
  const onPublish = async ({
    croppedLut,
    planeImg,
  }: {
    croppedLut: string;
    planeImg: string;
  }) => {
    const url = "https://us-central1-filterme.cloudfunctions.net/createFilter";
    try {
      const data = await postData(url, { lut: croppedLut, image: planeImg });

      if (data === "0err0") {
        setNotifErr("0err0");
      } else {
        const shortId = data;
        setNotifUploaded(shortId);
      }
    } catch (err) {
      setNotifErr();
    }
  };
  const onDismissNotification = () => {
    setNotif(makeNotificationNone());
  };
  return (
    <div style={createCentralizeStyle}>
      <ImageEditor
        onPublish={onPublish}
        notification={notif}
        onDismissNotification={onDismissNotification}
      />
    </div>
  );
};

export default Create;
