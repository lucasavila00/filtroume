import { DefaultButton, Stack } from "office-ui-fabric-react";
import React from "react";

export const EditGraphicButtons: React.FunctionComponent<{
  size: number;
}> = ({}) => {
  return (
    <Stack horizontal={true} gap="s1" verticalAlign="center">
      <DefaultButton>Edit image</DefaultButton>
    </Stack>
  );
};
