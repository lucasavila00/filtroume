import React from "react";

import { ImageEditor } from "../creator/imgedit/main";

const createCentralizeStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const Create: React.FunctionComponent = () => {
  return (
    <div style={createCentralizeStyle}>
      <ImageEditor onDone={console.warn} />
    </div>
  );
};

export default Create;
