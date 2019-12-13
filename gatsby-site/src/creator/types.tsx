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
  color: string;
  font: string;
  strokeWidth: number;
  strokeColor: string;
  shadowSize: number;
  shadowColor: string;
}

export type FabricEditing = IFabricEditingNone | IFabricEditingText;
