export const drawOnVideoTexture = (
  gl: WebGLRenderingContext,
  videoTexture: WebGLTexture,
  videoEl: HTMLVideoElement,
) => {
  const level = 0;
  const internalFormat = gl.RGB;
  const srcFormat = gl.RGB;
  const srcType = gl.UNSIGNED_BYTE;

  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    videoEl,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl.CLAMP_TO_EDGE,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR,
  );
  gl.texParameterf(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    gl.LINEAR,
  );
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
};
