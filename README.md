# The Last Lighthouse: The Missing Light

A first-person 3D coastal mystery and VR rescue adventure set at fictional **Vaanthurai Harbor** on the Tamil Nadu coast. Built with React, TypeScript, Vite, and Three.js, featuring a unified state machine across **Screen / Laptop**, **Android Touch**, **Phone VR** (`StereoCamera` + gyroscope with Touch fallback), and **Immersive WebXR**.

## Story & Playable Locations

1. **Jetty Head (Chapter 1 Opening)**: Fasten the brass storm lantern with Keeper Muthu and ring the harbor departure bell as *M/V Thendral* clears the breakwater—before the cyclone squall cuts shore power.
2. **Lighthouse Radio Room — Floor 1 (Chapter 1)**: Tune the VHF transceiver to **CH 16**, use the binoculars (`Focus 7/10`) to log the mysterious *third light*, and restore the station chart.
3. **Keeper's Cottage & Covered Walkway (Chapter 2)**: Investigate the kettle and tide marks, open the chart drawer, rotate the transparent survey overlay to **`0°`** alignment, and match the coastal landmarks outside the east window.
4. **Generator Gallery — Floor 2 & Boathouse Slipway (Chapter 3 Open Leads)**:
   - *Tower Generator*: Inspect the wiring plate, seat the shape-keyed fuse cartridges (**AUX → Circle**, **DRIVE → Triangle**, **BEACON → Square**), and pull the isolator to restore tower and exterior power.
   - *Boathouse*: Check the tidal slipway scale, read the drifting red buoy (`E-4`) through the Boathouse Telescope (`Focus 6/10`), confirm its spec card, and verify its **Double-Flash** pattern on the bench tester.
5. **Signal Hut & Crooked Mast (Chapter 4)**: Seat the shutter gear, test the signal slit alignment, and plot the North Marker, South Marker, and drifting **E-4** buoy on the Harbor Plot Board to clear the **072°** approach.
6. **Lantern Room, Balcony & *M/V Thendral* Wheelhouse (Chapter 5 & Dawn Epilogue)**: Seat the Fresnel drive pin, raise the lamp, align the beam to **072°**, hold *M/V Thendral* while buoy **E-4** drifts clear, signal **Proceed** via the shutter, optionally take the ferry wheelhouse helm perspective to sound the horn, and celebrate dawn ashore with Muthu and Captain Meera.

## Play Modes & Pacing

- **Full Story Campaign**: 5 chapters plus interactive Dawn Epilogue (`campaign` save slot, automatic v1→v2 checkpoint migration). Designed around a **30–40 minute** pacing target for unhurried first-time exploration, observation, and dialogue.
- **Event Edition**: Fast-tracked public showcase mode targeting a **5–7 minute** booth session with tower power pre-bridged, isolated save storage (`last_lighthouse_event_save_v1`), and a **1-click Reset** on the launch screen (also launchable directly via `?mode=event&autostart=1`).
- **Phone VR Quick Launch**: Append `?stereo=1` to boot directly into side-by-side `StereoCamera` mode.

## Controls & Accessibility

- **Screen / Laptop**: `WASD` walk (with collision), mouse look / click-drag, click or `E` to interact, `Escape` to pause.
- **Android Touch**: Left thumbstick walk, touch-drag look, one-tap waypoint pads (`GO:`), and bottom action dock.
- **Phone VR & WebXR**: Gyroscope / HMD head look with `0.8s` gaze dwell on in-world targets, 3D world-space subtitle slate & VR HUD, Recenter button, and Touch fallback when orientation sensors are unavailable.
- **Settings**: Independent Master / Dialogue / Effects / Music volume sliders, Subtitles toggle, Tamil Closing Line toggle (English + Tamil Epilogue), Reduced Lightning Flashes, Normal / Large UI text, Graphics Quality (`auto` / `mobile` / `high`), and Seated Eye Height adjustment (`-0.40 m` to `+0.40 m`).

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Unit Tests & Type Checking

```bash
npx --yes tsx --test src/game/gameState.test.ts
npm run lint
```

## Production Build

```bash
npm run build
```

This outputs a fully self-contained static bundle in `dist/` with procedural/local assets and no backend, API key, database, or external asset dependencies.

## Static HTTPS Publishing

WebXR (`navigator.xr`) and `DeviceOrientationEvent` sensors on mobile devices require a secure **HTTPS** context.

```bash
# Local static preview
npx vite preview --port 4173 --host 0.0.0.0

# Optional local HTTPS reverse proxy via Caddy
caddy file-server --root dist --listen :8443 --domain localhost
```

Deploy the `dist/` directory to Cloudflare Pages, Netlify, Vercel, GitHub Pages, or any static TLS web server.

