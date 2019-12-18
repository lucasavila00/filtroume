import { CV } from "../opencv";
declare var cv: CV;

let _ready = false;

cv["onRuntimeInitialized"] = () => {
  // do all your work here
  _ready = true;
};

export const openCvReady = () => {
  return new Promise(rs => {
    if (_ready) {
      rs();
    }
    cv["onRuntimeInitialized"] = () => {
      // do all your work here
      rs();
    };
  });
};
