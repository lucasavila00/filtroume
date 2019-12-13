import { Button, Link, PrimaryButton, Stack } from "office-ui-fabric-react";
import React, { useState } from "react";
import useDimensions from "react-use-dimensions";
import { FabricEditing, FabricEditingTypes } from "../types";
import { ImageEditorButtons } from "./buttons/main";
import { unfocusOnCanvas } from "./canvas/canvasController";
import { CanvasRenderer } from "./canvas/main";
import { makeEditingNone } from "./helpers";
import { LutsPicker } from "./luts/main";

export const ImageEditor: React.FunctionComponent<{
  onDone: () => void;
}> = ({}) => {
  const [ref, { width }] = useDimensions();
  const [fabricEditing, changeFabricEditing] = useState<FabricEditing>({
    type: FabricEditingTypes.none,
  });
  const finishEditing = () => {
    changeFabricEditing(makeEditingNone());
    unfocusOnCanvas();
  };

  const canvasSizerStyle = {
    width: "100%",
  };

  const getGoodWidth = (): number | undefined => {
    if (width == null) {
      return undefined;
    }

    if (typeof window == null) {
      return undefined;
    }

    const height = window.innerHeight * 0.8;

    if (height > width) {
      return width;
    }
    return height;
  };

  return (
    <Stack
      verticalFill={true}
      verticalAlign="space-between"
      padding="s1"
      styles={{ root: { maxWidth: 720, width: "100%" } }}
      gap="m"
    >
      <div style={canvasSizerStyle} ref={ref}>
        <Stack
          horizontal={true}
          gap="m"
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Link href="/">Filtre.me</Link>
          <Stack horizontal={true} gap="s1">
            <Button href="asdasd">Preview</Button>
            <PrimaryButton href="asdasd">Publish</PrimaryButton>
          </Stack>
        </Stack>
      </div>

      <ImageEditorButtons
        width={getGoodWidth()}
        finishEditing={finishEditing}
        fabricEditing={fabricEditing}
      />
      <CanvasRenderer
        width={getGoodWidth()}
        changeFabricEditing={changeFabricEditing}
      />
      <LutsPicker />
    </Stack>
  );
};
