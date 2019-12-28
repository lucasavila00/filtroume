import { fabric } from "fabric";
import React from "react";
import ReactDOM from "react-dom";
import { FabricEditing } from "../../types";
import {
  getEditingTypeAndData,
  registerCanvasOnWindow,
} from "./canvasController";

/// a class is used to have lifecycle control over fabricjs
export class CanvasEditor extends React.Component<{
  size: number;
  /// store the state of the canvas when changes happen
  // changeData: (data: any) => void;
  changeEditing: (editing: FabricEditing) => void;
}> {
  public componentDidMount() {
    // const isSSR = typeof window === "undefined";

    // if (isSSR) {
    //   return;
    // }
    const el = ReactDOM.findDOMNode(this);
    const canvas = new fabric.Canvas(el as HTMLCanvasElement);
    registerCanvasOnWindow(canvas);
    const { size, changeEditing } = this.props;
    canvas.selection = false;
    canvas.setDimensions({ width: size, height: size });

    // // on mouse up lets save some state
    canvas.on("mouse:up", () => {
      // changeData(canvas.toObject());
      changeEditing(getEditingTypeAndData(canvas.getActiveObject()));
    });

    // // an event we will fire when we want to save state
    canvas.on("saveData", () => {
      // changeData(canvas.toObject());
      changeEditing(getEditingTypeAndData(canvas.getActiveObject()));
      canvas.renderAll(); // programatic changes we make will not trigger a render in fabric
    });

    canvas.on("object:selected", (options) => {
      options?.target?.bringToFront();
    });
  }

  public render() {
    return <canvas />;
  }
}
