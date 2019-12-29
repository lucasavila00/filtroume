import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { luts } from "../../constants";
import { LutsPicker } from "./main";

storiesOf("Luts", module).add("default", () => (
  <LutsPicker currentLut={luts[0]} onChangeLut={action("changeLut")} />
));
