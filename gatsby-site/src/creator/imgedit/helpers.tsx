import {
  FabricEditingTypes,
  IFabricEditingNone,
  INotificationNone,
  NotificationTypeEnum,
} from "../types";

export const makeEditingNone = (): IFabricEditingNone => ({
  type: FabricEditingTypes.none,
});
export const makeNotificationNone = (): INotificationNone => ({
  type: NotificationTypeEnum.none,
});

export const capText = (text: string): string => {
  const CAP_LIMIT = 8;
  const LIMITER = "...";

  if (text.length <= CAP_LIMIT) {
    return text;
  } else {
    return text.substr(0, CAP_LIMIT - LIMITER.length) + LIMITER;
  }
};

const lutSize = 16;
export const extractLut = (lut: string): Promise<string> => {
  // const imgLoader = new THREE.ImageLoader();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = lutSize * lutSize;
  const height = lutSize;
  const image = new Image();

  return new Promise<string>((rs) => {
    image.onload = () => {
      if (ctx) {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0);
        const url = canvas.toDataURL();
        rs(url);
      }
    };

    image.src = lut;
  });
};
