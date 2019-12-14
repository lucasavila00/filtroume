import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { ImageDialog } from "./imageDialog";

storiesOf("Image Dialog", module).add("default", () => (
  <ImageDialog
    open={true}
    onAddNewImage={action("add new image")}
    closeDialog={action("close dialog")}
    uploadImage={action("upload image")}
  />
));
