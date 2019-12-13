import React from "react";
import {
  FabricEditing,
  FabricEditingTypes,
  IFabricEditingText,
} from "../../types";
import {
  addNewText,
  changeActiveTextColor,
  changeActiveTextFont,
  changeActiveTextShadoweColor,
  changeActiveTextShadowSize,
  changeActiveTextStrokeColor,
  changeActiveTextStrokeWidth,
  deleteActiveText,
} from "../canvas/canvasController";
import { EditGraphicButtons } from "./editGraphicButtons";
import { EditTextButtons } from "./editTextButtons";
import { InsertButtons } from "./insertButtons";

export const ImageEditorButtons: React.FunctionComponent<{
  width?: number;
  fabricEditing: FabricEditing;
  finishEditing: () => void;
}> = ({ width, fabricEditing, finishEditing }) => {
  if (width == null) {
    // only renders if width is known

    return <div />;
  }
  switch (fabricEditing.type) {
    case FabricEditingTypes.none: {
      const onAddNewText = () => addNewText(width);
      return <InsertButtons onAddNewText={onAddNewText} />;
    }
    case FabricEditingTypes.text: {
      return (
        <EditTextButtons
          editorSize={width}
          info={fabricEditing as IFabricEditingText}
          finishEditing={finishEditing}
          changeColor={changeActiveTextColor}
          changeFont={changeActiveTextFont}
          deleteText={deleteActiveText}
          changeShadowColor={changeActiveTextShadoweColor}
          changeShadowSize={changeActiveTextShadowSize}
          changeStrokeColor={changeActiveTextStrokeColor}
          changeStrokeWidth={changeActiveTextStrokeWidth}
        />
      );
    }

    case FabricEditingTypes.image: {
      return <EditGraphicButtons size={width} />;
    }
  }
};
