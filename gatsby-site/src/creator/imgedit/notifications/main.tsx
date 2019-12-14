import {
  Dialog,
  DialogType,
  Link,
  PrimaryButton,
  Stack,
} from "office-ui-fabric-react";
import React from "react";
import { NotificationType, NotificationTypeEnum } from "../../types";

const copyToClipboard = (str: string) => {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

export const NotificationRenderer: React.FunctionComponent<{
  notification: NotificationType;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  switch (notification.type) {
    case NotificationTypeEnum.none: {
      return <></>;
    }

    case NotificationTypeEnum.error: {
      const dialogContentProps = {
        type: DialogType.normal,
        title: "Failed to publish",
        subText:
          notification.message ?? "An unkown error ocurred. Try again later.",
      };
      const modalProps = {
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      };
      return (
        <Dialog
          hidden={false}
          onDismiss={onDismiss}
          dialogContentProps={dialogContentProps}
          modalProps={modalProps}
        />
      );
    }

    case NotificationTypeEnum.uploaded: {
      const dialogContentProps = {
        type: DialogType.normal,
        title: "Share your filter",
      };
      const modalProps = {
        isBlocking: false,
        styles: { main: { maxWidth: 450 } },
      };
      const onCopy = () => copyToClipboard(notification.url);
      return (
        <Dialog
          hidden={false}
          onDismiss={onDismiss}
          dialogContentProps={dialogContentProps}
          modalProps={modalProps}
        >
          <Stack gap="m">
            <Link href={notification.url} target="_blank">
              {notification.url}
            </Link>
            <PrimaryButton onClick={onCopy}>Copy link</PrimaryButton>
          </Stack>
        </Dialog>
      );
    }
  }
};
