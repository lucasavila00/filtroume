export const flipAndAddText = (
  png: string,
  url?: string,
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const image = new Image();

  return new Promise<string>(rs => {
    image.onload = () => {
      if (ctx) {
        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;

        ctx.translate(image.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0);
        if (url) {
          ctx.translate(image.width, 0);
          ctx.scale(-1, 1);

          ctx!.font = "24px sans-serif";
          ctx!.fillStyle = "#ccc";
          ctx!.textAlign = "start";

          ctx!.fillText(url, 8, 24);
        }

        const newData = canvas.toDataURL();
        rs(newData);
      }
    };

    image.src = png;
  });
};

export const registerDownloadButton = ({
  buttonId,
  renderer,
  url,
}: {
  buttonId: string;
  renderer: THREE.WebGLRenderer;
  url?: string;
}) => {
  const takeScreenshot = async () => {
    // For screenshots to work with WebGL renderer, preserveDrawingBuffer should be set to true.
    // download file like this.
    const invertedData = renderer.domElement.toDataURL();

    const dataUrl = await flipAndAddText(invertedData, url);

    try {
      const blob = await fetch(dataUrl).then(res =>
        res.blob(),
      );
      const file = new File([blob], "image.png");

      const filesArray = [file];
      if (
        navigator.canShare &&
        navigator.canShare({ files: filesArray })
      ) {
        console.log("can share");
        await navigator.share({
          files: filesArray,
          title: "Filtrou.me photo",
        });
      } else {
        console.log("cannot share");
        doDownload(dataUrl);
      }
    } catch (err) {
      console.error(err);
      console.log("got error");

      doDownload(dataUrl);
    }
  };
  const btn = document.getElementById(
    buttonId,
  ) as HTMLButtonElement;

  // ugly hack to fix threejs (or threejs postprocessing lib, IDK which is broken)
  // clearing the canvas and making download impossible
  btn.onclick = () => {
    (window as any).dlnow = () => takeScreenshot();
  };
};
function doDownload(dataUrl: string) {
  const a = document.createElement("a");
  a!.href = dataUrl.replace(
    "image/png",
    "image/octet-stream",
  );
  const id = new Date().getTime() % 10000;
  a!.download = "img" + id + ".png";
  a!.click();
}
