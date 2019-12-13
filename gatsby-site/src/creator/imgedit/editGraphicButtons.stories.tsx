import { storiesOf } from "@storybook/react";
import * as React from "react";
import { EditGraphicButtons } from "./editGraphicButtons";

storiesOf("EditGraphicButtons", module).add("default", () => (
  <EditGraphicButtons size={720} />
));
