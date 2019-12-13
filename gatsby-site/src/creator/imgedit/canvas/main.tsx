import React from "react";
import { FabricEditing } from "../../types";
import { CanvasEditor } from "./canvasEditor";

export const CanvasRenderer: React.FunctionComponent<{
  width?: number;
  changeFabricEditing: (editing: FabricEditing) => void;
}> = ({ width, changeFabricEditing }) => {
  // only renders if width is known

  if (width == null) {
    return <div />;
  } else {
    const canvasWrapperStyle = {
      display: "flex",
      justifyContent: "center",
    };
    const canvasBorderStyle = {
      width,
      height: width,
      borderColor: "rgba(0, 0, 0, 0.09)",
      borderStyle: "solid",
      borderWidth: 2,
    };
    return (
      <div style={canvasWrapperStyle}>
        <div style={canvasBorderStyle}>
          <CanvasEditor
            size={width}
            changeData={console.warn}
            changeEditing={changeFabricEditing}
          />
        </div>
      </div>
    );
  }
};
