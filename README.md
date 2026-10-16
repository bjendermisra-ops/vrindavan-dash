# Vrindavan Dash

A portrait and landscape 3D endless runner built with local Three.js modules and browser JavaScript. No build step, API keys, external fonts or runtime CDNs are required.

## Play locally

Serve `dist/` through an HTTP static server, for example:

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. Opening `index.html` as a local file will not load ES modules correctly.

## Controls

- Phone/tablet: swipe left/right to dodge, up to jump, down to slide.
- Computer: arrow keys or WASD; Space jumps. Mouse drags also work.
- P or Escape pauses/resumes; 1/2/3 activates the corresponding purchased bag power.
- F or the fullscreen button toggles fullscreen where supported.
- Switching tabs or losing window focus pauses the run.

## Features

Three environments, endless and mission runs, a danav stealing the mala introduction, six coin-unlockable characters, garage purchases, shield/magnet/glide pickups, visible power timers, original synthesized music and effects, achievements and local saves. Directional on-screen buttons have been removed; consumable bag buttons remain.

## Performance

Local assets, compressed WebP material atlas, capped device pixel ratio, adaptive quality, bounded obstacle pools and hidden-tab render suspension. Menus, HUD, camera and scrolling dialogs adapt to portrait, landscape, tablet and desktop dimensions. The WebP atlas is 502,272 bytes versus the original 3,285,536-byte PNG (85% smaller); this measures asset bytes, not a guaranteed device load time.

## Verification

```sh
npm test
npm run check
```

Tests cover input gestures, camera projection, character geometry, run rules, inventory purchases, wallet settlement, progression and audio scheduling. Real-device/browser visual QA and Android wrapper testing are still required before a commercial launch. No universal FPS or loading-time guarantee is claimed.

## Deployment

Publish the contents of `dist/` with any HTTPS static host. Preserve ES module MIME types and relative asset paths. Serve HTML with revalidation; use versioned filenames before applying immutable asset caching. No backend is required.

A WebView wrapper must enable JavaScript, WebGL, DOM storage, user-gesture audio and proper lifecycle pause/resume. Fullscreen availability depends on its host. Android packaging and Play Store submission are separate from this web source release.

## Save and security boundaries

Wallet, character ownership, achievements and settings are stored on this browser/device. This is not a server-authoritative economy: it does not offer cross-device synchronization, tamper-proof purchases, real-money transactions or competitive anti-cheat. Never place service tokens in client files.

## Assets

Character/environment geometry and UI are original procedural implementations. The generated material atlas is a visual texture resource. Third-party Little Krishna/Temple Run/Subway Surfers artwork is not bundled. This implementation is not a pixel-identical reproduction of the reference artwork. Three.js and BufferGeometryUtils retain the upstream license under `dist/vendor/`.
