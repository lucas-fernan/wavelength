# Wavelength 🎯

A standalone, production-ready, client-side web implementation of the telepathic party board game **Wavelength**. Built with modern HTML5, CSS3, SVG, and Vanilla JavaScript with zero server or framework dependencies.

Play directly on any device with touch or mouse support, featuring an authentic 180° mechanical dial wheel, tactile audio synthesis via the Web Audio API, and an automated GitHub Pages deployment workflow.

---

## 🕹️ Game Rules & Flow

**Wavelength** is a social guessing game where two teams (or a group) try to read each other's minds:

1. **Spectrum Drawn**: A pair of opposing binary concepts is revealed (drawn from a built-in deck of 65+ pairs, e.g. *Cold ↔ Hot*, *Rough ↔ Smooth*, *Harmless ↔ Extremely Dangerous*).
2. **The Psychic**: The designated Psychic clicks **Psychic Peek** to secretly check where the colored target wedge is positioned on the 180° spectrum.
3. **The Clue**: The Psychic gives a one-concept clue indicating where the target lies between the two endpoints (e.g., for *Cold ↔ Hot*, "Coffee" might be 135°, while "The Sun" might be 180°).
4. **Hide Target**: The Psychic clicks **Hide Target** to ensure the wheel cover closes before the team confers.
5. **The Team's Guess**: The team discusses the clue and clicks/drags the red needle to place their guess anywhere along the 0° to 180° arc.
6. **Reveal & Score**: Click **Reveal Target & Score** to slide back the shutter, reveal the target slices, and automatically tally points:
   - 🎯 **5 Points (Bull's Eye)**: Dark Blue center slice (±2.5°)
   - ⭐ **3 Points (Close)**: Yellow slices flanking the bullseye (±6.5°)
   - ✨ **1 Point (Near)**: Red outer slices (±10.5°)
   - ❌ **0 Points (Miss)**: Outside the target zone
7. **Next Round / New Game**: Continue to the next round to build your cumulative score, or start a new game anytime.

---

## 🎨 Visual & Mechanical Features

- **Realistic 180° Semicircular Wheel**: SVG-rendered gauge with ticks, degree marks, and fluid drag physics.
- **Symmetrical Scoring Slices**: Exact geometric sector wedges centered behind the needle path matching the physical game.
- **Sliding Mechanical Shutter**: Smooth animated cover mechanism that protects the psychic's secret target from view.
- **Web Audio Feedback**: Real-time synthesized mechanical clicks while turning the dial, smooth slide swoosh for the shutter, and celebratory audio fanfares on scoring.
- **100% Mobile Responsive**: Fluid layout tailored for phones, tablets, and desktop displays with responsive touch events.

---

## 📂 Repository Structure

```
wavelength/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages deploy on push to main
├── index.html              # Accessible layout, controls, and SVG dial markup
├── style.css               # Tactile board game styling, themes, and animations
├── app.js                  # Math engine, pointer drag handlers, audio synth, deck
└── README.md               # Overview, rules, and deployment instructions
```

---

## 🚀 Deployment Instructions

### GitHub Pages (Automated via GitHub Actions)
1. Push this repository to GitHub on branch `main`.
2. In your repository settings:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Any push to `main` will automatically build and publish the game to `https://<username>.github.io/<repo-name>/`.

### Local Development
Because the project has zero external dependencies or build pipelines, you can run it locally with any static web server:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.
