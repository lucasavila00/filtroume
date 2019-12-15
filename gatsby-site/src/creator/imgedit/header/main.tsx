import {
  DefaultButton,
  Link,
  PrimaryButton,
  Stack,
} from "office-ui-fabric-react";
import React from "react";
import { NotificationType } from "../../types";
import { NotificationRenderer } from "../notifications/main";

export const Header: React.FunctionComponent<{
  notification: NotificationType;
  onDismissNotification: () => void;
  startPreviewing: () => void;
  onPublish: () => void;
  loading: boolean;
}> = ({
  notification,
  onDismissNotification,
  startPreviewing,
  onPublish,
  loading,
}) => {
  console.log(loading);
  return (
    <Stack
      horizontal={true}
      gap="m"
      horizontalAlign="space-between"
      verticalAlign="center"
    >
      <Link href="/">Filtre.me</Link>
      <Stack horizontal={true} gap="s1">
        <NotificationRenderer
          notification={notification}
          onDismiss={onDismissNotification}
        />
        <DefaultButton onClick={startPreviewing}>Preview</DefaultButton>
        <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>
      </Stack>
    </Stack>
  );
};
