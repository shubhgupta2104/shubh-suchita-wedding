import { invitation } from "./config.js";
import { calendarText, invitationImage, saveBlob } from "./downloads.js";
import { initExperience, initPractical, initScenes, initMotion } from "./experience.js";
import { initMusic } from "./music.js";
import { initComponentReveals, initVenueGallery } from "./interactions.js";
import { initMomentInteractions, initCelebrationNavigation } from "./assets/celebrations/moments.js";

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
  const time = document.createElement("strong");
  date.className = "event-date";
  time.className = "event-clock";
  date.textContent = event.date;
  time.textContent = event.time;
  element.replaceChildren(date, document.createTextNode(" "), time);
});
document.querySelectorAll("[data-venue-link]").forEach((link) => {
  link.href = invitation[link.dataset.venueLink];
});
document.title = `${invitation.names} | A beautiful beginning`;
const motion = initMotion();
initExperience(invitation, motion);
initPractical(invitation);
initScenes(invitation, motion);
initMusic(invitation.music);
initVenueGallery(invitation);
initComponentReveals(motion);
initMomentInteractions(invitation,motion);
initCelebrationNavigation();

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
