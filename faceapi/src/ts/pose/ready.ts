import { CV } from "../opencv";
declare var cv: CV;

export const openCvReady = () => {
  return new Promise(rs => {
    if ((window as any)._ready) {
      rs();
    }

    // setTimeout(rs, 10000);
    cv["onRuntimeInitialized"] = () => {
      // do all your work here
      rs();
    };
  });
};
