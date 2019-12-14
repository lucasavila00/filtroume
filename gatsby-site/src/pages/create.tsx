import React from "react";

import { makeNotificationNone } from "../creator/imgedit/helpers";
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
      <ImageEditor
        onPublish={console.warn}
        notification={makeNotificationNone()}
        onDismissNotification={console.warn}
      />
    </div>
  );
};

export default Create;
