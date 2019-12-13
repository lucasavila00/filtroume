import { DefaultButton, Stack } from "office-ui-fabric-react";
import React, { useState } from "react";
import { ImageDialog } from "./imageDialog";

export const InsertButtons: React.FunctionComponent<{
  onAddNewText: () => void;
  onAddNewImage: (url: string) => void;
}> = ({ onAddNewText, onAddNewImage }) => {
  const [open, setOpenDialog] = useState(false);
  const closeDialog = () => setOpenDialog(false);
  const showDialog = () => setOpenDialog(true);

  return (
    <Stack horizontal={true} gap="s1" verticalAlign="center">
      <DefaultButton onClick={onAddNewText}>+ Text</DefaultButton>
      <DefaultButton onClick={showDialog}>+ Image</DefaultButton>
      <ImageDialog
        open={open}
        closeDialog={closeDialog}
        onAddNewImage={onAddNewImage}
      />
    </Stack>
  );
};
