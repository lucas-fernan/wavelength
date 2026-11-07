/**
 * WAVELENGTH - Standalone Web Implementation
 * Complete game logic, drag mechanics, audio synthesis, and scoring.
 */

// 60+ curated binary pairs covering diverse domains
const SPECTRUM_PAIRS = [
  ["Cold", "Hot"],
  ["Rough", "Smooth"],
  ["Underrated", "Overrated"],
  ["Bad Actor", "Good Actor"],
  ["Useless Superpower", "Useful Superpower"],
  ["Guilty Pleasure", "Openly Proud"],
  ["Soft", "Hard"],
  ["Cheap", "Expensive"],
  ["Quiet", "Loud"],
  ["Boring Hobby", "Exciting Hobby"],
  ["Tastes Terrible", "Delicious"],
  ["Harmless", "Extremely Dangerous"],
  ["Low Calorie", "High Calorie"],
  ["Unethical", "Ethical"],
  ["Waste of Time", "Time Well Spent"],
  ["Historical Event", "Pop Culture"],
  ["Requires Skill", "Pure Luck"],
  ["Sad Movie", "Happy Movie"],
  ["Smells Bad", "Smells Good"],
  ["Easy to Learn", "Difficult to Master"],
  ["Introvert", "Extrovert"],
  ["Casual", "Formal"],
  ["Temporary", "Permanent"],
  ["Unpopular Opinion", "Universal Fact"],
  ["Selfish", "Altruistic"],
  ["Traditional", "Futuristic"],
  ["Mild", "Spicy"],
  ["Niche", "Mainstream"],
  ["Feels Illegal But Isn't", "Feels Legal But Is Illegal"],
  ["Messy", "Neat"],
  ["Weak", "Strong"],
  ["Unforgivable", "Easily Forgiven"],
  ["Nerdy", "Cool"],
  ["Short-term Fix", "Permanent Solution"],
  ["Normal Pet", "Exotic Pet"],
  ["Dull", "Sharp"],
  ["Fad", "Timeless Classic"],
  ["Dark", "Bright"],
  ["Low Risk", "High Risk"],
  ["Forgettable", "Unforgettable"],
  ["Childish", "Mature"],
  ["Superficial", "Deep"],
  ["Overpriced", "Bargain"],
  ["Scary", "Funny"],
  ["Slow", "Fast"],
  ["Awkward", "Smooth"],
  ["Microscopic", "Gigantic"],
  ["Annoying", "Charming"],
  ["Artificial", "Natural"],
  ["Predictable", "Surprising"],
  ["Bad Habit", "Good Habit"],
  ["Chaotic Evil", "Lawful Good"],
  ["Fragile", "Indestructible"],
  ["Ordinary", "Magical"],
  ["Trivial", "Life-Changing"],
  ["Basic", "Artistic"],
  ["Overrated Movie", "Underrated Movie"],
  ["Ugly", "Beautiful"],
  ["Temporary Trend", "Forever"],
  ["Comfort Food", "Acquired Taste"],
  ["Easy to Break", "Sturdy"],
  ["Trashy", "Classy"],
  ["Awkward Silence", "Deep Conversation"],
  ["Unpleasant chore", "Satisfying chore"],
  ["Cold Drink", "Warm Drink"]
];

// Audio Synthesizer using Web Audio API for tactile clicks & chimes
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Subdued mechanical dial click
  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      // High pitch instant burst
      osc.frequency.setValueAtTime(800 + Math.random() * 300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Shutter slide sound
  playShutter() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {}
  }

  // Reveal fanfare based on points scored
  playReveal(points) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = {
      5: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 (Major arpeggio)
      3: [440.0, 554.37, 659.25],          // A4, C#5, E5
      1: [329.63, 392.0],                  // E4, G4
      0: [220.0, 196.0]                    // Downward bummer
    }[points] || [440];

    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = points === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.32);
        } catch (e) {}
      }, idx * 80);
    });
  }
}

class WavelengthGame {
  constructor() {
    this.sound = new SoundEffects();
    
    // Game State
    this.round = 1;
    this.totalScore = 0;
    this.currentDeck = [...SPECTRUM_PAIRS];
    this.shuffleDeck();
    this.deckIndex = 0;

    // Target geometry: targetCenter is an angle between 15° and 165°
    this.targetCenter = 90;
    this.needleAngle = 90; // Default center (90°)
    this.isDragging = false;
    this.lastTickAngle = 90;
    this.shutterState = 'closed'; // 'closed' | 'open'
    this.roundConcluded = false;

    // DOM Elements
    this.leftConceptEl = document.getElementById('left-concept');
    this.rightConceptEl = document.getElementById('right-concept');
    this.roundNumEl = document.getElementById('round-number');
    this.totalScoreEl = document.getElementById('total-score');
    this.angleValEl = document.getElementById('angle-value');
    this.angleDescEl = document.getElementById('angle-description');
    this.statusBannerEl = document.getElementById('game-status-banner');

    this.wheelStageEl = document.getElementById('wheel-stage');
    this.svgEl = document.getElementById('wavelength-svg');
    this.ticksGroup = document.getElementById('ticks-group');
    this.targetSlicesGroup = document.getElementById('target-slices-group');
    this.shutterGroup = document.getElementById('shutter-group');
    this.needleGroup = document.getElementById('needle-group');

    // Controls
    this.btnPeek = document.getElementById('btn-peek');
    this.btnHide = document.getElementById('btn-hide');
    this.btnReveal = document.getElementById('btn-reveal');
    this.btnNextRound = document.getElementById('btn-next-round');
    this.btnNewGame = document.getElementById('btn-new-game');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');

    // Modal
    this.resultModal = document.getElementById('result-modal');
    this.resultTitle = document.getElementById('result-title');
    this.resultPoints = document.getElementById('result-points');
    this.resultDetail = document.getElementById('result-detail');
    this.resTargetDeg = document.getElementById('res-target-deg');
    this.resNeedleDeg = document.getElementById('res-needle-deg');
    this.resDiffDeg = document.getElementById('res-diff-deg');
    this.btnModalDismiss = document.getElementById('btn-modal-dismiss');

    this.init();
  }

  shuffleDeck() {
    for (let i = this.currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.currentDeck[i], this.currentDeck[j]] = [this.currentDeck[j], this.currentDeck[i]];
    }
  }

  init() {
    this.renderTicks();
    this.bindEvents();
    this.startRound();
  }

  renderTicks() {
    this.ticksGroup.innerHTML = '';
    const cx = 250, cy = 250;
    const rOuter = 224;
    
    // Draw degree ticks from 0° (left) to 180° (right) every 5 degrees
    for (let deg = 0; deg <= 180; deg += 5) {
      // In SVG coordinates, 0° is left (-X, baseline), 90° is top (-Y), 180° is right (+X, baseline)
      // Math rad: 0 deg on dial = Math.PI rad, 90 deg = Math.PI / 2, 180 deg = 0
      const mathAngle = Math.PI - (deg * Math.PI / 180);
      const isMajor = deg % 30 === 0;
      const isMid = deg % 15 === 0;
      const tickLen = isMajor ? 12 : (isMid ? 8 : 4);
      const rInner = rOuter - tickLen;

      const x1 = cx + rOuter * Math.cos(mathAngle);
      const y1 = cy - rOuter * Math.sin(mathAngle);
      const x2 = cx + rInner * Math.cos(mathAngle);
      const y2 = cy - rInner * Math.sin(mathAngle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', `tick-line ${isMajor ? 'major' : ''}`);
      this.ticksGroup.appendChild(line);

      // Major label numbers
      if (isMajor) {
        const rText = rInner - 10;
        const tx = cx + rText * Math.cos(mathAngle);
        const ty = cy - rText * Math.sin(mathAngle) + 4;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'tick-label');
        text.textContent = `${deg}°`;
        this.ticksGroup.appendChild(text);
      }
    }
  }

  // Draw circular sector wedge in SVG: from startDeg to endDeg on 0-180 scale
  createWedgePath(cx, cy, r, startDeg, endDeg) {
    // Clamp within 0 and 180
    const s = Math.max(0, Math.min(180, startDeg));
    const e = Math.max(0, Math.min(180, endDeg));
    if (s >= e) return '';

    const startRad = Math.PI - (s * Math.PI / 180);
    const endRad = Math.PI - (e * Math.PI / 180);

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy - r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy - r * Math.sin(endRad);

    const largeArc = (e - s) > 180 ? 1 : 0;
    // In SVG, going clockwise from startRad (larger angle) to endRad (smaller angle):
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  renderTargetSlices(centerAngle) {
    this.targetSlicesGroup.innerHTML = '';
    const cx = 250, cy = 250, r = 224;

    // Standard Wavelength target slices (symmetrically centered):
    // Bullseye (dark blue): center ± 2.5° (width 5°) -> 5 pts
    // Yellow flanks: 2.5° to 6.5° on both sides (width 4° each) -> 3 pts
    // Red outer flanks: 6.5° to 10.5° on both sides (width 4° each) -> 1 pt
    const zones = [
      // Left Red (1 pt)
      { start: centerAngle - 10.5, end: centerAngle - 6.5, fill: '#eb3b5a', pts: 1 },
      // Left Yellow (3 pts)
      { start: centerAngle - 6.5, end: centerAngle - 2.5, fill: '#f7b731', pts: 3 },
      // Center Bullseye Dark Blue (5 pts)
      { start: centerAngle - 2.5, end: centerAngle + 2.5, fill: '#1e3799', pts: 5 },
      // Right Yellow (3 pts)
      { start: centerAngle + 2.5, end: centerAngle + 6.5, fill: '#f7b731', pts: 3 },
      // Right Red (1 pt)
      { start: centerAngle + 6.5, end: centerAngle + 10.5, fill: '#eb3b5a', pts: 1 },
    ];

    zones.forEach(zone => {
      const d = this.createWedgePath(cx, cy, r, zone.start, zone.end);
      if (d) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', zone.fill);
        path.setAttribute('stroke', '#ffffff');
        path.setAttribute('stroke-width', '0.75');
        path.setAttribute('opacity', '0.95');
        this.targetSlicesGroup.appendChild(path);
      }
    });

    // Add a center hairline marker on the target
    const targetRad = Math.PI - (centerAngle * Math.PI / 180);
    const lineX = cx + r * Math.cos(targetRad);
    const lineY = cy - r * Math.sin(targetRad);
    const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    centerLine.setAttribute('x1', cx);
    centerLine.setAttribute('y1', cy);
    centerLine.setAttribute('x2', lineX);
    centerLine.setAttribute('y2', lineY);
    centerLine.setAttribute('stroke', '#ffffff');
    centerLine.setAttribute('stroke-width', '1.5');
    centerLine.setAttribute('stroke-dasharray', '3 3');
    this.targetSlicesGroup.appendChild(centerLine);
  }

  startRound() {
    this.roundConcluded = false;

    // Pick new binary pair
    if (this.deckIndex >= this.currentDeck.length) {
      this.shuffleDeck();
      this.deckIndex = 0;
    }
    const currentPair = this.currentDeck[this.deckIndex++];
    this.leftConceptEl.textContent = currentPair[0];
    this.rightConceptEl.textContent = currentPair[1];

    // Pick random target position between 18° and 162° (leaving safe margins from wheel ends)
    this.targetCenter = Math.floor(Math.random() * 145) + 18;
    this.renderTargetSlices(this.targetCenter);

    // Reset needle to center (90°)
    this.setNeedleAngle(90);

    // Shutter begins closed
    this.setShutter(false);

    // Update UI states
    this.roundNumEl.textContent = this.round;
    this.btnNextRound.disabled = true;
    this.btnReveal.disabled = false;
    this.statusBannerEl.innerHTML = '1. Psychic: Click <strong>Psychic Peek</strong> to secretly inspect the target, then give a clue!';
  }

  setShutter(isOpen) {
    if (isOpen) {
      this.shutterGroup.classList.remove('closed');
      this.shutterGroup.classList.add('opened');
      this.shutterState = 'open';
    } else {
      this.shutterGroup.classList.remove('opened');
      this.shutterGroup.classList.add('closed');
      this.shutterState = 'closed';
    }
    this.sound.playShutter();
  }

  setNeedleAngle(deg) {
    // Clamp needle between 0° (left) and 180° (right)
    this.needleAngle = Math.max(0, Math.min(180, Math.round(deg * 10) / 10));
    
    // In our SVG:
    // When pointer polygon is drawn straight up (12 o'clock), rotating it by:
    // Dial 0° = 9 o'clock (-90° rotation from 12 o'clock)
    // Dial 90° = 12 o'clock (0° rotation)
    // Dial 180° = 3 o'clock (+90° rotation)
    const svgRotation = this.needleAngle - 90;
    this.needleGroup.setAttribute('transform', `rotate(${svgRotation}, 250, 250)`);

    // Update angle readout display
    this.angleValEl.textContent = `${Math.round(this.needleAngle)}°`;
    if (this.needleAngle < 40) {
      this.angleDescEl.textContent = `(Heavy ${this.leftConceptEl.textContent})`;
    } else if (this.needleAngle > 140) {
      this.angleDescEl.textContent = `(Heavy ${this.rightConceptEl.textContent})`;
    } else if (this.needleAngle >= 80 && this.needleAngle <= 100) {
      this.angleDescEl.textContent = '(Dead Center)';
    } else if (this.needleAngle < 90) {
      this.angleDescEl.textContent = `(Leaning ${this.leftConceptEl.textContent})`;
    } else {
      this.angleDescEl.textContent = `(Leaning ${this.rightConceptEl.textContent})`;
    }

    // Play subtle mechanical tick every ~3 degrees
    if (Math.abs(this.needleAngle - this.lastTickAngle) >= 3.0) {
      this.sound.playTick();
      this.lastTickAngle = this.needleAngle;
    }
  }

  calculateScore() {
    const diff = Math.abs(this.needleAngle - this.targetCenter);
    let points = 0;
    let title = "Missed!";
    let detail = "Out of the target zone. Keep tuning your telepathic frequency!";

    if (diff <= 2.5) {
      points = 5;
      title = "Bull's Eye! 🎯";
      detail = "Direct hit in the dark blue zone! Exact frequency match!";
    } else if (diff <= 6.5) {
      points = 3;
      title = "Close! ⭐";
      detail = "Landed in the yellow zone. Great psychic intuition!";
    } else if (diff <= 10.5) {
      points = 1;
      title = "Near! ✨";
      detail = "Clipped the outer red zone. Points on the board!";
    }

    return { points, title, detail, diff: diff.toFixed(1) };
  }

  revealAndScore() {
    if (this.roundConcluded) return;
    this.roundConcluded = true;

    // Open shutter completely to reveal the target
    this.setShutter(true);

    const scoreData = this.calculateScore();
    this.totalScore += scoreData.points;
    this.totalScoreEl.textContent = this.totalScore;

    this.sound.playReveal(scoreData.points);

    // Show result modal
    this.resultTitle.textContent = scoreData.title;
    this.resultPoints.textContent = `+${scoreData.points} PTS`;
    this.resultPoints.className = `result-points points-${scoreData.points}`;
    this.resultDetail.textContent = scoreData.detail;
    this.resTargetDeg.textContent = `${this.targetCenter.toFixed(1)}°`;
    this.resNeedleDeg.textContent = `${this.needleAngle.toFixed(1)}°`;
    this.resDiffDeg.textContent = `${scoreData.diff}°`;

    this.resultModal.classList.remove('hidden');

    this.btnReveal.disabled = true;
    this.btnNextRound.disabled = false;
    this.statusBannerEl.innerHTML = `Round completed! Scored <strong>+${scoreData.points} points</strong>. Click <strong>Next Round</strong> to keep playing!`;
  }

  // Pointer & Drag Coordinate Calculation
  handlePointerEvent(event) {
    const svgRect = this.svgEl.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return;

    // SVG coordinate space is 500 x 290, pivot center is (250, 250)
    const scaleX = 500 / svgRect.width;
    const scaleY = 290 / svgRect.height;

    const svgX = (clientX - svgRect.left) * scaleX;
    const svgY = (clientY - svgRect.top) * scaleY;

    // Vector from pivot (250, 250) to pointer
    const dx = svgX - 250;
    const dy = 250 - svgY; // Invert Y because SVG Y goes downward

    // Calculate angle in degrees
    // Math.atan2(dy, dx) returns:
    // Left (-1, 0) => Math.PI rad (180 deg)
    // Top (0, 1) => Math.PI / 2 rad (90 deg)
    // Right (1, 0) => 0 rad (0 deg)
    let rad = Math.atan2(dy, dx);
    let deg = (Math.PI - rad) * (180 / Math.PI);

    // If pointer goes slightly below baseline, clamp to nearest end
    if (dy < 0) {
      deg = dx < 0 ? 0 : 180;
    }

    this.setNeedleAngle(deg);
  }

  bindEvents() {
    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      const enabled = this.sound.toggle();
      if (enabled) {
        this.soundIconOn.classList.remove('hidden');
        this.soundIconOff.classList.add('hidden');
      } else {
        this.soundIconOn.classList.add('hidden');
        this.soundIconOff.classList.remove('hidden');
      }
    });

    // Psychic Peek (Peek / Toggle Shutter)
    this.btnPeek.addEventListener('click', () => {
      this.sound.init();
      this.setShutter(true);
      this.statusBannerEl.innerHTML = '👀 <strong>Psychic Peek Active:</strong> Memorize the target position, then click <em>Hide Target</em>!';
    });

    // Hide Target (Lock in cover for guessing)
    this.btnHide.addEventListener('click', () => {
      this.sound.init();
      this.setShutter(false);
      this.statusBannerEl.innerHTML = '🎯 <strong>Team Turn:</strong> Discuss the clue and drag the red needle to lock in your guess!';
    });

    // Reveal & Score
    this.btnReveal.addEventListener('click', () => {
      this.sound.init();
      this.revealAndScore();
    });

    // Next Round
    this.btnNextRound.addEventListener('click', () => {
      this.round++;
      this.startRound();
    });

    // New Game Reset
    this.btnNewGame.addEventListener('click', () => {
      if (confirm('Start a new game and reset total score?')) {
        this.round = 1;
        this.totalScore = 0;
        this.shuffleDeck();
        this.deckIndex = 0;
        this.startRound();
      }
    });

    // Modal dismiss
    this.btnModalDismiss.addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
    });

    // Drag handlers for the needle
    const onPointerDown = (e) => {
      this.sound.init();
      this.isDragging = true;
      this.needleGroup.classList.add('dragging');
      this.handlePointerEvent(e);
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      this.handlePointerEvent(e);
      e.preventDefault();
    };

    const onPointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.needleGroup.classList.remove('dragging');
      }
    };

    // Attach to wheel stage for fluid touch & pointer interactions
    this.wheelStageEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.wheelStageEl.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);
  }
}

// Instantiate game on load
window.addEventListener('DOMContentLoaded', () => {
  new WavelengthGame();
});
