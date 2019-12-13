import {
  FontWeights,
  PrimaryButton,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React from "react";

const boldStyle = { root: { fontWeight: FontWeights.semibold } };
const loginStyle = {
  root: {
    margin: "0 auto",
    textAlign: "center",
    color: "#605e5c",
  },
};

const Login: React.FunctionComponent = () => {
  return (
    <Stack verticalAlign="start" verticalFill={true} styles={loginStyle}>
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill={true}
        gap="m"
        padding="m"
      >
        <Text variant="xLarge" styles={boldStyle}>
          Login
        </Text>
        <PrimaryButton href="/create">Facebook Login</PrimaryButton>
        <PrimaryButton href="/create">Google Login</PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default Login;
