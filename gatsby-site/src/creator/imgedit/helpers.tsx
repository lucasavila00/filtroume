import { FabricEditingTypes, IFabricEditingNone } from "../types";

export const makeEditingNone = (): IFabricEditingNone => ({
  type: FabricEditingTypes.none,
});

export const capText = (text: string): string => {
  const CAP_LIMIT = 8;
  const LIMITER = "...";

  if (text.length <= CAP_LIMIT) {
    return text;
  } else {
    return text.substr(0, CAP_LIMIT - LIMITER.length) + LIMITER;
  }
};
export const extractLut = (lut: string): string => {
  console.warn(lut);
  return lut;
};
