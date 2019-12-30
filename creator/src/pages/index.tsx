import {
  FontWeights,
  Link,
  PrimaryButton,
  Stack,
  Text,
} from "office-ui-fabric-react";
import React, { CSSProperties, useEffect, useState } from "react";
import SEO from "../components/seo";
import "../css/common.css";
import "../css/index.css";
import "../css/normalize.css";

const textStyles = {
  root: {
    fontWeight: FontWeights.semibold,
    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
    color: "white",
  },
};

const buttonStyles = {
  root: {
    boxShadow: "0px 0px 2px 2px rgba(0, 0, 0, 0.2)",
  },
};

const bgs = [
  "/bgs/bg1.jpg",
  "/bgs/bg4.jpg",
  "/bgs/bg2.jpg",
  "/bgs/bg5.jpg",
  "/bgs/bg3.jpg",
];

const flashStyle: CSSProperties = {
  backgroundColor: "white",
  opacity: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
  zIndex: -1,
  transition: "opacity 0.2s ease-in-out",
};
const preloadImage = (url: string) => {
  const image = new Image();
  image.src = url;
};
const preloadImages = () => {
  bgs.forEach(preloadImage);
};

const delay = (ms: number) => new Promise((rs) => setTimeout(rs, ms));
const oneFrame = () => new Promise((rs) => requestAnimationFrame(rs));

const randomRot = () => {
  const rot = Math.round((Math.random() - 0.5) * 16);

  return rot;
};

const Background: React.FunctionComponent = () => {
  const MAX_CYCLES = 5;

  const [mounted, setMounted] = useState(false);
  const [flashOn, setFlash] = useState(false);

  const [shadowOn, setShadow] = useState(true);

  const [rot, setRot] = useState(() => randomRot());

  const [photoCycle, setPhotoCycle] = useState(0);

  const [size, setSize] = useState({ height: 640, width: 360 });

  const moveCycle = () => {
    setPhotoCycle((old) => {
      return (old + 1) % MAX_CYCLES;
    });
  };

  const loopFlash = async () => {
    await delay(1000);
    setFlash(true);
    await delay(200);
    // muda a imagem do fundo
    moveCycle();
    setShadow(false);
    await delay(16);
    await oneFrame();
    setRot(randomRot());
    setShadow(true);
    setFlash(false);
    await delay(3000); // todo: aumentar o delay
    setTimeout(loopFlash, 0);
  };

  useEffect(() => {
    setMounted(true);
    const height = window.innerHeight;
    const width = (height / 16) * 9;
    setSize({ width, height });
    loopFlash();
    preloadImages();
  }, []);

  const getImageBg = (c: number): string => {
    return bgs[c];
  };

  const photoStyle: CSSProperties = {
    backgroundImage: `url("${getImageBg(photoCycle)}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: size.width,
    height: size.height,
    position: "absolute",
    left: `calc(50% - ${Math.round(size.width / 2)}px)`,
    top: `calc(50% - ${Math.round(size.height / 2)}px)`,
    zIndex: -2,
    borderStyle: "solid",
    borderColor: "white",
    borderWidth: 8,
    transform: shadowOn
      ? `rotate(${rot}deg) scale(0.75, 0.75)`
      : "rotate(0deg) scale(1, 1)",
    boxShadow: shadowOn
      ? "0px 0px 2px 2px rgba(0, 0, 0, 0.1)"
      : "0px 0px 16px 16px rgba(0, 0, 0, 0.1)",
    transition: shadowOn
      ? "box-shadow 3s ease-in-out, transform 3s ease-in-out"
      : "none",
  };
  if (!mounted) {
    return null;
  }
  return (
    <>
      <div style={{ ...flashStyle, opacity: flashOn ? 1 : 0 }} />
      <div style={photoStyle} />
    </>
  );
};
const footerStyle: CSSProperties = {
  width: "100%",
  height: 64,
  position: "absolute",
  bottom: 0,
  zIndex: 15,
  backgroundColor: "#ddd",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#605e5c",
};
const Footer: React.FunctionComponent = () => {
  return (
    <div style={footerStyle}>
      <Link href="/blog">Blog</Link>
      <div style={{ width: 32 }} />
      <Link href="https://github.com/lucasavila00/filtroume">Github</Link>
      <div style={{ width: 32 }} />
      <Link href="https://twitter.com/lucasavila00">Contact</Link>
    </div>
  );
};
const App: React.FunctionComponent = () => {
  return (
    <>
      <Background />
      <SEO title="Home" />
      <Stack
        horizontalAlign="center"
        verticalAlign="center"
        verticalFill={true}
        gap="m"
        padding="m"
      >
        <Text variant="xxLarge" styles={textStyles}>
          FILTROU.ME
        </Text>
        <Text variant="large" styles={textStyles}>
          Unleash your creativity now!
        </Text>
        <PrimaryButton href="/create" styles={buttonStyles}>
          CREATE NEW FILTER
        </PrimaryButton>
      </Stack>
      <Footer />
    </>
  );
};

export default App;
