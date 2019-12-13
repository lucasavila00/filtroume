import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import { initializeIcons } from "office-ui-fabric-react";
import * as React from "react";
import { FabricEditingTypes, IFabricEditingText } from "../../types";
import { EditTextButtons } from "./editTextButtons";

initializeIcons(/* optional base url */);

const textInfo: IFabricEditingText = {
  type: FabricEditingTypes.text,
  color: "#ffffff",
  font: "sans-serif",
  strokeColor: "#ff0000",
  strokeWidth: 2,
  shadowSize: 5,
  shadowColor: "#000000",
};
storiesOf("EditTextButtons", module).add("with white color", () => (
  <div style={{ width: 360 }}>
    <EditTextButtons
      editorSize={360}
      info={textInfo}
      // tslint:disable-next-line: no-console
      finishEditing={action("finish-editing")}
      changeColor={action("change-color")}
      deleteText={action("delete-text")}
      changeFont={action("change-font")}
      changeShadowColor={action("change-shadow-color")}
      changeShadowSize={action("change-shadow-size")}
      changeStrokeColor={action("change-stroke-color")}
      changeStrokeWidth={action("change-stroke-width")}
    />
  </div>
));
