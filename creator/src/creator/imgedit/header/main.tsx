import {
  DefaultButton,
  Link,
  PrimaryButton,
  Spinner,
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
  const renderLoading = () => {
    if (!loading) {
      return <></>;
    }
    const fixLabelStyles = {
      label: {
        fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif;`,
        fontSize: 12,
      },
    };
    return (
      <Spinner
        label="Publishing"
        labelPosition="left"
        styles={fixLabelStyles}
      />
    );
  };

  return (
    <Stack
      horizontal={true}
      gap="m"
      horizontalAlign="space-between"
      verticalAlign="center"
    >
      <Link href="/">Filtrou.me</Link>
      <Stack horizontal={true} gap="s1">
        <NotificationRenderer
          notification={notification}
          onDismiss={onDismissNotification}
        />
        {renderLoading()}
        <DefaultButton onClick={startPreviewing}>Preview</DefaultButton>
        <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>
      </Stack>
    </Stack>
  );
};
