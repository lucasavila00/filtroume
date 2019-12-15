import React from "react";

import { initializeIcons } from "office-ui-fabric-react";
import { makeNotificationNone } from "../creator/imgedit/helpers";
import { ImageEditor } from "../creator/imgedit/main";
import "./index.css";
import "./normalize.css";
initializeIcons(/* optional base url */);

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
