import { fabric } from "fabric";
import React from "react";
import ReactDOM from "react-dom";
import { FabricEditing } from "../types";
import {
  getEditingTypeAndData,
  registerCanvasOnWindow,
} from "./canvasController";

export class CanvasEditor extends React.Component<{
  size: number;
  /// store the state of the canvas when changes happen
  changeData: (data: any) => void;
  changeEditing: (editing: FabricEditing) => void;
}> {
  public componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    const canvas = new fabric.Canvas(el as HTMLCanvasElement);
    registerCanvasOnWindow(canvas);
    const { size, changeData, changeEditing } = this.props;
    canvas.selection = false;
    canvas.setDimensions({ width: size, height: size });

    // // on mouse up lets save some state
    canvas.on("mouse:up", () => {
      changeData(canvas.toObject());
      changeEditing(getEditingTypeAndData(canvas.getActiveObject()));
    });

    // // an event we will fire when we want to save state
    canvas.on("saveData", () => {
      changeData(canvas.toObject());
      changeEditing(getEditingTypeAndData(canvas.getActiveObject()));
      canvas.renderAll(); // programatic changes we make will not trigger a render in fabric
    });
  }

  public render() {
    return <canvas />;
  }
}
