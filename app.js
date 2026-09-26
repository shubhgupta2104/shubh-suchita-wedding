import { invitation, films } from "./config.js";
import { calendarText, invitationImage, saveBlob } from "./downloads.js";
import { initExperience, initPractical, initScenes, initMotion } from "./experience.js";
import { initMusic } from "./music.js";

document.querySelectorAll("[data-detail]").forEach((element) => {
  element.textContent = invitation[element.dataset.detail];
});
document.querySelectorAll("[data-artwork]").forEach((image) => {
  image.src = invitation.artwork;
  image.alt = invitation.artworkAlt;
});
document.querySelectorAll("[data-event]").forEach((element) => {
  const [index, key] = element.dataset.event.split(".");
  element.textContent = invitation.celebrations[Number(index)][key];
});
document.querySelectorAll("[data-event-time]").forEach((element) => {
  const event = invitation.celebrations[Number(element.dataset.eventTime)];
  element.dateTime = event.start;
  const date = document.createElement("span");
  const time = document.createElement("span");
  date.textContent = event.date;
  time.textContent = event.time;
  element.replaceChildren(date, document.createTextNode(" "), time);
});
document.querySelectorAll("[data-venue-link]").forEach((link) => {
  link.href = invitation[link.dataset.venueLink];
});
document.querySelector("[data-venue-credit]").textContent = invitation.venueArtwork.credit;
document.title = `${invitation.names} | A beautiful beginning`;
const motion = initMotion();
initExperience(invitation, motion);
initPractical(invitation);
initScenes(invitation, motion);
initMusic(invitation.music);

const dialog = document.querySelector("#film-dialog");
const player = document.querySelector("#film-player");
const filmStatus = document.querySelector("#film-status");
let filmLoadingTimer;
let openedBy;
let currentFilm;
let savedScrollY = 0;

function filmError() {
  clearTimeout(filmLoadingTimer);
  filmStatus.textContent = "This sample film couldn't load. Close the viewer and try again.";
}
player.addEventListener("error", () => { if (dialog.open) filmError(); });
player.addEventListener("canplay", () => {
  clearTimeout(filmLoadingTimer);
  filmStatus.textContent = currentFilm?.hasAudio
    ? "Sound starts off. Use the player controls to play, pause or enable sound."
    : "This sample film is silent. Use the player controls to play or pause.";
});
player.addEventListener("playing", () => {
  if (document.hidden || !dialog.open) player.pause();
});
document.addEventListener("visibilitychange", () => { if (document.hidden) player.pause(); });
window.addEventListener("pagehide", () => player.pause());
new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) player.pause();
}, { threshold: 0 }).observe(player);

document.querySelectorAll("[data-open-film]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const film = films[button.dataset.openFilm];
    currentFilm = film;
    openedBy = button;
    savedScrollY = window.scrollY;
    document.querySelector("#dialog-title").textContent = film.caption;
    document.querySelector("#dialog-caption").textContent = film.label;
    const creditLink = document.createElement("a");
    creditLink.href = film.source;
    creditLink.target = "_blank";
    creditLink.rel = "noopener noreferrer";
    creditLink.textContent = `${film.credit} / ${film.license}`;
    document.querySelector("#dialog-credit").replaceChildren(creditLink);
    player.poster = film.poster;
    player.setAttribute("aria-label", film.description);
    player.src = film.src;
    player.muted = true;
    filmStatus.textContent = "Loading sample film...";
    dialog.showModal();
    document.body.classList.add("modal-open");
    document.querySelector("#dialog-close").focus();
    filmLoadingTimer = setTimeout(() => {
      if (player.readyState < 3) { player.pause(); filmError(); }
    }, 15000);
    try {
      await player.play();
      if (!dialog.open || document.hidden) player.pause();
    } catch (error) {
      if (error.name === "NotAllowedError") filmStatus.textContent = "Press Play in the viewer to start. Sound is off.";
      else if (error.name !== "AbortError") {
        console.error("Film viewer playback failed:", error);
        filmError();
      }
    }
  });
});
document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener("close", () => {
  clearTimeout(filmLoadingTimer);
  player.pause();
  player.removeAttribute("src");
  player.load();
  document.body.classList.remove("modal-open");
  window.scrollTo({ top: savedScrollY, behavior: "instant" });
  openedBy?.focus({ preventScroll: true });
});
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const first = document.querySelector("#dialog-close");
  const last = document.querySelector("#dialog-credit a");
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const credits = document.querySelector("#film-credits");
Object.values(films).forEach((film) => {
  const paragraph = document.createElement("p");
  const source = document.createElement("a");
  source.href = film.source; source.target = "_blank"; source.rel = "noopener noreferrer";
  source.textContent = `${film.caption}: ${film.credit}`;
  const license = document.createElement("a");
  license.href = film.licenseUrl; license.target = "_blank"; license.rel = "noopener noreferrer";
  license.textContent = film.license;
  paragraph.append(source, ". ", license, ". ", film.label, ".");
  credits.append(paragraph);
});

const calendarButton = document.querySelector("#calendar-download");
const imageButton = document.querySelector("#image-download");
const downloadStatus = document.querySelector("#download-status");
calendarButton.hidden = false;
imageButton.hidden = false;
calendarButton.addEventListener("click", () => {
  saveBlob(new Blob([calendarText(invitation)], { type: "text/calendar;charset=utf-8" }), "shubh-suchita-wedding.ics");
  downloadStatus.textContent = `Calendar file ready: ${invitation.dates}. Open it to add both days.`;
});
imageButton.addEventListener("click", async () => {
  imageButton.disabled = true;
  downloadStatus.textContent = "Preparing your invitation image...";
  try {
    saveBlob(await invitationImage(invitation), "shubh-suchita-invitation.png");
    downloadStatus.textContent = "Your invitation image is ready. Check your browser's downloads.";
  } catch (error) {
    console.error("Invitation image export failed:", error);
    downloadStatus.textContent = "The image couldn't be created. Please try again after the artwork and fonts have loaded.";
  } finally {
    imageButton.disabled = false;
  }
});
