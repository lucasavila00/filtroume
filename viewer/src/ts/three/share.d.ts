type ShareData = {
  title?: string;
  text?: string;
  url?: string;
  files?: Blob[];
};

interface Navigator {
  share: (data?: ShareData) => Promise<void>;
  canShare: (data?: ShareData) => boolean;
}
