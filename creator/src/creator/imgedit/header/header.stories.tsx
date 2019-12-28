import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { makeNotificationNone } from "../helpers";
import { Header } from "./main";

storiesOf("Header", module)
  .add("loading", () => (
    <Header
      notification={makeNotificationNone()}
      onDismissNotification={action("onDismissNotification")}
      startPreviewing={action("startPreviewing")}
      onPublish={action("onPublish")}
      loading={true}
    />
  ))
  .add("not loading", () => (
    <Header
      notification={makeNotificationNone()}
      onDismissNotification={action("onDismissNotification")}
      startPreviewing={action("startPreviewing")}
      onPublish={action("onPublish")}
      loading={false}
    />
  ));
