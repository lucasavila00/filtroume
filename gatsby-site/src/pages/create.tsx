import {
  Button,
  Link,
  Persona,
  PersonaInitialsColor,
  PersonaPresence,
  PersonaSize,
  PrimaryButton,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React from "react";

import { ImageEditor } from "../creator/imgedit/main";
const imageStyles = {
  root: {
    height: "20vh",
    width: "20vh",
    backgroundColor: "rgba(255, 255, 255, 0.61)",
  },
};
const bgImageStyle = {
  root: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundImage:
      "url(https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-female.png)",
  },
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

const DefaultEditor: React.FunctionComponent<{
  onEditImage: () => void;
}> = ({ onEditImage }) => {
  const renderLuts = () => {
    return [1, 1, 1, 1, 1].map((_, index) => (
      <PlaceholderPersona key={index} index={index} />
    ));
  };

  return (
    <>
      <Stack
        horizontal={true}
        gap="m"
        horizontalAlign="space-between"
        verticalAlign="center"
      >
        <Link href="/">Filtre.me</Link>
        <Stack horizontal={true} gap="s1">
          <Button href="asdasd">Preview</Button>
          <PrimaryButton href="asdasd">Publish</PrimaryButton>
        </Stack>
      </Stack>

      <Stack
        verticalFill={true}
        verticalAlign="space-between"
        horizontalAlign="center"
        styles={bgImageStyle}
      >
        <Stack styles={imageStyles}>
          <Button onClick={onEditImage}>Image a</Button>
        </Stack>
        <Stack styles={imageStyles}>
          <Button>Image b</Button>
        </Stack>
      </Stack>
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
    </>
  );
};

const createCentralizeStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const Create: React.FunctionComponent = () => {
  const [editing, changeEditing] = React.useState(true);

  const startEditing = () => changeEditing(true);
  const finishEditing = () => changeEditing(false);

  const editor = () => {
    if (editing) {
      return <ImageEditor onDone={finishEditing} />;
    } else {
      return <DefaultEditor onEditImage={startEditing} />;
    }
  };
  return (
    <>
      <div style={createCentralizeStyle}>
        <Stack
          verticalFill={true}
          verticalAlign="space-between"
          padding="s1"
          styles={{ root: { maxHeight: "99vh", maxWidth: 720, width: "100%" } }}
          gap="s1"
        >
          {editor()}
        </Stack>
      </div>
    </>
  );
};

export default Create;
