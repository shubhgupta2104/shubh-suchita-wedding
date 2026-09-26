export function calendarText(details, now = new Date()) {
  const escape = (value) => String(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Shubh and Suchita//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${escape(details.calendarUid)}`,
    `DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${details.calendarStart}`,
    `DTEND;VALUE=DATE:${details.calendarEndExclusive}`,
    `SUMMARY:${escape(`${details.names} Wedding Celebrations`)}`,
    `LOCATION:${escape(`${details.venue}, ${details.destination}`)}`,
    `DESCRIPTION:${escape(`${details.celebrations.map((event) => `${event.title}: ${event.date}, ${event.time}`).join("\n")}\n${details.scheduleNote}\n${details.guestNote}`)}`,
    "TRANSP:TRANSPARENT", "END:VEVENT", "END:VCALENDAR",
  ];
  // RFC 5545 folds at 75 octets, without splitting a UTF-8 character.
  return lines.map((line) => {
    let result = "";
    let bytes = 0;
    for (const character of line) {
      const length = new TextEncoder().encode(character).length;
      if (bytes + length > 75) { result += "\r\n "; bytes = 1; }
      result += character;
      bytes += length;
    }
    return result;
  }).join("\r\n") + "\r\n";
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Keep the URL alive long enough for the browser's download handoff.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function invitationImage(details) {
  const fonts = await Promise.all([
    document.fonts.load('500 100px "Cormorant"'),
    document.fonts.load('italic 60px "Cormorant"'),
  ]);
  if (fonts.some((matches) => matches.length === 0)) throw new Error("The invitation font could not be loaded.");
  const artwork = new Image();
  artwork.src = details.artwork;
  await artwork.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 2200;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create the invitation image.");
  ctx.fillStyle = "#faf5eb";
  ctx.fillRect(0, 0, 1600, 2200);
  ctx.strokeStyle = "#203e32";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, 1504, 2104);
  ctx.strokeStyle = "#baa67c";
  ctx.lineWidth = 1;
  ctx.strokeRect(65, 65, 1470, 2070);
  ctx.textAlign = "center";
  const text = (value, y, size, color = "#203e32", italic = false, maxWidth = 1310) => {
    ctx.fillStyle = color;
    ctx.font = `${italic ? "italic " : ""}500 ${size}px Cormorant`;
    ctx.fillText(value, 800, y, maxWidth);
  };
  const small = (value, y, size = 24, color = "#203e32") => {
    ctx.fillStyle = color;
    ctx.font = `${size}px "Avenir Next", "Segoe UI", sans-serif`;
    ctx.fillText(value, 800, y, 1310);
  };
  small("WITH LOVE, YOU'RE INVITED", 158, 24);
  ctx.save();
  const artSize = 510;
  const scale = Math.min(artSize / artwork.naturalWidth, artSize / artwork.naturalHeight);
  const width = artwork.naturalWidth * scale;
  const height = artwork.naturalHeight * scale;
  ctx.drawImage(artwork, (1600 - width) / 2, 190 + (artSize - height) / 2, width, height);
  ctx.restore();
  const border = new Image();
  border.src = "assets/artwork/lotus-border.svg";
  await border.decode();
  for (let x = 94; x < 1410; x += 144) ctx.drawImage(border, x, 77, 144, 60);
  text(details.firstName, 830, 135);
  text(`& ${details.secondName}`, 955, 135, "#9b5263", true);
  text("With our families by our side,", 1045, 40);
  text("we'd love to have you with us.", 1098, 40, "#203e32", true);
  ctx.strokeStyle = "#baa67c";
  ctx.beginPath(); ctx.moveTo(610, 1150); ctx.lineTo(990, 1150); ctx.stroke();
  text(details.dates, 1240, 66);
  text(details.venue, 1314, 52);
  small(details.destination, 1363, 24);
  details.celebrations.forEach((event, index) => {
    const y = 1460 + index * 74;
    text(event.title, y, 37);
    small(`${event.date}  /  ${event.time}`, y + 30, 21);
  });
  small(details.guestNote, 1845, 22);
  ctx.fillStyle = "#203e32";
  ctx.fillRect(66, 1920, 1468, 214);
  text(`With love, ${details.names}`, 2016, 48, "#faf5eb", true);
  small(details.dateNumerals, 2078, 22, "#e4d9be");
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error("The invitation image could not be exported."));
  }, "image/png"));
}
