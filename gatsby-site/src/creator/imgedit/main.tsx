import { PrimaryButton, Stack } from "office-ui-fabric-react";
import React, { useState } from "react";
import useDimensions from "react-use-dimensions";
import { FabricEditingTypes, IFabricEditingText } from "../types";
import { CanvasEditor } from "./canvas";
import { EditGraphicButtons } from "./editGraphicButtons";
import { EditTextButtons } from "./editTextButtons";
import { makeEditingNone, unfocusOnCanvas } from "./helpers";
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
            // tslint:disable-next-line: no-console
            changeColor={console.warn}
            // tslint:disable-next-line: no-console
            deleteText={console.warn}
            // tslint:disable-next-line: no-console
            changeFont={console.warn}
            // tslint:disable-next-line: no-console
            changeShadowColor={console.warn}
            // tslint:disable-next-line: no-console
            changeShadowSize={console.warn}
            // tslint:disable-next-line: no-console
            changeStrokeColor={console.warn}
            // tslint:disable-next-line: no-console
            changeStrokeWidth={console.warn}
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
            // tslint:disable-next-line: no-console
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
        <div style={canvasSizerStyle} ref={ref}>
          {renderButtons()}
          {renderCanvas()}
        </div>
      </Stack>
    </>
  );
};
