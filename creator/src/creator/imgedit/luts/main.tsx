import { Stack, Text } from "office-ui-fabric-react";
import React, { CSSProperties } from "react";
import { luts } from "../../constants";

export const LutsPicker: React.FunctionComponent<{
  onChangeLut: (lut: string) => void;
  currentLut: string;
}> = ({ currentLut, onChangeLut }) => {
  const renderLuts = () => {
    return luts.map((src) => (
      <LutBall
        key={src}
        src={src}
        currentLut={currentLut}
        onChangeLut={onChangeLut}
      />
    ));
  };

  return (
    <Stack>
      <Text variant="xLarge" styles={{ root: { marginBottom: 16 } }}>
        Color filter
      </Text>
      <Stack
        horizontal={true}
        gap="m"
        styles={{ root: { overflowX: "scroll", overflowY: "hidden" } }}
      >
        {renderLuts()}
      </Stack>
    </Stack>
  );
};

const lutButtonStyle: CSSProperties = {
  width: 64,
  height: 64,
  padding: 0,
  border: "none",
  background: "none",
  backgroundColor: "red",
  borderRadius: "100%",
  backgroundPosition: "center",
  backgroundSize: "cover",
  boxShadow: "2px 2px 4px 4px rgba(0, 0, 0, 0.1)",
};

const beingUsedStyle: CSSProperties = {
  width: 16,
  height: 16,
  backgroundColor: "green",
  borderRadius: "100%",
  position: "absolute",
  bottom: 4,
  right: 4,
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 12,
};

const lutBallWrapperStyle: CSSProperties = {
  position: "relative",
};
const getButtonExtraStyles = (used: boolean): CSSProperties => {
  if (!used) {
    return {};
  } else {
    return {
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "green",
    };
  }
};
const LutBall: React.FunctionComponent<{
  src: string;
  currentLut: string;
  onChangeLut: (lut: string) => void;
}> = ({ src, currentLut, onChangeLut }) => {
  const isBeingUsed = src === currentLut;

  const onClick = () => onChangeLut(src);

  const renderBeingUsed = () => {
    if (isBeingUsed) {
      return <div style={beingUsedStyle}>✓</div>;
    } else {
      return null;
    }
  };

  const extraStyles = getButtonExtraStyles(isBeingUsed);
  const btnStyle = {
    ...lutButtonStyle,
    backgroundImage: `url("${src}")`,
    ...extraStyles,
  };
  return (
    <div style={lutBallWrapperStyle}>
      {renderBeingUsed()}
      <button onClick={onClick} style={btnStyle} />
    </div>
  );
};
