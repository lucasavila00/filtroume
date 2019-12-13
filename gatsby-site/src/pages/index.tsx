import {
  FontWeights,
  initializeIcons,
  Link,
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
    <Stack verticalAlign="start" verticalFill={true} styles={appStyle}>
      <Stack
        horizontalAlign="end"
        styles={{ root: { marginTop: 8, marginRight: 16 } }}
      >
        <Link href="/creations">My Creations</Link>
      </Stack>

      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill={true}
        gap="m"
        padding="m"
      >
        <Text variant="xxLarge" styles={boldStyle}>
          FILTRE
        </Text>
        <Text variant="large">Unleash your creativity now!</Text>
        <PrimaryButton href="/create">CREATE NEW FILTER</PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default App;
