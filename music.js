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
  const film = document.querySelector("#film-dialog");
  const allowed = () => wantsMusic && !document.hidden && !film.open;
  const render = () => {
    button.setAttribute("aria-pressed", String(wantsMusic));
    button.setAttribute("aria-label", `${wantsMusic ? "Pause" : "Play"} ${settings.title}`);
    button.title = button.getAttribute("aria-label");
    button.querySelector("span").textContent = wantsMusic ? "Music on" : "Music";
    button.classList.toggle("is-playing", !audio.paused);
  };
  const fail = (error) => {
    clearTimeout(loadTimeout);
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
      audio.src = settings.src;
      audio.load();
    }
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
    }
  }
  button.hidden = false;
  button.addEventListener("click", () => { wantsMusic = !wantsMusic; status.textContent = ""; void sync(); });
  audio.addEventListener("error", () => fail(new Error(`Audio error ${audio.error?.code}`)));
  audio.addEventListener("playing", render);
  audio.addEventListener("pause", render);
  document.addEventListener("visibilitychange", () => { void sync(); });
  new MutationObserver(() => { void sync(); }).observe(film, { attributes: true, attributeFilter: ["open"] });
  window.addEventListener("pagehide", () => { audio.pause(); clearTimeout(loadTimeout); });
  window.addEventListener("pageshow", () => { if (wantsMusic) void sync(); });
  document.querySelector("#music-credit").textContent = settings.credit;
  render();
}
