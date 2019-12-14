import React from "react";

export const Previewer: React.FunctionComponent<{
  img: string;
  lut: string;
  finishPreviewing: () => void;
}> = ({ img, lut }) => {
  console.log({ img, lut });
  return <div>nao implementado</div>;
};
