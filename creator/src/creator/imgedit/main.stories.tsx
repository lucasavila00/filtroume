import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import {
  INotificationError,
  INotificationUploaded,
  NotificationTypeEnum,
} from "../types";
import { makeNotificationNone } from "./helpers";
import { ImageEditor } from "./main";

const notificationUploaded: INotificationUploaded = {
  type: NotificationTypeEnum.uploaded,
  url: "https://filtre.me/a34nd",
};
const notificationError: INotificationError = {
  type: NotificationTypeEnum.error,
  message: "No internet connection available.",
};
const notificationErrorNoMessage: INotificationError = {
  type: NotificationTypeEnum.error,
};
storiesOf("ImageEditor", module)
  .add("default", () => (
    <ImageEditor
      onPublish={action("done-editing")}
      notification={makeNotificationNone()}
      onDismissNotification={action("dismiss notification")}
      loading={false}
    />
  ))
  .add("notification error and no message", () => (
    <ImageEditor
      onPublish={action("done-editing")}
      notification={notificationErrorNoMessage}
      onDismissNotification={action("dismiss notification")}
      loading={false}
    />
  ))
  .add("notification error with message", () => (
    <ImageEditor
      onPublish={action("done-editing")}
      notification={notificationError}
      onDismissNotification={action("dismiss notification")}
      loading={false}
    />
  ))
  .add("notification uploaded", () => (
    <ImageEditor
      onPublish={action("done-editing")}
      notification={notificationUploaded}
      onDismissNotification={action("dismiss notification")}
      loading={false}
    />
  ));
