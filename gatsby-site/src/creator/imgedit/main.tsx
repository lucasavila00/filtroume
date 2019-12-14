import {
  DefaultButton,
  Link,
  PrimaryButton,
  Stack,
} from "office-ui-fabric-react";
import React, { useState } from "react";
import useDimensions from "react-use-dimensions";
import { luts } from "../contants";
import { FabricEditing, FabricEditingTypes } from "../types";
import { ImageEditorButtons } from "./buttons/main";
import { exportCanvasAsPng, unfocusOnCanvas } from "./canvas/canvasController";
import { CanvasRenderer } from "./canvas/main";
import { extractLut, makeEditingNone } from "./helpers";
import { LutsPicker } from "./luts/main";
import { Previewer } from "./previewer/main";

export const ImageEditor: React.FunctionComponent<{
  onDone: (args: { croppedLut: string; planeImg: string }) => void;
}> = ({ onDone }) => {
  const [previewing, setPreviewing] = useState(false);
  const startPreviewing = () => setPreviewing(true);
  const finishPreviewing = () => setPreviewing(false);

  const [lut, changeLut] = useState(luts[0]);
  const [ref, { width }] = useDimensions();
  const [fabricEditing, changeFabricEditing] = useState<FabricEditing>({
    type: FabricEditingTypes.none,
  });
  const finishEditing = () => {
    changeFabricEditing(makeEditingNone());
    unfocusOnCanvas();
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

  const onPublish = () => {
    const w = getGoodWidth();
    if (w != null) {
      const planeImg = exportCanvasAsPng(w);
      onDone({ croppedLut: extractLut(lut), planeImg });
    }
  };

  const canvasSizerStyle = {
    width: "100%",
  };
  if (previewing) {
    const w = getGoodWidth();
    if (w != null) {
      const croppedLut = extractLut(lut);
      const planeImg = exportCanvasAsPng(w);

      return (
        <Previewer
          lut={croppedLut}
          img={planeImg}
          finishPreviewing={finishPreviewing}
        />
      );
    } else {
      return <div>Error. Width undefined while previewing</div>;
    }
  }

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
            <DefaultButton onClick={startPreviewing}>Preview</DefaultButton>
            <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>
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
        backgroundImage={lut}
      />
      <LutsPicker onChangeLut={changeLut} currentLut={lut} />
    </Stack>
  );
};
