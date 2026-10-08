# Shubh & Suchita

Owner: Shubh & Suchita | Updated: 8 October 2026

## TL;DR

- A wedding invitation for 25 and 26 January 2027 at Evara Spa & Resort, Jim Corbett.
- Five approved native-resolution illustrations retain their colours and poses. Larger environmental effects play automatically once on entry: marigolds, sparkle, confetti, rose petals or warm firelight.
- Decorated gates, intuitive scratching, one-shot component entrances and day navigation make the invitation interactive. Music starts at 0:25 and does not loop.
- Function times are prominent and appear before illustrations on phones. Credits, sample films, travel/stay placeholder copy and visible timezone labels are removed.
- Three permission-approved actual Evara photographs have an accessible viewer. The couple's bilingual Google Form is embedded directly in the RSVP section.

## Why this matters

This is our invitation to the people we would love to have with us.

## What we are doing

The site is static HTML, CSS and JavaScript with local artwork, fonts and media. `config.js` contains event details, the selected illustration set, artwork paths, map settings, the published Google Forms responder URL and music settings. The couple supplied their existing form; only its verified guest-facing URL is used here.

The hero and downloadable invitation show Shubh Gupta with Rekha Gupta and Ajay Gupta beneath his name, and Suchita Gaur with Madhu Sharma and Harish Kant Sharma beneath hers. Mothers are listed first.

## Impact

Phone-first layout and no guest-data storage by this site. Google Maps loads only after a click. The inline RSVP sends responses directly to the couple's Google Form and is available without Google sign-in. A separate-open link and no-JavaScript link reach the same form. GitHub Pages operates the hosting service.

Reduce Motion uses a short gate dissolve instead of rotation. Source characters stay still; environmental effects automatically play for 4.6 seconds, not fabricated limb animation. Device Reduce Motion and Save-Data are supported. There is no decorative pause button; music retains its separate play/pause control.

## Risks and open questions

The existing Google Form was read and embedded, not created or changed by the agent. It includes English/Hindi name, attendance, days, family count, phone, arrival date/time and function questions. Declining routes directly to submission and skips attendee details; attending routes to "Your plans / आपकी योजना". The owner enabled both arrival date and time, with the year included, and made arrival required for attending guests. Form settings remain under the couple's control. Verification did not submit a response. Venue photograph permission was explicitly confirmed. Original creators retain their rights; this does not grant visitor reuse rights. See `ASSET-SOURCES.md`.

## Appendix

Editing: update `config.js` and matching static fallback text in `index.html`. Google Form question/settings changes appear in the embed directly; changing forms requires updating the responder URL and no-JavaScript fallback. The active approved art lives in `assets/celebrations/`, selected by `illustrationSet: "supplied"`. Keep paths relative so the GitHub Pages project URL works. Source preparation scripts, tests, original uploads and standalone proofs are kept outside the publication package. Serve the directory with an HTTP server for local previews. Future commits, pushes and public updates require approval.
