import React from "react";
import { FabricEditing } from "../types";
import ReactDOM from "react-dom";
import { fabric } from "fabric";
import { registerCanvasOnWindow, getEditing } from "./helpers";

export class CanvasEditor extends React.Component<{
  size: number;
  changeData: (data: any) => void;
  changeEditing: (editing: FabricEditing) => void;
}> {
  public componentDidMount() {
    var el = ReactDOM.findDOMNode(this);
    var canvas = new fabric.Canvas(el as HTMLCanvasElement);
    registerCanvasOnWindow(canvas);
    const { size, changeData, changeEditing } = this.props;
    canvas.selection = false;
    canvas.setDimensions({ width: size, height: size });

    // // on mouse up lets save some state
    canvas.on("mouse:up", () => {
      changeData(canvas.toObject());
      changeEditing(getEditing(canvas.getActiveObject()));
    });

    // // an event we will fire when we want to save state
    canvas.on("saveData", () => {
      changeData(canvas.toObject());
      changeEditing(getEditing(canvas.getActiveObject()));
      canvas.renderAll(); // programatic changes we make will not trigger a render in fabric
    });
  }

  public render() {
    return <canvas></canvas>;
  }
}
