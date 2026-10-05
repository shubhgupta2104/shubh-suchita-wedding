# Shubh & Suchita

Owner: Shubh & Suchita | Updated: 5 October 2026

## TL;DR

- A wedding invitation for 25 and 26 January 2027 at Evara Spa & Resort, Jim Corbett.
- The invitation uses five approved supplied compositions with native-pixel sizing, including the full original Sangeet portrait, horse procession and refined Phere mandap with closer fire.
- Source colours and poses are retained. The flattened figures stay still rather than receiving fabricated limb motion or replay buttons.
- Decorated brass/forest-green wedding gates and an intuitive scratch surface. No separate reveal-bypass button; direct keyboard access remains on the surface.
- Music starts at 0:25 when a guest opens or skips the entrance, subject to browser permission, and plays to the end without looping.

## Why this matters

This is our invitation to the people we would love to have with us.

## What we are doing

The site is static HTML, CSS and JavaScript with local artwork, fonts and media. `config.js` contains event details, the selected illustration set, artwork paths, map settings, the optional RSVP URL and music settings.

## Impact

Phone-first layout, no signup, no guest-data collection by this site. Google Maps loads only after a click. A future RSVP link opens Google Forms. GitHub Pages operates the hosting service.

Reduce Motion uses a short gate dissolve instead of rotation. The supplied character scenes stay still. The motion control governs the original venue's decorative movement and entrance/scratch effects.

## Risks and open questions

RSVP, travel and stay details are forthcoming. Illustrations and invitation gates are representative, not portraits or exact venue plans. The couple confirmed public publication/redistribution permission for the five supplied illustrations on 5 October 2026. Original creators retain their rights; this does not grant a general reuse licence to visitors. The supplied logo and recording retain their separate rights. See `ASSET-SOURCES.md`.

## Ask / Next steps

| Action | Owner | Date |
|---|---|---|
| Confirm RSVP and guest arrangements | Shubh & Suchita | To be confirmed |

## Appendix

Editing: update `config.js` and matching static fallback text in `index.html`. The active approved art lives in `assets/celebrations/`, selected by `illustrationSet: "supplied"`. Keep paths relative so the GitHub Pages project URL works. Source preparation scripts, tests, original uploads and standalone proofs are kept outside the publication package. Serve the directory with an HTTP server for local previews. Future commits, pushes and public updates require approval.
