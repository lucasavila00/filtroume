import * as THREE from "three";
import { Effect, BlendFunction } from "postprocessing";
const fragment = `
uniform sampler2D colorTransformLookup;
uniform float lutMapSize;

vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
  float sliceSize = 1.0 / size;                  // space of 1 slice
  float slicePixelSize = sliceSize / size;       // space of 1 pixel
  float width = size - 1.0;
  float sliceInnerSize = slicePixelSize * width; // space of size pixels
  float zSlice0 = floor( texCoord.z * width);
  float zSlice1 = min( zSlice0 + 1.0, width);
  float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
  float yRange = (texCoord.y * width + 0.5) / size;
  float s0 = xOffset + (zSlice0 * sliceSize);
  float s1 = xOffset + (zSlice1 * sliceSize);
  vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
  vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
  float zOffset = mod(texCoord.z * width, 1.0);
  return mix(slice0Color, slice1Color, zOffset);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

  outputColor = sampleAs3DTexture(colorTransformLookup, inputColor.xyz, lutMapSize);

}`;
export class ColorTransformEffect extends Effect {
  constructor({
    lutTexture,
  }: {
    lutTexture: THREE.DataTexture;
  }) {
    super("ColorTransformEffect", fragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        [
          "colorTransformLookup",
          new THREE.Uniform(lutTexture),
        ],
        ["lutMapSize", new THREE.Uniform(2)],
      ]),
    });

    lutTexture.magFilter = THREE.LinearFilter;
    lutTexture.minFilter = THREE.LinearFilter;
    lutTexture.format = THREE.RGBAFormat;
    lutTexture.flipY = false;
    lutTexture.generateMipmaps = false;
    lutTexture.needsUpdate = true;
  }
}
const makeIdentityLutTexture = function(
  filter: THREE.TextureFilter,
) {
  const identityLUT = new Uint8Array([
    0,
    0,
    0,
    255, // black
    255,
    0,
    0,
    255, // red
    0,
    0,
    255,
    255, // blue
    255,
    0,
    255,
    255, // magenta
    0,
    255,
    0,
    255, // green
    255,
    255,
    0,
    255, // yellow
    0,
    255,
    255,
    255, // cyan
    255,
    255,
    255,
    255, // white
  ]);

  const texture = new THREE.DataTexture(
    identityLUT,
    4,
    2,
    THREE.RGBAFormat,
  );
  texture.minFilter = filter;
  texture.magFilter = filter;
  texture.needsUpdate = true;
  texture.flipY = false;
  return texture;
};

export const makeLUTTexture = function(
  info: {
    url: string;
    size: number;
  },
  _lutEf: any,
) {
  const imgLoader = new THREE.ImageLoader();
  const ctx = document
    .createElement("canvas")
    .getContext("2d");
  const texture = makeIdentityLutTexture(
    THREE.LinearFilter,
  );
  console.log("maeking textureeeee");
  if (info.url && ctx) {
    const lutSize = info.size;
    console.log("has url and canvas lut");

    // set the size to 2 (the identity size). We'll restore it when the
    // image has loaded. This way the code using the lut doesn't have to
    // care if the image has loaded or not

    imgLoader.load(info.url, function(image) {
      const width = lutSize * lutSize;
      const height = lutSize;
      ctx.canvas.width = width;
      ctx.canvas.height = height;
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(
        0,
        0,
        width,
        height,
      );

      (texture.image as any).data = new Uint8Array(
        imageData.data.buffer,
      );
      (texture.image as any).width = width;
      (texture.image as any).height = height;
      texture.needsUpdate = true;
      (_lutEf.uniforms as Map<string, THREE.Uniform>).get(
        "lutMapSize",
      )!.value = lutSize;
    });
  }

  return texture;
};
