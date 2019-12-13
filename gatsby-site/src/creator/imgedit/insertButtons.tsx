import { DefaultButton, Stack } from "office-ui-fabric-react";
import React from "react";
import { addNewText } from "./canvasController";

export const InsertButtons: React.FunctionComponent<{ size: number }> = ({
  size,
}) => {
  const addNew = () => addNewText(size);
  return (
    <Stack horizontal={true} gap="s1" verticalAlign="center">
      <DefaultButton onClick={addNew}>+ Text</DefaultButton>
      <DefaultButton>+ Image</DefaultButton>
    </Stack>
  );
};
