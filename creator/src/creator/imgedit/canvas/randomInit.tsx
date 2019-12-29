import { addNewImage, addNewText } from "./canvasController";
interface IRandom {
  imgSrc: string;
  imgTop: number;
  imgLeft: number;
  textTop: number;
  textLeft: number;
  textContent: string;
  textColor: string;
}

const getRandomWanna = () => {
  const randoms = ["I wanna\nsleep", "I wanna\neat"];
  const index = Math.round(Math.random() * (randoms.length - 1));

  try {
    return randoms[index];
  } catch (err) {
    return randoms[0];
  }
};

const getRandomOneLine = () => {
  const randoms = ["Let's go!", "It's all set!"];
  const index = Math.round(Math.random() * (randoms.length - 1));

  try {
    return randoms[index];
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error(err);
    return randoms[0];
  }
};

const getRandom = ({ canvasSize }: { canvasSize: number }) => {
  const randoms: IRandom[] = [
    {
      imgSrc: "/gallery/baloon1.png",
      imgTop: 0,
      imgLeft: 0,
      textTop: canvasSize / 16,
      textLeft: canvasSize / 16,
      textContent: getRandomWanna(),
      textColor: "black",
    },
    {
      imgSrc: "/gallery/cloud2.png",
      imgTop: 0,
      imgLeft: canvasSize / 4,
      textTop: canvasSize / 7,
      textLeft: canvasSize / 4 + canvasSize / 16,
      textContent: getRandomOneLine(),
      textColor: "white",
    },
  ];

  const index = Math.round(Math.random() * (randoms.length - 1));
  try {
    return randoms[index];
  } catch (err) {
    return randoms[0];
  }
};

export const randomInit = async ({ canvasSize }: { canvasSize: number }) => {
  const random = getRandom({ canvasSize });

  await addNewImage({
    url: random.imgSrc,
    canvasSize,
    top: random.imgTop,
    left: random.imgLeft,
  });
  addNewText({
    canvasSize,
    text: random.textContent,
    top: random.textTop,
    left: random.textLeft,
    fill: random.textColor,
  });
};
