import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { ImageEditor } from "./main";

storiesOf("ImageEditor", module).add("default", () => (
  <div style={{ width: 360 }}>
    <ImageEditor onDone={action("done-editing")} />
  </div>
));
