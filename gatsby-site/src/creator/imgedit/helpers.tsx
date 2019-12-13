import { fabric } from "fabric";
import {
  FabricEditing,
  FabricEditingTypes,
  IFabricEditingNone,
} from "../types";

export const makeEditingNone = (): IFabricEditingNone => ({
  type: FabricEditingTypes.none,
});

export const CANVAS_KEY = "_fabric_canvas";
export const castedCanvas = () => (window as any)[CANVAS_KEY] as fabric.Canvas;
export const registerCanvasOnWindow = (canvas: fabric.Canvas) => {
  (window as any)[CANVAS_KEY] = canvas;
};
export const addNewText = (canvasSize: number) => {
  const defaultFontSize = 36;
  const canvas = castedCanvas();

  canvas.add(
    new fabric.IText("Sample Text", {
      top: canvasSize / 3,
      left: canvasSize / 3,
      fontSize: defaultFontSize,
      textAlign: "center",
      fontFamily: "sans-serif",
      fill: "red",
    }),
  );
  canvas.setActiveObject(canvas.getObjects()[0]);

  // when we are done makeing changes send the state from fabric
  canvas.fire("saveData", {});
};

export const changeActiveTextColor = (color: string) => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();

  if (obj == null) {
    return;
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText;
    textobj.set("fill", color);
    canvas.fire("saveData", {});
  }
};
// const changeActiveTextFontSize = (fontSize: number) => {
//   const canvas = castedCanvas()
//   const obj = canvas.getActiveObject()

//   if (obj == null || obj == undefined) {
//     return
//   }

//   if (obj.isType("i-text")) {
//     const textobj = obj as fabric.IText
//     textobj.fontSize = fontSize
//     canvas.fire("saveData", {})
//   }
//   // if (active )
// }
export const unfocusOnCanvas = () => {
  const canvas = castedCanvas();
  canvas.discardActiveObject();
  canvas.fire("saveData", {});
};
export const getEditing = (obj: fabric.Object): FabricEditing => {
  if (obj == null) {
    return makeEditingNone();
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText;
    // console.log({ obj });

    return {
      type: FabricEditingTypes.text,
      color: textobj.fill!,
    };
  }
  return makeEditingNone();
};

export const capText = (text: string): string => {
  const CAP_LIMIT = 8;
  const LIMITER = "...";

  if (text.length <= CAP_LIMIT) {
    return text;
  } else {
    return text.substr(0, CAP_LIMIT - LIMITER.length) + LIMITER;
  }
};
