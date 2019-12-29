import { Stack } from "office-ui-fabric-react";
import React, { useState } from "react";
import useDimensions from "react-use-dimensions";
import { luts } from "../constants";
import { FabricEditing, FabricEditingTypes, NotificationType } from "../types";
import { ImageEditorButtons } from "./buttons/main";
import { exportCanvasAsPng, unfocusOnCanvas } from "./canvas/canvasController";
import { CanvasRenderer } from "./canvas/main";
import { Header } from "./header/main";
import { extractLut, makeEditingNone } from "./helpers";
import { LutsPicker } from "./luts/main";
import { Previewer } from "./previewer/main";

export const ImageEditor: React.FunctionComponent<{
  onPublish: (args: { croppedLut: string; planeImg: string }) => void;
  notification: NotificationType;
  onDismissNotification: () => void;
  loading: boolean;
}> = ({ onPublish: onDone, loading, notification, onDismissNotification }) => {
  const [previewing, setPreviewing] = useState(false);
  const [extractedLut, setExtractedLut] = useState("");
  const [flippedImage, setFlippedImage] = useState("");

  const startPreviewing = async () => {
    const w = getGoodWidth();

    if (w != null) {
      const ex = await extractLut(lut);
      setExtractedLut(ex);

      const planeImg = await exportCanvasAsPng(w);
      setFlippedImage(planeImg);

      setPreviewing(true);
    }
  };

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

  const onPublish = async () => {
    const w = getGoodWidth();
    if (w != null) {
      const planeImg = await exportCanvasAsPng(w);
      const croppedLut = await extractLut(lut);
      onDone({ croppedLut, planeImg });
    }
  };

  const canvasSizerStyle = {
    width: "100%",
  };
  const renderPreview = () => {
    if (previewing) {
      const w = getGoodWidth();
      if (w != null) {
        return (
          <Previewer
            lut={extractedLut}
            img={flippedImage}
            finishPreviewing={finishPreviewing}
          />
        );
      } else {
        return <div>Error. Width undefined while previewing</div>;
      }
    } else {
      return <></>;
    }
  };

  return (
    <>
      {renderPreview()}
      <Stack
        verticalFill={true}
        verticalAlign="space-between"
        padding="s1"
        styles={{ root: { maxWidth: 720, width: "100%" } }}
        gap="m"
      >
        {/* Hack to know proper size of canvas */}
        <div style={canvasSizerStyle} ref={ref}>
          <Header
            loading={loading}
            notification={notification}
            onDismissNotification={onDismissNotification}
            onPublish={onPublish}
            startPreviewing={startPreviewing}
          />
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
    </>
  );
};
