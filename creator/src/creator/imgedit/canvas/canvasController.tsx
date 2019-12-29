import { fabric } from "fabric";
// import FontFaceObserver from "fontfaceobserver";
import { FabricEditing, FabricEditingTypes } from "../../types";
import { flipPng, makeEditingNone } from "../helpers";
// access the canvas via a global
const CANVAS_KEY = "_fabric_canvas";
const castedCanvas = () => (window as any)[CANVAS_KEY] as fabric.Canvas;
export const registerCanvasOnWindow = (canvas: fabric.Canvas) => {
  (window as any)[CANVAS_KEY] = canvas;
};

// text constants
// const defaultFontSize = 36;
const defaultFontFamily = "sans-serif";
const defaultTextColor = "black";
const defaultShadowColor = "black";
const defaultStrokeColor = "black";
const defaultStrokeWidth = 0;
const defaultShadowSize = 0;

export const generateShadow = (color: string, size: number) =>
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
export const addNewText = ({
  canvasSize,
  text = "Sample text",
  top,
  left,
  fontFamily,
  fill,
  stroke,
  shadow,
  strokeWidth,
}: {
  canvasSize: number;
  text?: string;
  top?: number;
  left?: number;
  strokeWidth?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  shadow?: string;
}) => {
  const canvas = castedCanvas();
  const nameId = getId();
  canvas.add(
    new fabric.IText(text, {
      name: nameId,
      top: top ?? canvasSize / 4,
      left: left ?? canvasSize / 4,
      textAlign: "center",
      fontSize: canvasSize / 10,
      fontFamily: fontFamily ?? defaultFontFamily,
      fill: fill ?? defaultTextColor,
      stroke: stroke ?? defaultStrokeColor,
      strokeWidth: strokeWidth ?? defaultStrokeWidth,
      shadow: shadow ?? generateShadow(defaultShadowColor, defaultShadowSize),
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

export const addNewImage = ({
  url,
  canvasSize,
  top,
  left,
}: {
  url: string;
  canvasSize: number;
  top?: number;
  left?: number;
}): Promise<void> => {
  const canvas = castedCanvas();
  const nameId = getId();

  return new Promise((rs) => {
    fabric.Image.fromURL(
      url,
      (oImg) => {
        // scale image down, and flip it, before adding it onto canvas
        // oImg.scale(0.5).set("flipX", true);

        const originalWidth = oImg.width ?? 512;

        const newWidth = canvasSize / 2;

        const factor = newWidth / originalWidth;

        oImg.set("width", oImg.width ?? 512);
        oImg.set("height", oImg.height ?? 512);
        oImg.set("scaleX", factor);
        oImg.set("scaleY", factor);
        oImg.set("name", nameId);
        oImg.set("top", top ?? canvasSize / 4);
        oImg.set("left", left ?? canvasSize / 4);
        canvas.add(oImg);
        canvas.getObjects().forEach((o) => {
          if (o.name === nameId) {
            canvas.setActiveObject(o);
          }
        });

        // when we are done makeing changes send the state from fabric
        canvas.fire("saveData", {});
        rs();
      },
      { crossOrigin: "anonymous" },
    );
  });
};
export const uploadNewImage = (file: File, canvasSize: number) => {
  const reader = new FileReader();

  // reader.readAsDataURL(file);
  reader.onload = (e) => {
    const data = String(e?.target?.result ?? "");
    addNewImage({ url: data, canvasSize });
  };

  reader.readAsDataURL(file);
};
// handle focus
export const unfocusOnCanvas = () => {
  const canvas = castedCanvas();
  const obj = canvas.getActiveObject();
  // it will not go to front if only discarded...
  obj.bringToFront();
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
  changeActiveText(async (textobj) => {
    // const myfont = new FontFaceObserver(font);
    // await myfont.load();
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

export const exportCanvasAsPng = async (canvasSize: number) => {
  const canvas = castedCanvas();
  const desiredSize = 1024;
  const multiplier = desiredSize / canvasSize;
  const png = canvas.toDataURL({
    format: "png",

    multiplier,
  });

  const flipped = await flipPng(png);

  return flipped;
};
