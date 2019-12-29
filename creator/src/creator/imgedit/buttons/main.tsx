import React from "react";
import { FabricEditing, FabricEditingTypes } from "../../types";
import {
  addNewImage,
  addNewText,
  changeActiveImageOpacity,
  changeActiveTextColor,
  changeActiveTextFont,
  changeActiveTextShadoweColor,
  changeActiveTextShadowSize,
  changeActiveTextStrokeColor,
  changeActiveTextStrokeWidth,
  deleteActiveImage,
  deleteActiveText,
  uploadNewImage,
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
      const onAddNewText = () => addNewText({ canvasSize: width });
      const onAddNewImage = (url: string) =>
        addNewImage({ url, canvasSize: width });
      const onUploadImage = (image: File) => uploadNewImage(image, width);
      return (
        <InsertButtons
          onAddNewText={onAddNewText}
          onAddNewImage={onAddNewImage}
          onUploadImage={onUploadImage}
        />
      );
    }
    case FabricEditingTypes.text: {
      return (
        <EditTextButtons
          editorSize={width}
          info={fabricEditing}
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
      return (
        <EditGraphicButtons
          editorSize={width}
          onFinishEditing={finishEditing}
          onDelete={deleteActiveImage}
          info={fabricEditing}
          onChangeOpacity={changeActiveImageOpacity}
        />
      );
    }
  }
};
