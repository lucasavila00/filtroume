import React from "react"
import {
  Stack,
  Text,
  Link,
  FontWeights,
  PrimaryButton,
  IStackTokens,
} from "office-ui-fabric-react"
import "./index.css"
import "./normalize.css"
import { initializeIcons } from "office-ui-fabric-react/lib/Icons"
initializeIcons(/* optional base url */)
const boldStyle = { root: { fontWeight: FontWeights.semibold } }

const App: React.FunctionComponent = () => {
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
        horizontalAlign="end"
        styles={{ root: { marginTop: 8, marginRight: 16 } }}
      >
        <Link href="/creations">My Creations</Link>
      </Stack>

      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill
        gap="m"
        padding="m"
      >
        <Text variant="xxLarge" styles={boldStyle}>
          FILTRE
        </Text>
        <Text variant="large">Unleash your creativity now!</Text>
        <PrimaryButton href="/create">CREATE NEW FILTER</PrimaryButton>
      </Stack>

      {/* <Stack horizontal gap={15} horizontalAlign="center">
        <Link href="https://stackoverflow.com/questions/tagged/office-ui-fabric">
          Stack Overflow
        </Link>
        <Link href="https://github.com/officeDev/office-ui-fabric-react/">
          Github
        </Link>
        <Link href="https://twitter.com/officeuifabric">Twitter</Link>
      </Stack> */}
    </Stack>
  )
}

export default App
