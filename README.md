# Shubh & Suchita

Owner: Shubh & Suchita | Updated: 1 October 2026

## TL;DR

- A wedding invitation for 25 and 26 January 2027 at Evara Spa & Resort, Jim Corbett.
- Five coordinated smooth vector compositions with distinct ceremony poses, full function-specific backgrounds and restrained, finite animation.
- The illustrations contain no screenshot crops or embedded raster artwork.
- Music starts at 0:12 when a guest opens or skips the entrance, subject to browser permission, and plays to the end without looping.

## Why this matters

This is our invitation to the people we would love to have with us.

## What we are doing

The site is static HTML, CSS and JavaScript with local artwork, fonts and media. `config.js` contains event details, artwork paths, illustration-source credits, map settings, the optional RSVP URL and music settings.

## Impact

Phone-first layout, no signup, no guest-data collection by this site. Google Maps loads only after a click. A future RSVP link opens Google Forms. GitHub Pages operates the hosting service.

Reduce Motion uses a short gate dissolve instead of rotation and keeps character scenes still by default. The motion control allows a guest to explicitly enable animation for the current visit.

## Risks and open questions

RSVP, travel and stay details are forthcoming. Illustrations are representative, not portraits or exact venue plans. Shared character styling is informed by a licensed Fliqa India photograph; the five function poses and backgrounds are newly drawn. The supplied logo and recording retain their separate rights. See `ASSET-SOURCES.md`.

## Ask / Next steps

| Action | Owner | Date |
|---|---|---|
| Confirm RSVP and guest arrangements | Shubh & Suchita | To be confirmed |

## Appendix

Editing: update `config.js` and matching static fallback text in `index.html`. Drawings are authored in `scripts/illustrated-scenes.mjs`, with shared character styling in `scripts/portrait-style.mjs`; regenerate them with `node scripts/build-scenes.mjs`. Keep local asset paths relative so GitHub Pages project URLs work. Serve the directory with an HTTP server for local previews.
