import React from "react"
import {
  Stack,
  Text,
  Link,
  FontWeights,
  PrimaryButton,
  IStackTokens,
} from "office-ui-fabric-react"

const boldStyle = { root: { fontWeight: FontWeights.semibold } }

const Login: React.FunctionComponent = () => {
  return (
    <Stack
      verticalAlign="start"
      verticalFill
      styles={{
        root: {
          margin: "0 auto",
          textAlign: "center",
          color: "#605e5c",
        },
      }}
    >
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill
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
  )
}

export default Login
