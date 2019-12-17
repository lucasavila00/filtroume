export interface IInfo {
  lut: {
    url: string;
    size: number;
  };
  images: {
    center: string;
  };
}
export const getInfo = (): IInfo => {
  const info = {
    lut: {
      url: "https://localhost:3007/lut0.png",
      size: 16,
    },
    images: {
      center: "https://picsum.photos/200",
    },
  };

  return info;
};
