import { PrimaryButton, Stack } from "office-ui-fabric-react";
import React, { useState } from "react";
import useDimensions from "react-use-dimensions";
import { FabricEditingTypes, IFabricEditingText } from "../types";
import { CanvasEditor } from "./canvas";
import {
  changeActiveTextColor,
  changeActiveTextFont,
  changeActiveTextShadoweColor,
  changeActiveTextShadowSize,
  changeActiveTextStrokeColor,
  changeActiveTextStrokeWidth,
  deleteActiveText,
  unfocusOnCanvas,
} from "./canvasController";
import { EditGraphicButtons } from "./editGraphicButtons";
import { EditTextButtons } from "./editTextButtons";
import { makeEditingNone } from "./helpers";
import { InsertButtons } from "./insertButtons";

export const ImageEditor: React.FunctionComponent<{ onDone: () => void }> = ({
  onDone,
}) => {
  const [ref, { width }] = useDimensions();
  const [fabricEditing, changeFabricEditing] = useState({
    type: FabricEditingTypes.none,
  });
  const finishEditing = () => {
    changeFabricEditing(makeEditingNone());
    unfocusOnCanvas();
  };
  const renderButtons = () => {
    if (width == null) {
      // only renders if width is known

      return <div />;
    }
    switch (fabricEditing.type) {
      case FabricEditingTypes.none: {
        return <InsertButtons size={width} />;
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

  const renderCanvas = () => {
    // only renders if width is known

    if (width == null) {
      return <div />;
    } else {
      const canvasBorderStyle = {
        width,
        height: width,
        borderColor: "rgba(0, 0, 0, 0.09)",
        borderStyle: "solid",
        borderWidth: 2,
      };
      return (
        <div style={canvasBorderStyle}>
          <CanvasEditor
            size={width}
            changeData={console.warn}
            changeEditing={changeFabricEditing}
          />
        </div>
      );
    }
  };
  const canvasSizerStyle = {
    width: "100%",
  };
  return (
    <>
      <Stack
        horizontal={true}
        gap="m"
        horizontalAlign="end"
        verticalAlign="center"
      >
        <PrimaryButton onClick={onDone}>Save</PrimaryButton>
      </Stack>
      <Stack verticalFill={true} gap="m">
        {renderButtons()}
        {renderCanvas()}
      </Stack>
      <div style={canvasSizerStyle} ref={ref} />
    </>
  );
};
