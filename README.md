# WAVELENGTH // 1984 SYNTHWAVE EDITION 🕹️✨

A radical, retro 80s neon synthwave web implementation of **Wavelength**. Built with pure client-side HTML5, CSS3, SVG, and Vanilla JavaScript with zero server or external framework dependencies.

---

## 🕹️ Game Flow & Exact Rules

1. **Target Displayed First**: At the start of each round, the target slices are **fully visible** on the gauge so you can see where the frequency target is located.
2. **Hide Target**: Press the **[HIDE TARGET]** button. The neon motorized mechanical shutter slides closed over the target slices.
3. **Set Needle Angle**: Click and drag the laser needle along the 180° dial to set your guess angle (smooth 0.0° to 180.0° drag tracking on mouse and touch screens).
4. **Confirm Guess**: Press **[CONFIRM GUESS]**. The shutter opens immediately to reveal the target, and your score is calculated:
   - 🔵 **Blue Zone (Bullseye)**: **3 Points** (±3.0° direct center)
   - 🟡 **Yellow Zone (Close)**: **2 Points** (flanking wedges, 3° to 8°)
   - 🔴 **Red Zone (Near)**: **1 Point** (outer wedges, 8° to 14°)
   - ⚪ **Miss**: **0 Points** (outside wedges)
5. **Next Round**: Press **[NEXT ROUND]** to advance the stage and keep building your cumulative score!

---

## 🌆 80s Synthwave Aesthetics & Tech Specs

- **80s Neon Retro Style**: Glowing neon magenta (`#ff007f`), cyan (`#00f3ff`), and yellow (`#ffe600`) highlights against a synthwave wireframe horizon grid and striped retro sunset.
- **Classic 80s Typography**: *Press Start 2P*, *Orbitron*, and *VT323* CRT arcade styling with scanline overlay effects.
- **Accurate Needle Physics**: Instant pointer-to-pivot trigonometry calculation (`atan2`) on SVG coordinate space with clamping, responsive across both mouse and multi-touch mobile devices.
- **Chiptune Audio Synthesizer**: Procedural Web Audio API sound effects with frequency-modulating dial tuner clicks, motorized shutter swooshes, and multi-voice 80s synth victory arpeggios.
- **Automated Deployment**: GitHub Actions workflow automatically deploys to GitHub Pages upon push to `main`.
