export enum FabricEditingTypes {
  none,
  text,
  image,
}

export interface IFabricEditingNone {
  type: FabricEditingTypes.none;
}

export interface IFabricEditingText {
  type: FabricEditingTypes.text;
  color: string | fabric.Pattern | fabric.Gradient;
}

export type FabricEditing = IFabricEditingNone | IFabricEditingText;
