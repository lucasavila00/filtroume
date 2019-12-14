import { FontWeights, PrimaryButton, Text } from "office-ui-fabric-react";
import React, { CSSProperties } from "react";

const mainStyle: CSSProperties = {
  height: "100%",
  width: "100%",
};
const menuStyle: CSSProperties = {
  height: 32,
  width: "100%",
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.61)",
  position: "absolute",
};
const textStyle: CSSProperties = {
  height: 32,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const frameStyle: CSSProperties = {
  height: "100%",
  width: "100%",
};

const boldStyle = { root: { fontWeight: FontWeights.semibold } };

export const Previewer: React.FunctionComponent<{
  img: string;
  lut: string;
  finishPreviewing: () => void;
}> = ({ img, lut }) => {
  (window as any)._lut = lut;
  (window as any)._img = img;

  return (
    <div style={mainStyle}>
      <div style={menuStyle}>
        <PrimaryButton>Back</PrimaryButton>
        <div style={textStyle}>
          <Text styles={boldStyle}>Previewing</Text>
        </div>
      </div>
      <iframe frameBorder={0} style={frameStyle} src="/view/index.html" />
    </div>
  );
};
