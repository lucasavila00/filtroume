import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { FabricEditingTypes, IFabricEditingImage } from "../../types";
import { EditGraphicButtons } from "./editGraphicButtons";
const imageInfo: IFabricEditingImage = {
  type: FabricEditingTypes.image,
  opacity: 0.75,
};
storiesOf("EditGraphicButtons", module).add("default edit", () => (
  <EditGraphicButtons
    editorSize={720}
    onDelete={action("delete-image")}
    onFinishEditing={action("finish-editing-image")}
    onChangeOpacity={action("change-opacity")}
    info={imageInfo}
  />
));
