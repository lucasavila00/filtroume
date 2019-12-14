import {
  Persona,
  PersonaInitialsColor,
  PersonaPresence,
  PersonaSize,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React from "react";
import { luts } from "../../contants";

export const LutsPicker: React.FunctionComponent<{
  onChangeLut: (lut: string) => void;
  currentLut: string;
}> = ({ currentLut, onChangeLut }) => {
  const renderLuts = () => {
    return luts.map((src) => (
      <PlaceholderPersona
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

const PlaceholderPersona: React.FunctionComponent<{
  src: string;
  currentLut: string;
  onChangeLut: (lut: string) => void;
}> = ({ src, currentLut, onChangeLut }) => {
  const presence =
    src === currentLut ? PersonaPresence.online : PersonaPresence.none;
  const onClick = () => onChangeLut(src);
  return (
    <Persona
      onClick={onClick}
      initialsColor={PersonaInitialsColor.blue}
      size={PersonaSize.large}
      presence={presence}
      imageUrl={src}
      text=""
      hidePersonaDetails={true}
    />
  );
};
