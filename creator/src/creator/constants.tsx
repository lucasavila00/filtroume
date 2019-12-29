export const luts = [
  "/luts/lut0.png",
  "/luts/lut1.png",
  "/luts/lut2.png",
  "/luts/lut3.png",
  "/luts/lut4.png",
  "/luts/lut5.png",
  "/luts/lut6.png",
  "/luts/lut7.png",
  "/luts/lut8.png",
  "/luts/lut9.png",
];

export const colors = [
  { id: "a", label: "red", color: "#a4262c" },
  { id: "b", label: "orange", color: "#ca5010" },
  { id: "c", label: "orangeYellow", color: "#986f0b" },
  { id: "d", label: "white", color: "#ffffff" },
  { id: "e", label: "green", color: "#0b6a0b" },
  { id: "f", label: "cyan", color: "#038387" },
  { id: "g", label: "cyanBlue", color: "#004e8c" },
  { id: "h", label: "magenta", color: "#881798" },
  { id: "i", label: "magentaPink", color: "#9b0062" },
  { id: "j", label: "black", color: "#000000" },
  { id: "k", label: "gray", color: "#7a7574" },
  { id: "l", label: "gray20", color: "#69797e" },
];

// sync with storybook config and gatsby index.css
interface IFont {
  display: string;
  family: string;
}
export const fonts: IFont[] = [
  {
    display: "default",
    family: "sans-serif",
  },
  {
    display: "Long Cang",
    family: "'Long Cang', cursive",
  },
  {
    display: "Pacifico",
    family: "'Pacifico', cursive",
  },
  {
    display: "VT323",
    family: "'VT323', monospace",
  },
  {
    display: "Permanent Marker",
    family: "'Permanent Marker', cursive",
  },
  {
    display: "Bangers",
    family: "'Bangers', cursive",
  },
  {
    display: "Hanalei Fill",
    family: "'Hanalei Fill', cursive",
  },
  {
    display: "Luckiest Guy",
    family: "'Luckiest Guy', cursive",
  },
  {
    display: "Press Start 2P",
    family: "'Press Start 2P', cursive",
  },
  {
    display: "Monoton",
    family: "'Monoton', cursive",
  },
  {
    display: "Rye",
    family: "'Rye', cursive",
  },
];

// remeber to check the random initializer
// if deleting one of the images here
export const galleryImages = [
  {
    src: "/gallery/baloon1.png",
  },
  {
    src: "/gallery/baloon2.png",
  },
  {
    src: "/gallery/bubbles1.png",
  },
  {
    src: "/gallery/bubbles2.png",
  },
  {
    src: "/gallery/cloud1.png",
  },
  {
    src: "/gallery/cloud2.png",
  },

  {
    src: "/gallery/flowers1.png",
  },
  {
    src: "/gallery/flowers2.png",
  },
  {
    src: "/gallery/hearts1.png",
  },
  {
    src: "/gallery/hearts2.png",
  },
  {
    src: "/gallery/ribbon1.png",
  },
  {
    src: "/gallery/ribbon2.png",
  },
  {
    src: "/gallery/colors1.png",
  },
  {
    src: "/gallery/soil1.png",
  },
  {
    src: "/gallery/grass1.png",
  },
  {
    src: "/gallery/lightning1.png",
  },
];
