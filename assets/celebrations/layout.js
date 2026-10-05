export function fittedDimensions(nativeWidth, nativeHeight, stageWidth, stageHeight, widthLimit, heightLimit, pixelRatio) {
  const values = [nativeWidth,nativeHeight,stageWidth,stageHeight,widthLimit,heightLimit,pixelRatio];
  if (values.some(value => !Number.isFinite(value) || value <= 0) || widthLimit > 1 || heightLimit > 1) {
    throw new Error("Artwork sizing requires valid source, stage and pixel-density dimensions");
  }
  const scale = Math.min(
    stageWidth * widthLimit / nativeWidth,
    stageHeight * heightLimit / nativeHeight,
    1 / Math.max(1,pixelRatio),
  );
  return { width: nativeWidth*scale, height: nativeHeight*scale, scale };
}

export function fitSuppliedArtwork(stage, artwork, pixelRatio = window.devicePixelRatio || 1) {
  const [width,height] = artwork.nativeSize;
  const dpr = Math.max(1,pixelRatio);
  if (artwork.presentation === "original-composition") {
    stage.style.maxWidth = `${Math.min(500,width/dpr)}px`;
    stage.style.aspectRatio = `${width}/${height}`;
  }
  if (!stage.clientWidth || !stage.clientHeight) return;
  const fitted = fittedDimensions(width,height,stage.clientWidth,stage.clientHeight,artwork.widthLimit,artwork.heightLimit,dpr);
  const image = stage.querySelector(".supplied-foreground");
  image.style.width = `${fitted.width}px`;
  image.style.height = `${fitted.height}px`;
  image.style.bottom = `${artwork.bottomInset*100}%`;
  const x = (stage.clientWidth-fitted.width)/2;
  const y = stage.clientHeight-fitted.height-stage.clientHeight*artwork.bottomInset;
  const attributes = (element, values) => {
    for (const [name,value] of Object.entries(values)) element.setAttribute(name,String(value));
  };
  const shadows = stage.querySelector(".contact-shadows");
  if (shadows) {
    shadows.setAttribute("viewBox", `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
    shadows.replaceChildren(...artwork.contacts.map(([cx,cy,rx,ry]) => {
      const ellipse = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
      attributes(ellipse, { cx:x+cx*fitted.scale,cy:y+cy*fitted.scale,rx:rx*fitted.scale,ry:ry*fitted.scale });
      return ellipse;
    }));
  }
  const firelight = stage.querySelector(".firelight");
  if (firelight) {
    const [cx,cy,rx,ry] = artwork.glow;
    firelight.setAttribute("viewBox", `0 0 ${stage.clientWidth} ${stage.clientHeight}`);
    attributes(firelight.querySelector("ellipse"), { cx:x+cx*fitted.scale,cy:y+cy*fitted.scale,rx:rx*fitted.scale,ry:ry*fitted.scale });
  }
  return fitted;
}

export async function initSuppliedArtwork(figure, artwork) {
  const stage = figure.querySelector(".scene-art");
  const image = stage.querySelector(".supplied-foreground");
  image.src = artwork.src;
  image.alt = artwork.alt;
  stage.querySelector(".supplied-setting")?.setAttribute("src",artwork.background);
  const fit = () => fitSuppliedArtwork(stage,artwork);
  new ResizeObserver(fit).observe(stage);
  function watchDensity() {
    matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener("change", () => {
      fit();
      watchDensity();
    }, { once: true });
  }
  watchDensity();
  fit();
  await Promise.all([...stage.querySelectorAll("img")].map(image => image.decode()));
  fit();
}
