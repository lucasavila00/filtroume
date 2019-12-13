import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { ImageEditor } from "./main";

storiesOf("ImageEditor", module).add("default", () => (
  <ImageEditor onDone={action("done-editing")} />
));
