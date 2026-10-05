import { createChoreography, SCENE_DURATION } from "./choreography.js";
import { initSuppliedArtwork } from "./assets/celebrations/layout.js";

export const SCRATCH_THRESHOLD = 0.4;
export const VISIT_KEY = "shubh-suchita-royal-visit-v1";

export function remainingTime(target, now = Date.now()) {
  const targetTime = Date.parse(target);
  if (!Number.isFinite(targetTime)) throw new Error("The countdown needs a valid timestamp with a timezone.");
  const total = Math.max(0, Math.ceil((targetTime - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
    begun: total === 0,
  };
}

export function erasedFraction(pixels) {
  let removed = 0;
  for (let i = 3; i < pixels.length; i += 4) removed += 1 - pixels[i] / 255;
  return removed / (pixels.length / 4);
}

export function googleFormLink(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.hostname === "forms.gle" && url.pathname.length > 1) return url.href;
    if (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/")) return url.href;
  } catch { return null; }
  return null;
}

export function initMotion() {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const button = document.querySelector("#motion-toggle");
  const listeners = new Set();
  let choice = null;
  const motion = {
    get enabled() { return choice === null ? !preference.matches : choice; },
    subscribe(listener) { listeners.add(listener); },
  };
  function sync() {
    document.documentElement.classList.toggle("motion-paused", !motion.enabled);
    document.documentElement.classList.toggle("motion-enabled", motion.enabled);
    button.setAttribute("aria-pressed", String(!motion.enabled));
    const followsReduction = preference.matches && choice === null;
    button.setAttribute("aria-label", followsReduction ? "Enable decorative motion for this visit" : `${motion.enabled ? "Pause" : "Play"} decorative motion`);
    button.title = button.getAttribute("aria-label");
    button.querySelector("span").textContent = followsReduction ? "Enable motion" : `${motion.enabled ? "Pause" : "Play"} motion`;
    document.querySelector("#motion-status").textContent = followsReduction
      ? "Still illustrations for your reduced-motion preference. You can choose to enable motion for this visit."
      : motion.enabled ? "Decorative motion enabled." : "Decorative motion paused.";
    listeners.forEach((listener) => listener());
  }
  button.hidden = false;
  button.addEventListener("click", () => { choice = !motion.enabled; sync(); });
  preference.addEventListener("change", () => { choice = null; sync(); });
  sync();
  return motion;
}

export function initExperience(details, motion) {
  const gate = document.querySelector("#entrance");
  gate.style.setProperty("--gate-art", `url("${details.entranceArtwork}")`);
  gate.style.setProperty("--gate-crown", `url("${details.entranceCrown}")`);
  gate.style.setProperty("--venue-art", `url("${details.venueArtwork.src}")`);
  const hero = document.querySelector(".hero");
  const panel = document.querySelector("#scratch-panel");
  const canvas = document.querySelector("#scratch-coating");
  const scratchCue = document.querySelector("#scratch-cue");
  const scratchHelp = document.querySelector("#scratch-help");
  const scratchKeyboardHelp = document.querySelector("#scratch-keyboard-help");
  const scratchProgress = document.querySelector("#scratch-progress");
  const announcement = document.querySelector("#date-announcement");
  const afterReveal = document.querySelector("#after-reveal");
  const preferences = document.querySelector("#visit-status");
  let state = { opened: false, revealed: false };
  let scratchVisible = false;
  function syncScratchCue() {
    scratchCue.classList.toggle("cue-playing", scratchVisible && motion.enabled && !document.hidden && !gate.open && !state.revealed && !panel.classList.contains("is-scratching"));
  }
  new IntersectionObserver(([entry]) => { scratchVisible = entry.isIntersecting; syncScratchCue(); }, { threshold: 0 }).observe(panel);
  motion.subscribe(syncScratchCue);
  document.addEventListener("visibilitychange", syncScratchCue);
  gate.addEventListener("close", syncScratchCue);
  let storageUsable = true;
  try {
    const saved = JSON.parse(sessionStorage.getItem(VISIT_KEY) || "null");
    if (saved && typeof saved === "object") state = { opened: saved.opened === true, revealed: saved.revealed === true };
  } catch (error) {
    storageUsable = false;
    console.warn("Visit storage is unavailable:", error);
    preferences.textContent = "Your browser cannot save this visit. The entrance may return after a reload.";
  }
  function persist() {
    if (!storageUsable) return;
    try { sessionStorage.setItem(VISIT_KEY, JSON.stringify(state)); }
    catch (error) {
      storageUsable = false;
      console.warn("Visit storage could not be saved:", error);
      preferences.textContent = "Your reveal is kept on this page, but cannot be saved for a reload.";
    }
  }
  let closingGate = false;
  let gateAnimations = [];
  let gateEpoch = 0;
  const finishEntrance = () => {
    gateEpoch++;
    if (!gate.open) return;
    gate.close();
    gateAnimations.forEach(animation => animation.cancel());
    gateAnimations = [];
    document.body.classList.remove("entrance-open");
    hero.classList.remove("names-waiting");
    document.querySelector("#couple-names").focus({ preventScroll: true });
    closingGate = false;
  };
  async function openGates(skip = false) {
    if (closingGate) { if (skip) finishEntrance(); return; }
    closingGate = true;
    state.opened = true;
    persist();
    hero.classList.remove("names-waiting");
    hero.classList.add("names-arriving");
    if (skip) { finishEntrance(); return; }
    const epoch = ++gateEpoch;
    // Paint the closed state before creating compositor animations, including on mobile Safari.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (epoch !== gateEpoch || !gate.open) return;
    gate.classList.add("gates-opening");
    const duration = motion.enabled ? 1850 : 550;
    const options = { duration, fill: "forwards", easing: "cubic-bezier(.25,.1,.18,1)" };
    const leaves = [...gate.querySelectorAll(".gate-leaf")];
    try {
      gateAnimations = leaves.map((leaf, index) => leaf.animate(motion.enabled
        ? [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${index === 0 ? -108 : 108}deg)` }]
        : [{ opacity: 1 }, { opacity: 0 }], options));
      gateAnimations.push(...[...gate.querySelectorAll(".gate-seal,.gate-welcome,.gate-actions")].map(element =>
        element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: motion.enabled ? 450 : duration, fill: "forwards" })));
      await Promise.all(gateAnimations.map(animation => animation.finished));
      if (epoch === gateEpoch) finishEntrance();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Entrance animation failed:", error);
        finishEntrance();
      }
    }
  }
  document.querySelector("#open-gates").addEventListener("click", () => openGates());
  document.querySelector("#skip-gates").addEventListener("click", () => openGates(true));
  gate.addEventListener("cancel", (event) => { event.preventDefault(); openGates(true); });
  gate.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const first = document.querySelector("#skip-gates");
    const last = document.querySelector("#open-gates");
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function showEntrance() {
    gate.classList.remove("gates-opening");
    hero.classList.remove("names-arriving");
    hero.classList.add("names-waiting");
    window.scrollTo({ top: 0, behavior: "instant" });
    gate.showModal();
    document.body.classList.add("entrance-open");
    document.querySelector("#open-gates").focus();
  }
  if (!state.opened && !state.revealed && !location.hash) showEntrance();
  let burstDone = state.revealed;
  function confetti() {
    if (burstDone) return;
    burstDone = true;
    if (!motion.enabled) return;
    const layer = document.querySelector("#confetti");
    const colors = ["#b59657", "#e4d2ac", "#f8f2e5", "#c9979d"];
    for (let i = 0; i < 34; i++) {
      const piece = document.createElement("i");
      piece.style.setProperty("--dx", `${(i % 2 ? 1 : -1) * (45 + Math.random() * 200)}px`);
      piece.style.setProperty("--dy", `${50 + Math.random() * 120}px`);
      piece.style.setProperty("--turn", `${Math.random() * 530 - 265}deg`);
      piece.style.setProperty("--delay", `${Math.random() * .15}s`);
      piece.style.background = colors[i % colors.length];
      layer.append(piece);
    }
    layer.dataset.bursts = String(Number(layer.dataset.bursts || 0) + 1);
    setTimeout(() => layer.replaceChildren(), 1800);
  }
  function reveal(celebrate = true) {
    if (state.revealed && panel.classList.contains("is-revealed")) return;
    state.opened = true;
    state.revealed = true;
    persist();
    panel.classList.add("is-revealed");
    panel.closest(".date-discovery").classList.add("date-known");
    panel.classList.remove("scratch-ready");
    if (celebrate && motion.enabled) {
      canvas.classList.add("coating-dissolve");
      canvas.tabIndex = -1;
      setTimeout(() => { canvas.hidden = true; }, 650);
    } else canvas.hidden = true;
    afterReveal.classList.add("date-revealed");
    const wasFocused = document.activeElement === canvas;
    scratchCue.hidden = true;
    scratchHelp.hidden = true;
    scratchKeyboardHelp.hidden = true;
    scratchProgress.hidden = true;
    syncScratchCue();
    announcement.textContent = `${details.dates}. ${details.venue}, ${details.destination}.`;
    if (wasFocused) document.querySelector("#revealed-date").focus({ preventScroll: true });
    if (celebrate) confetti();
    tick();
  }
  canvas.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); reveal(); }
  });
  canvas.addEventListener("click", (event) => { if (event.detail === 0) reveal(); });
  const countdown = document.querySelector("#countdown");
  document.querySelector(".countdown-wrap").hidden = false;
  function tick() {
    try {
      const left = remainingTime(details.countdownTarget);
      document.querySelector("#countdown-begun").hidden = !left.begun;
      countdown.hidden = left.begun;
      if (!left.begun) for (const name of ["days", "hours", "minutes", "seconds"]) countdown.querySelector(`[data-unit="${name}"]`).textContent = String(left[name]).padStart(2, "0");
    } catch (error) {
      console.error("Countdown configuration is invalid:", error);
      countdown.hidden = true;
      const errorText = document.querySelector("#countdown-begun");
      errorText.hidden = false;
      errorText.textContent = "The countdown is unavailable. Please see the celebration schedule below.";
    }
  }
  tick();
  let countdownTimer = setInterval(() => { if (!document.hidden) tick(); }, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  window.addEventListener("pagehide", () => clearInterval(countdownTimer));
  window.addEventListener("pageshow", (event) => { if (event.persisted) { tick(); countdownTimer = setInterval(tick, 1000); } });
  if (state.revealed) reveal(false);
  else {
    let ctx;
    try { ctx = canvas.getContext("2d", { willReadFrequently: true }); }
    catch (error) { console.warn("Scratch canvas unavailable:", error); }
    if (!ctx) {
      announcement.textContent = "Scratching isn't available in this browser. Your dates are shown below.";
      reveal(false);
    } else {
      try {
        canvas.width = 840;
        canvas.height = 220;
        const gold = ctx.createLinearGradient(0, 0, 840, 180);
        gold.addColorStop(0, "#c3a76f"); gold.addColorStop(.3, "#ede0b9"); gold.addColorStop(.56, "#c3a774"); gold.addColorStop(1, "#daca9c");
        ctx.fillStyle = gold;
        ctx.fillRect(0, 0, 840, 220);
        for (let y = 0; y < 220; y += 2) {
          ctx.strokeStyle = y % 6 ? "#fff4d321" : "#8c713a24";
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(840, y + 4); ctx.stroke();
        }
        ctx.strokeStyle = "#927441";
        ctx.strokeRect(10, 10, 820, 200);
        ctx.strokeStyle = "#fbf3dbaa";
        ctx.strokeRect(15, 15, 810, 190);
        ctx.fillStyle = "#4d4027";
        ctx.textAlign = "center";
        ctx.font = "44px Georgia";
        ctx.fillText("Scratch here", 420, 84);
        ctx.font = "22px sans-serif";
        ctx.fillText("to uncover our wedding dates", 420, 122);
      } catch (error) {
        console.error("Scratch coating could not be drawn:", error);
        reveal(false);
        announcement.textContent = `${details.dates}. The scratch surface was unavailable, so your dates are shown.`;
        return;
      }
      // The hidden canvas is enhanced only after drawing succeeds. The date stays readable without JS.
      canvas.hidden = false;
      scratchCue.hidden = false;
      scratchHelp.hidden = false;
      scratchKeyboardHelp.hidden = false;
      panel.classList.add("scratch-ready");
      syncScratchCue();
      let pointer = null;
      let previous;
      let queued = false;
      let lastProgressStep = -1;
      function measure() {
        queued = false;
        if (state.revealed) return;
        try {
          const fraction = erasedFraction(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
          panel.dataset.coverage = fraction.toFixed(5);
          const percent = Math.floor(fraction * 100);
          const progressStep = Math.floor(percent / 5);
          if (progressStep !== lastProgressStep && fraction > 0) {
            lastProgressStep = progressStep;
            scratchProgress.hidden = false;
            scratchProgress.textContent = percent < 10
              ? "That's it. Keep brushing across the gold."
              : `A little more... ${percent}% of the gold is cleared.`;
          }
          if (fraction >= SCRATCH_THRESHOLD) reveal();
        } catch (error) {
          console.error("Scratch coverage measurement failed:", error);
          reveal(false);
          announcement.textContent = `${details.dates}. The scratch surface was unavailable, so your dates are shown.`;
        }
      }
      function erase(event) {
        const rect = canvas.getBoundingClientRect();
        const point = { x: (event.clientX - rect.left) / rect.width * 840, y: (event.clientY - rect.top) / rect.height * 220 };
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 84;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(previous?.x ?? point.x, previous?.y ?? point.y);
        ctx.lineTo(point.x + .01, point.y + .01);
        ctx.stroke();
        previous = point;
        if (!queued) { queued = true; requestAnimationFrame(measure); }
      }
      canvas.addEventListener("pointerdown", (event) => {
        if (state.revealed || pointer !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
        pointer = event.pointerId;
        panel.classList.add("is-scratching");
        syncScratchCue();
        previous = null;
        canvas.setPointerCapture(pointer);
        erase(event);
      });
      canvas.addEventListener("pointermove", (event) => {
        if (event.pointerId !== pointer || state.revealed) return;
        erase(event);
      });
      function end(event) {
        if (event.pointerId !== pointer) return;
        if (canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
        pointer = null;
        previous = null;
        measure();
      }
      canvas.addEventListener("pointerup", end);
      canvas.addEventListener("pointercancel", end);
      canvas.addEventListener("lostpointercapture", () => { pointer = null; previous = null; });
    }
  }
  motion.subscribe(() => {
    if (!motion.enabled) {
      document.querySelector("#confetti").replaceChildren();
      if (closingGate && gateAnimations.length) finishEntrance();
    }
  });
}

export function initPractical(details) {
  const mapStatus = document.querySelector("#map-status");
  const mapLink = document.querySelector("#google-maps-link");
  const loadMap = document.querySelector("#load-map");
  mapLink.hidden = true;
  mapLink.removeAttribute("href");
  loadMap.hidden = true;
  if (details.map.url) { mapLink.href = details.map.url; mapLink.hidden = false; }
  else mapStatus.textContent = "The exact property pin is awaiting confirmation.";
  if (details.map.embedUrl) {
    loadMap.hidden = false;
    loadMap.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.title = `${details.venue}, exact property location on Google Maps`;
      frame.src = details.map.embedUrl;
      frame.referrerPolicy = "no-referrer";
      frame.allowFullscreen = true;
      loadMap.hidden = true;
      mapStatus.textContent = "Loading Google Maps. If it doesn't appear, use Open in Google Maps.";
      document.querySelector("#map-preview").hidden = true;
      document.querySelector("#map-frame").append(frame);
      frame.addEventListener("load", () => { mapStatus.textContent = "If the map doesn't appear, open the exact property in Google Maps below."; });
      frame.addEventListener("error", () => { mapStatus.textContent = "The map couldn't load. Use Open in Google Maps instead."; });
    }, { once: true });
  }
  const rsvpLink = document.querySelector("#rsvp-link");
  const rsvpStatus = document.querySelector("#rsvp-status");
  rsvpLink.hidden = true;
  rsvpLink.removeAttribute("href");
  rsvpStatus.textContent = "RSVP details coming soon.";
  const form = googleFormLink(details.rsvp.googleFormUrl);
  if (form) {
    rsvpLink.href = form;
    rsvpLink.hidden = false;
    rsvpStatus.textContent = "Opens our RSVP form on Google Forms.";
  } else if (details.rsvp.googleFormUrl) {
    console.error("Invalid Google Form URL in config.js");
    rsvpStatus.textContent = "The RSVP link needs an update. Please check back soon.";
  }
}

function addSceneInteraction(figure, motion, choreography) {
  const art = figure.querySelector(".scene-art");
  const svg = art.querySelector("svg");
  const kind = figure.dataset.scene;
  const actionNames = {
    evara: "Send a ripple across Evara's pool",
    haldi: "Replay the Haldi illustration",
    sangeet: "Replay the Sangeet illustration",
    baraat: "Replay the Baraat illustration",
    varmala: "Replay the Varmala illustration",
    phere: "Replay the wedding illustration",
  };
  art.setAttribute("role", "button");
  art.setAttribute("aria-label", actionNames[kind]);
  art.setAttribute("aria-describedby", "scene-help");
  art.classList.add("interactive-art");
  let pointer;
  let raf = 0;
  let lastReaction = -Infinity;
  function react(point) {
    if (!motion.enabled || !figure.classList.contains("scene-playing") || performance.now() - lastReaction < (kind === "evara" ? 1600 : SCENE_DURATION)) return;
    if (kind !== "evara" && figure.dataset.sequenceState === "playing") return;
    lastReaction = performance.now();
    if (kind !== "evara") {
      choreography.replay();
      figure.dataset.reactions = String(Number(figure.dataset.reactions || 0) + 1);
      return;
    }
    figure.classList.add("is-awakened");
    const ns = "http://www.w3.org/2000/svg";
    const layer = document.createElementNS(ns, "g");
    layer.classList.add("interaction-effect");
    layer.setAttribute("aria-hidden", "true");
    svg.append(layer);
    function shape(tag, attributes, keyframes, options) {
      const element = document.createElementNS(ns, tag);
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
      layer.append(element);
      element.animate(keyframes, { duration: 1500, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both", ...options });
      return element;
    }
    if (kind === "evara" || kind === "baraat") {
      const x = kind === "evara" ? Math.min(1080, Math.max(130, (point?.x ?? .52) * 1200)) : 400;
      const y = kind === "evara" ? Math.min(550, Math.max(485, (point?.y ?? .85) * 590)) : 408;
      for (let i = 0; i < 3; i++) {
        const ring = shape("ellipse", { cx: 0, cy: 0, rx: kind === "evara" ? 85 : 34, ry: kind === "evara" ? 16 : 22, fill: "none", stroke: kind === "evara" ? "#ffedb8" : "#edb768", "stroke-width": 2.5 },
          [{ opacity: 0, transform: "scale(.12)" }, { opacity: .85, offset: .15 }, { opacity: 0, transform: "scale(1.6)" }], { delay: i * 130 });
        const position = document.createElementNS(ns, "g");
        position.setAttribute("transform", `translate(${x} ${y})`);
        layer.append(position);
        position.append(ring);
      }
    } else if (kind === "sangeet" || kind === "phere") {
      const lights = kind === "sangeet" ? [[180, 105], [370, 130], [550, 122], [665, 94]] : [[408, 483], [172, 468], [623, 468]];
      lights.forEach(([x, y], i) => {
        shape("circle", { cx: x, cy: y, r: kind === "phere" ? 68 : 54, fill: `url(#${kind}-light)` },
          [{ opacity: 0 }, { opacity: .85, offset: .35 }, { opacity: 0 }], { delay: i * 100, duration: 1400 });
      });
    } else {
      for (let i = 0; i < 9; i++) {
        const petal = shape("ellipse", { cx: 0, cy: 0, rx: 5, ry: 10, fill: kind === "haldi" ? ["#f0c375", "#dd978e"][i % 2] : ["#dba0ad", "#f6dcc4"][i % 2] },
          [{ opacity: 0, transform: "translate(0, -12px) rotate(-20deg)" }, { opacity: .9, offset: .2 }, { opacity: 0, transform: `translate(${i % 2 ? 34 : -27}px, 145px) rotate(${i % 2 ? 150 : -110}deg)` }], { delay: i * 30 });
        const position = document.createElementNS(ns, "g");
        position.setAttribute("transform", `translate(${190 + i * 53} ${130 + i % 3 * 35})`);
        layer.append(position);
        position.append(petal);
      }
    }
    figure.dataset.reactions = String(Number(figure.dataset.reactions || 0) + 1);
    const life = layer.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1850 });
    life.onfinish = () => { layer.remove(); figure.classList.remove("is-awakened"); };
    life.oncancel = () => { layer.remove(); figure.classList.remove("is-awakened"); };
  }
  art.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  });
  art.addEventListener("pointermove", (event) => {
    if (pointer?.id === event.pointerId && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) pointer.moved = true;
    if (event.pointerType !== "mouse" || !motion.enabled || !figure.classList.contains("scene-playing")) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!motion.enabled || !figure.classList.contains("scene-playing")) return;
      const rect = art.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      figure.style.setProperty("--parallax-x", `${x * 10}px`);
      figure.style.setProperty("--parallax-y", `${y * 5}px`);
    });
  });
  art.addEventListener("pointerup", (event) => {
    if (pointer?.id === event.pointerId && !pointer.moved) {
      const matrix = svg.getScreenCTM();
      if (matrix) {
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        react({ x: point.x / svg.viewBox.baseVal.width, y: point.y / svg.viewBox.baseVal.height });
      }
    }
    pointer = null;
  });
  art.addEventListener("pointercancel", () => { pointer = null; });
  art.addEventListener("pointerleave", () => {
    pointer = null;
    cancelAnimationFrame(raf);
    figure.style.removeProperty("--parallax-x");
    figure.style.removeProperty("--parallax-y");
  });
  art.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!event.repeat) react(); }
  });
  art.addEventListener("click", (event) => { if (event.detail === 0) react(); });
}

export function initScenes(details, motion) {
  const figures = [...document.querySelectorAll(".scene")];
  const visible = new Set();
  const choreographies = new Map();
  const sync = () => {
    for (const figure of figures) {
      if (figure.dataset.artworkType === "supplied") {
        figure.classList.remove("scene-playing");
        figure.dataset.sequenceState = "still";
        continue;
      }
      const playing = visible.has(figure) && !document.hidden && motion.enabled && !document.querySelector("dialog[open]");
      figure.classList.toggle("scene-playing", playing);
      choreographies.get(figure)?.sync(playing, motion.enabled);
      if (!playing) {
        figure.classList.remove("is-awakened");
        figure.style.removeProperty("--parallax-x");
        figure.style.removeProperty("--parallax-y");
        figure.querySelectorAll(".interaction-effect").forEach((layer) => {
          layer.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
          layer.remove();
        });
      }
      const art = figure.querySelector(".scene-art");
      if (figure.dataset.loaded === "true") {
        art.setAttribute("aria-disabled", String(!motion.enabled));
        art.tabIndex = motion.enabled ? 0 : -1;
      }
    }
  };
  motion.subscribe(sync);
  document.addEventListener("visibilitychange", sync);
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  }, { threshold: 0 });
  const dialogObserver = new MutationObserver(sync);
  document.querySelectorAll("dialog").forEach((dialog) => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] }));
  async function loadScene(figure) {
    const event = figure.dataset.scene === "evara"
      ? { title: details.venue, artwork: details.venueArtwork }
      : details.celebrations.find((item) => item.id === figure.dataset.scene);
    const image = figure.querySelector(".supplied-foreground") || figure.querySelector("img");
    figure.dataset.artworkType = event.artwork.type;
    image.src = event.artwork.src;
    image.alt = event.artwork.alt;
    try {
      if (event.artwork.type === "supplied") {
        await initSuppliedArtwork(figure,event.artwork);
        figure.dataset.loaded = "true";
        figure.dataset.sequenceState = "still";
        return;
      }
      if (event.artwork.type === "svg") {
        const response = await fetch(event.artwork.src);
        if (!response.ok) throw new Error(`Illustration returned ${response.status}`);
        const svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
        if (svg.querySelector("parsererror") || svg.documentElement.localName !== "svg") throw new Error("Invalid illustration SVG");
        if (figure.dataset.scene === "evara") svg.documentElement.setAttribute("preserveAspectRatio", "xMidYMax slice");
        // Only authored, trusted local SVG files belong in this configuration.
        figure.querySelector(".scene-art").replaceChildren(document.importNode(svg.documentElement, true));
      } else {
        throw new Error(`Unsupported artwork type: ${event.artwork.type}`);
      }
      figure.dataset.loaded = "true";
      const choreography = createChoreography(figure);
      choreographies.set(figure, choreography);
      addSceneInteraction(figure, motion, choreography);
      sync();
    } catch (error) {
      console.error(`Could not load ${event.title} artwork:`, error);
      figure.querySelector(".scene-status").textContent = event.artwork.type === "supplied" || (image.complete && !image.naturalWidth)
        ? "Illustration unavailable. The celebration details are below."
        : "Still illustration. Animated artwork could not load.";
    }
  }
  const lazy = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) { lazy.unobserve(entry.target); void loadScene(entry.target); }
  }, { rootMargin: "300px" });
  for (const figure of figures) {
    figure.querySelectorAll("img").forEach(image => image.addEventListener("error", () => {
      console.error(`Illustration image unavailable: ${image.src}`);
      figure.querySelector(".scene-status").textContent = "Illustration unavailable. The celebration details are below.";
    }));
    observer.observe(figure);
    lazy.observe(figure);
  }
  sync();
}
