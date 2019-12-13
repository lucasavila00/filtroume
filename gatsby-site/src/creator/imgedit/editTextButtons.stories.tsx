import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import { initializeIcons } from "office-ui-fabric-react";
import * as React from "react";
import { FabricEditingTypes } from "../types";
import { EditTextButtons } from "./editTextButtons";

initializeIcons(/* optional base url */);

storiesOf("EditTextButtons", module).add("default", () => (
  <EditTextButtons
    size={720}
    info={{ type: FabricEditingTypes.text, color: "red" }}
    // tslint:disable-next-line: no-console
    finishEditing={action("finish-editing")}
  />
));
