export function initMusic(settings) {
  const audio = document.querySelector("#background-music");
  const button = document.querySelector("#music-toggle");
  const status = document.querySelector("#music-status");
  if (!settings?.src) return;
  audio.volume = 0.32;
  let wantsMusic = false;
  let pending = false;
  let generation = 0;
  let failed = false;
  let loadTimeout;
  let positioned = false;
  let entranceStarted = false;
  const film = document.querySelector("#film-dialog");
  const allowed = () => wantsMusic && !document.hidden && !film?.open;
  const position = () => {
    if (positioned || audio.readyState < 1) return;
    if (!Number.isFinite(settings.startSeconds) || settings.startSeconds < 0 || settings.startSeconds >= audio.duration) {
      fail(new Error("Music start offset is outside the recording"));
      return;
    }
    audio.currentTime = settings.startSeconds;
    positioned = true;
  };
  const render = () => {
    button.setAttribute("aria-pressed", String(wantsMusic));
    button.setAttribute("aria-label", `${wantsMusic ? "Pause" : "Play"} ${settings.title}`);
    button.title = button.getAttribute("aria-label");
    button.querySelector("span").textContent = wantsMusic ? "Music on" : "Music";
    button.classList.toggle("is-playing", !audio.paused);
  };
  const fail = (error) => {
    clearTimeout(loadTimeout);
    generation++;
    console.error("Background music could not play:", error);
    failed = true;
    wantsMusic = false;
    audio.pause();
    status.textContent = "The music couldn't load. Tap Music to try again.";
    render();
  };
  async function sync() {
    if (!allowed()) {
      generation++;
      audio.pause();
      clearTimeout(loadTimeout);
      render();
      return;
    }
    if (pending || !audio.paused) return;
    const token = ++generation;
    if (!audio.getAttribute("src") || failed) {
      failed = false;
      positioned = false;
      audio.src = settings.src;
      audio.load();
    }
    position();
    if (failed) return;
    pending = true;
    status.textContent = "Loading music...";
    loadTimeout = setTimeout(() => { if (audio.readyState < 3) fail(new Error("Audio load timed out")); }, 20000);
    try {
      await audio.play();
      if (token !== generation || !allowed()) audio.pause();
      else status.textContent = "";
    } catch (error) {
      if (error.name === "NotAllowedError") {
        wantsMusic = false;
        status.textContent = "Tap Music to start playback.";
      } else if (error.name !== "AbortError") fail(error);
    } finally {
      clearTimeout(loadTimeout);
      pending = false;
      render();
      // A new play request can arrive while the previous, interrupted play promise is settling.
      if (token !== generation && allowed()) void sync();
    }
  }
  button.hidden = false;
  button.addEventListener("click", () => { wantsMusic = !wantsMusic; status.textContent = ""; void sync(); });
  if (settings.startOnEntrance) {
    const startAtEntrance = () => {
      if (entranceStarted) return;
      entranceStarted = true;
      wantsMusic = true;
      status.textContent = "";
      void sync();
    };
    document.querySelector("#open-gates").addEventListener("click", startAtEntrance, { once: true });
    document.querySelector("#skip-gates").addEventListener("click", startAtEntrance, { once: true });
  }
  audio.addEventListener("loadedmetadata", position);
  audio.addEventListener("ended", () => {
    wantsMusic = false;
    positioned = false;
    status.textContent = "";
    render();
  });
  audio.addEventListener("error", () => fail(new Error(`Audio error ${audio.error?.code}`)));
  audio.addEventListener("playing", render);
  audio.addEventListener("pause", render);
  document.addEventListener("visibilitychange", () => { void sync(); });
  if (film) new MutationObserver(() => { void sync(); }).observe(film, { attributes: true, attributeFilter: ["open"] });
  window.addEventListener("pagehide", () => { audio.pause(); clearTimeout(loadTimeout); });
  window.addEventListener("pageshow", () => { if (wantsMusic) void sync(); });
  const credit = document.querySelector("#music-credit");
  if (credit) credit.textContent = settings.credit;
  render();
}
