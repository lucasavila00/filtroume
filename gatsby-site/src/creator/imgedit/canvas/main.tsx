import React, { CSSProperties } from "react";
import { FabricEditing } from "../../types";
import { CanvasEditor } from "./canvasEditor";

export const CanvasRenderer: React.FunctionComponent<{
  width?: number;
  changeFabricEditing: (editing: FabricEditing) => void;
  backgroundImage: string;
}> = ({ width, changeFabricEditing, backgroundImage }) => {
  // only renders if width is known

  if (width == null) {
    return <div />;
  } else {
    const canvasWrapperStyle: CSSProperties = {
      display: "flex",
      justifyContent: "center",
      position: "relative",
    };
    const canvasBorderStyle: CSSProperties = {
      width,
      height: width,
    };

    const canvasBgStyle: CSSProperties = {
      width,
      height: width,
      backgroundImage: `url(${backgroundImage})`,
      backgroundPositionX: "center",
      backgroundPositionY: "center",
      backgroundSize: "cover",
      opacity: 0.39,
      position: "absolute",
      zIndex: -1,
    };
    return (
      <div style={canvasWrapperStyle}>
        <div style={canvasBorderStyle}>
          <CanvasEditor size={width} changeEditing={changeFabricEditing} />
        </div>
        <div style={canvasBgStyle} />
      </div>
    );
  }
};
