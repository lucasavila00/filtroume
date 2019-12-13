import { DefaultButton, Stack } from "office-ui-fabric-react";
import React from "react";

export const InsertButtons: React.FunctionComponent<{
  onAddNewText: () => void;
}> = ({ onAddNewText }) => {
  return (
    <Stack horizontal={true} gap="s1" verticalAlign="center">
      <DefaultButton onClick={onAddNewText}>+ Text</DefaultButton>
      <DefaultButton>+ Image</DefaultButton>
    </Stack>
  );
};
