class MockCanvasGradient {
  addColorStop() {
    return undefined;
  }
}

const canvasContext = {
  arc: () => undefined,
  beginPath: () => undefined,
  bezierCurveTo: () => undefined,
  clearRect: () => undefined,
  clip: () => undefined,
  closePath: () => undefined,
  createLinearGradient: () => new MockCanvasGradient(),
  createPattern: () => null,
  createRadialGradient: () => new MockCanvasGradient(),
  drawImage: () => undefined,
  fill: () => undefined,
  fillRect: () => undefined,
  fillText: () => undefined,
  getImageData: () => ({ data: new Uint8ClampedArray(4) }),
  lineTo: () => undefined,
  measureText: () => ({ width: 0 }),
  moveTo: () => undefined,
  putImageData: () => undefined,
  quadraticCurveTo: () => undefined,
  rect: () => undefined,
  restore: () => undefined,
  rotate: () => undefined,
  save: () => undefined,
  scale: () => undefined,
  setLineDash: () => undefined,
  stroke: () => undefined,
  strokeRect: () => undefined,
  strokeText: () => undefined,
  transform: () => undefined,
  translate: () => undefined
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => canvasContext
});
