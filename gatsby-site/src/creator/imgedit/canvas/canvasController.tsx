import { fabric } from "fabric";
import { FabricEditing, FabricEditingTypes } from "../../types";
import { makeEditingNone } from "../helpers";

// access the canvas via a global
const CANVAS_KEY = "_fabric_canvas";
const castedCanvas = () => (window as any)[CANVAS_KEY] as fabric.Canvas;
export const registerCanvasOnWindow = (canvas: fabric.Canvas) => {
  (window as any)[CANVAS_KEY] = canvas;
};

// text constants
const defaultFontSize = 36;
const defaultFontFamily = "sans-serif";
const defaultTextColor = "white";
const defaultShadowColor = "black";
const defaultStrokeColor = "black";
const defaultStrokeWidth = 1;
const defaultShadowSize = 16;

const generateShadow = (color: string, size: number) =>
  `${color} ${Math.round(size / 4)}px ${Math.round(size / 2)}px ${Math.round(
    size,
  )}px`;

let counter = 0;
const getId = () => {
  const id = "id-" + counter;

  counter++;
  return id;
};
// create objects
export const addNewText = (canvasSize: number) => {
  const canvas = castedCanvas();
  const nameId = getId();
  canvas.add(
    new fabric.IText("Sample Text", {
      name: nameId,
      top: canvasSize / 3,
      left: canvasSize / 3,
      textAlign: "center",
      fontSize: defaultFontSize,
      fontFamily: defaultFontFamily,
      fill: defaultTextColor,
      stroke: defaultStrokeColor,
      strokeWidth: defaultStrokeWidth,
      shadow: generateShadow(defaultShadowColor, defaultShadowSize),
    }),
  );
  // TODO nao ta ativando o criado!!!
  canvas.getObjects().forEach((o) => {
    if (o.name === nameId) {
      canvas.setActiveObject(o);
    }
  });

  // when we are done makeing changes send the state from fabric
  canvas.fire("saveData", {});
};

export const addNewImage = (url: string, canvasSize: number) => {
  const canvas = castedCanvas();
  const nameId = getId();

  fabric.Image.fromURL(url, (oImg) => {
    // scale image down, and flip it, before adding it onto canvas
    // oImg.scale(0.5).set("flipX", true);
    oImg.set("name", nameId);
    oImg.set("top", canvasSize / 3);
    oImg.set("left", canvasSize / 3);
    canvas.add(oImg);
    canvas.getObjects().forEach((o) => {
      if (o.name === nameId) {
        canvas.setActiveObject(o);
      }
    });

    // when we are done makeing changes send the state from fabric
    canvas.fire("saveData", {});
  });
};

// handle focus
export const unfocusOnCanvas = () => {
  const canvas = castedCanvas();
  canvas.discardActiveObject();
  canvas.fire("saveData", {});
};

export const getEditingTypeAndData = (obj: fabric.Object): FabricEditing => {
  if (obj == null) {
    return makeEditingNone();
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText;
    // console.log({ obj });

    return {
      type: FabricEditingTypes.text,
      color: String(textobj.fill ?? defaultTextColor),
      font: textobj.fontFamily ?? defaultFontFamily,
      strokeColor: textobj.stroke ?? defaultStrokeColor,
      strokeWidth: textobj.strokeWidth ?? defaultStrokeWidth,
      shadowColor: getColorFromShadow(String(textobj.shadow)),
      shadowSize: getSizeFromShadow(String(textobj.shadow)),
    };
  }

  if (obj.isType("image")) {
    const imgobj = obj as fabric.Image;
    // console.log({ obj });

    return {
      type: FabricEditingTypes.image,
      opacity: imgobj.opacity ?? 1,
    };
  }
  return makeEditingNone();
};

// changes on active text
export const changeActiveText = (cb: (obj: fabric.IText) => void) => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();

  if (obj == null) {
    return;
  }

  if (obj.isType("i-text")) {
    const textobj = obj as fabric.IText;
    cb(textobj);
    canvas.fire("saveData", {});
  }
};

export const changeActiveTextColor = (color: string) => {
  changeActiveText((textobj) => {
    textobj.set("fill", color);
  });
};

export const changeActiveTextFont = (font: string) => {
  changeActiveText((textobj) => {
    textobj.set("fontFamily", font);
  });
};

export const changeActiveTextStrokeWidth = (width: number) => {
  changeActiveText((textobj) => {
    textobj.set("strokeWidth", width);
  });
};

export const changeActiveTextStrokeColor = (color: string) => {
  changeActiveText((textobj) => {
    textobj.set("stroke", color);
  });
};

const getColorFromShadow = (shadow: string): string => {
  const arr = shadow.split(" ");
  const color = arr[3];
  return color;
};

const getSizeFromShadow = (shadow: string): number => {
  const arr = shadow.split(" ");
  const withpx = arr[2];
  const size = withpx.substr(0, withpx.length - 2);

  const maybeInt = parseInt(size, 10);
  if (isNaN(maybeInt)) {
    return 2;
  }
  return maybeInt;
};

export const changeActiveTextShadowSize = (size: number) => {
  changeActiveText((textobj) => {
    const color = getColorFromShadow(String(textobj.shadow));
    textobj.set("shadow", generateShadow(color, Math.round(size)));
  });
};

export const changeActiveTextShadoweColor = (color: string) => {
  changeActiveText((textobj) => {
    const size = getSizeFromShadow(String(textobj.shadow));
    textobj.set("shadow", generateShadow(color, size));
  });
};

export const deleteActiveText = () => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();

  if (obj == null) {
    return;
  }

  if (obj.isType("i-text")) {
    canvas.remove(obj);
    canvas.fire("saveData", {});
  }
};

// changes on active image

export const changeActiveImage = (cb: (obj: fabric.Image) => void) => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();

  if (obj == null) {
    return;
  }

  if (obj.isType("image")) {
    const textobj = obj as fabric.Image;
    cb(textobj);
    canvas.fire("saveData", {});
  }
};

export const changeActiveImageOpacity = (opacity: number) => {
  changeActiveImage((img) => {
    img.set("opacity", opacity);
  });
};

export const deleteActiveImage = () => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();

  if (obj == null) {
    return;
  }

  if (obj.isType("image")) {
    canvas.remove(obj);
    canvas.fire("saveData", {});
  }
};
