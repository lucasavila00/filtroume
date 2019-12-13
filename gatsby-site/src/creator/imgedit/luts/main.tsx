import {
  Persona,
  PersonaInitialsColor,
  PersonaPresence,
  PersonaSize,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React from "react";

export const LutsPicker: React.FunctionComponent<{}> = ({}) => {
  const renderLuts = () => {
    return [1, 1, 1, 1, 1].map((_, index) => (
      <PlaceholderPersona key={index} index={index} />
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

const PlaceholderPersona: React.FunctionComponent<{ index: number }> = ({
  index,
}) => {
  return (
    <Persona
      initialsColor={PersonaInitialsColor.blue}
      size={PersonaSize.large}
      presence={index === 0 ? PersonaPresence.online : PersonaPresence.none}
      imageUrl="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-female.png"
      text=""
      hidePersonaDetails={true}
    />
  );
};
