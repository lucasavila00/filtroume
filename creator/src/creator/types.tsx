export enum FabricEditingTypes {
  none,
  text,
  image,
}

export interface IFabricEditingNone {
  type: FabricEditingTypes.none;
}
export interface IFabricEditingImage {
  type: FabricEditingTypes.image;
  opacity: number;
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

export type FabricEditing =
  | IFabricEditingNone
  | IFabricEditingText
  | IFabricEditingImage;

// notif

export enum NotificationTypeEnum {
  uploaded,
  error,
  none,
}

export interface INotificationNone {
  type: NotificationTypeEnum.none;
}

export interface INotificationUploaded {
  type: NotificationTypeEnum.uploaded;
  url: string;
}

export interface INotificationError {
  type: NotificationTypeEnum.error;
  message?: string;
}

export type NotificationType =
  | INotificationUploaded
  | INotificationError
  | INotificationNone;
