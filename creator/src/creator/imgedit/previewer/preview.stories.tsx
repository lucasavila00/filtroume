import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { Previewer } from "./main";

storiesOf("Previewer", module).add("default previewer", () => (
  <Previewer lut="" img="" finishPreviewing={action("finish editing")} />
));
