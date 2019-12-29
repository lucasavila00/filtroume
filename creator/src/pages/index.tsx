import { PrimaryButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";
import SEO from "../components/seo";
import "../css/index.css";
import "../css/normalize.css";
import { appStyle, boldStyle } from "../utils/styles";

const App: React.FunctionComponent = () => {
  return (
    <>
      <SEO title="Home" />
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill={true}
        gap="m"
        padding="m"
        styles={appStyle}
      >
        <Text variant="xxLarge" styles={boldStyle}>
          FILTROU.ME
        </Text>
        <Text variant="large">Unleash your creativity now!</Text>
        <PrimaryButton href="/create">CREATE NEW FILTER</PrimaryButton>
      </Stack>
    </>
  );
};

export default App;
