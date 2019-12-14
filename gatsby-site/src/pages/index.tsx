import {
  FontWeights,
  initializeIcons,
  PrimaryButton,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React from "react";
import "./index.css";
import "./normalize.css";
initializeIcons(/* optional base url */);
const boldStyle = { root: { fontWeight: FontWeights.semibold } };
const appStyle = {
  root: {
    margin: "0 auto",
    textAlign: "center",
    color: "#605e5c",
  },
};

const App: React.FunctionComponent = () => {
  return (
    <Stack
      horizontalAlign="center"
      verticalAlign="center"
      verticalFill={true}
      gap="m"
      padding="m"
      styles={appStyle}
    >
      <Text variant="xxLarge" styles={boldStyle}>
        FILTRE
      </Text>
      <Text variant="large">Unleash your creativity now!</Text>
      <PrimaryButton href="/create">CREATE NEW FILTER</PrimaryButton>
      <Text variant="medium">
        todo: create an instagram or snap like filter
      </Text>
    </Stack>
  );
};

export default App;
