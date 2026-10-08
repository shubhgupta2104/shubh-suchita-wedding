export function initComponentReveals(motion) {
  const elements = [...document.querySelectorAll(".occasion-copy, .occasion .scene, .couple-note, .setting-copy, .map-area, .venue-gallery, .rsvp, .closing")];
  const visible = new Set();
  const finished = new Set();
  const animations = new Map();
  const connection = navigator.connection;
  const allowed = () => motion.enabled && !connection?.saveData;
  function settle(element) {
    finished.add(element);
    const animation = animations.get(element);
    animations.delete(element);
    animation?.cancel();
    element.dataset.appearance = "settled";
    observer.unobserve(element);
  }
  function sync() {
    for (const element of elements) {
      if (finished.has(element)) continue;
      if (!allowed()) { settle(element);continue; }
      const inView = visible.has(element) && !document.hidden && !document.querySelector("dialog[open]");
      let animation = animations.get(element);
      if (inView && !animation) {
        animation = element.animate([
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 520, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both", iterations: 1 });
        animation.id = "component-appearance";
        animation.onfinish = () => settle(element);
        animations.set(element,animation);
      }
      if (animation) {
        if (inView && animation.playState === "paused") animation.play();
        else if (!inView && animation.playState === "running") animation.pause();
        element.dataset.appearance = inView ? "appearing" : "paused";
      }
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  }, { threshold: .08 });
  elements.forEach(element => observer.observe(element));
  motion.subscribe(sync);
  document.addEventListener("visibilitychange",sync);
  connection?.addEventListener("change",sync);
  const dialogs = new MutationObserver(sync);
  document.querySelectorAll("dialog").forEach(dialog => dialogs.observe(dialog,{attributes:true,attributeFilter:["open"]}));
  window.addEventListener("pagehide",() => elements.forEach(settle));
  sync();
}

export function initVenueGallery(details) {
  const dialog = document.querySelector("#venue-viewer");
  const image = document.querySelector("#venue-viewer-image");
  const caption = document.querySelector("#venue-viewer-caption");
  const status = document.querySelector("#venue-photo-status");
  const close = document.querySelector("#venue-viewer-close");
  const previous = document.querySelector("#venue-photo-previous");
  const next = document.querySelector("#venue-photo-next");
  let index = 0;
  let trigger;
  let scrollY = 0;
  function show(position) {
    index = (position+details.venuePhotos.length)%details.venuePhotos.length;
    const photo = details.venuePhotos[index];
    status.textContent = "Loading photograph...";
    image.src = photo.src;
    image.alt = photo.alt;
    caption.textContent = `${photo.caption} · ${index+1} / ${details.venuePhotos.length}`;
  }
  image.addEventListener("load",() => { if (dialog.open) status.textContent = ""; });
  image.addEventListener("error",() => {
    if (!dialog.open) return;
    console.error(`Venue photograph could not load: ${image.src}`);
    status.textContent = "This photograph couldn't load. Try the next photograph or close the viewer.";
  });
  document.querySelectorAll("[data-venue-photo]").forEach(link => {
    const position = Number(link.dataset.venuePhoto);
    const photo = details.venuePhotos[position];
    if (!photo) throw new Error(`Missing configured venue photograph ${position}`);
    link.href = photo.src;
    link.setAttribute("aria-haspopup","dialog");
    link.setAttribute("aria-controls","venue-viewer");
    const thumbnail = link.querySelector("img");
    thumbnail.src = photo.src;
    thumbnail.alt = photo.alt;
    thumbnail.addEventListener("error",() => {
      console.error(`Venue photograph unavailable: ${photo.src}`);
      link.closest("figure").querySelector("figcaption").textContent = "Photograph unavailable.";
    });
    link.addEventListener("click",event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      scrollY = window.scrollY;
      show(position);
      dialog.showModal();
      document.body.classList.add("photo-viewer-open");
      close.focus();
    });
  });
  close.addEventListener("click",() => dialog.close());
  previous.addEventListener("click",() => show(index-1));
  next.addEventListener("click",() => show(index+1));
  dialog.addEventListener("keydown",event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      show(index+(event.key==="ArrowLeft"?-1:1));
    } else if (event.key === "Tab") {
      const controls = [close,previous,next];
      const target = controls.indexOf(document.activeElement);
      if (event.shiftKey && target===0) { event.preventDefault();next.focus(); }
      else if (!event.shiftKey && target===2) { event.preventDefault();close.focus(); }
    }
  });
  dialog.addEventListener("click",event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) dialog.close();
  });
  dialog.addEventListener("close",() => {
    image.removeAttribute("src");
    status.textContent = "";
    document.body.classList.remove("photo-viewer-open");
    window.scrollTo({top:scrollY,behavior:"instant"});
    trigger?.focus({preventScroll:true});
  });
}
