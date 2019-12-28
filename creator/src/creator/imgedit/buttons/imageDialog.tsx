import { Dialog, PrimaryButton, Stack, Text } from "office-ui-fabric-react";
import React, { CSSProperties } from "react";
import { galleryImages } from "../../contants";

export const ImageDialog: React.FunctionComponent<{
  onAddNewImage: (url: string) => void;
  open: boolean;
  closeDialog: () => void;
  uploadImage: (image: File) => void;
}> = ({ onAddNewImage, open, closeDialog, uploadImage }) => {
  const modalProps = {
    isBlocking: false,
    // topOffsetFixed: true,
  };

  const renderChoices = () => {
    return galleryImages.map((opt, index) => {
      const onImageClicked = () => {
        onAddNewImage(opt.src);
        closeDialog();
      };
      return (
        <button
          key={opt.src + index}
          style={makeImageStyle(opt)}
          onClick={onImageClicked}
        />
      );
    });
  };

  const galleryStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "space-between",
  };
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const first = event?.target?.files?.[0];
    if (first != null) {
      uploadImage(first);
      closeDialog();
    }
  };
  return (
    <Dialog hidden={!open} onDismiss={closeDialog} modalProps={modalProps}>
      <Stack gap="s1">
        <div>
          <PrimaryButton>Upload Image</PrimaryButton>
          <input
            type="file"
            style={{ position: "absolute", top: 0, left: 0, opacity: 0 }}
            onChange={onFileChange}
          />
        </div>

        <Text variant="large">Gallery</Text>
        <div style={galleryStyle}>{renderChoices()}</div>
      </Stack>
    </Dialog>
  );
};
function makeImageStyle(opt: { src: string }): React.CSSProperties | undefined {
  return {
    backgroundImage: `url(${opt.src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: 64,
    height: 64,
    marginBottom: 16,
    borderRadius: 4,
  };
}
