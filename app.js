/**
 * WAVELENGTH // 1984 SYNTHWAVE EDITION
 * Pure 80s arcade style, improved fluid needle dragging,
 * scoring: Blue=3, Yellow=2, Red=1, Miss=0
 * flow: Target visible at start -> Hide Target -> Move needle -> Confirm Guess -> Target revealed!
 */

// 80s Retro Chiptune & Synth Synthesizer via Web Audio API
class RetroSynthAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
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

  // Chiptune blip when turning the needle
  playTick(angle) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      // Pitch shifts subtly with dial angle like a retro tuner
      const freq = 350 + (angle / 180) * 450;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Futuristic motorized laser shutter swoop
  playShutterSwoosh(closing) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const startF = closing ? 600 : 200;
      const endF = closing ? 150 : 750;

      osc.frequency.setValueAtTime(startF, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endF, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.24);
    } catch (e) {}
  }

  // 80s Arcade Fanfare or Bummer buzz
  playResultFanfare(points) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (points === 3) {
      // 3 Points: High Energy Synth Arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        setTimeout(() => this.beep(freq, 'sawtooth', 0.12, 0.15), i * 65);
      });
    } else if (points === 2) {
      // 2 Points: Bright Arcade Chime
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        setTimeout(() => this.beep(freq, 'triangle', 0.14, 0.12), i * 75);
      });
    } else if (points === 1) {
      // 1 Point: Low Positive Beeps
      const notes = [329.63, 392.0];
      notes.forEach((freq, i) => {
        setTimeout(() => this.beep(freq, 'square', 0.18, 0.08), i * 90);
      });
    } else {
      // 0 Points: Retro 80s 'Womp Womp' Game Over sound
      this.beep(220, 'sawtooth', 0.2, 0.1);
      setTimeout(() => this.beep(164.81, 'sawtooth', 0.35, 0.1), 160);
    }
  }

  beep(freq, type, duration, volume) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.02);
    } catch (e) {}
  }
}

class Wavelength80sGame {
  constructor() {
    this.audio = new RetroSynthAudio();

    // Game State
    this.stage = 1;
    this.score = 0;
    this.targetCenter = 90;
    this.needleAngle = 90;
    this.lastTickAngle = 90;
    this.isDragging = false;
    this.gameState = 'PEEK'; // 'PEEK' -> 'GUESS' -> 'REVEALED'

    // DOM Elements
    this.roundNumEl = document.getElementById('round-number');
    this.totalScoreEl = document.getElementById('total-score');
    this.statusBannerEl = document.getElementById('game-status-banner');
    this.angleValEl = document.getElementById('angle-value');

    this.wheelStageEl = document.getElementById('wheel-stage');
    this.svgEl = document.getElementById('wavelength-svg');
    this.ticksGroup = document.getElementById('ticks-group');
    this.targetSlicesGroup = document.getElementById('target-slices-group');
    this.shutterGroup = document.getElementById('shutter-group');
    this.needleGroup = document.getElementById('needle-group');

    // Control Buttons
    this.btnHide = document.getElementById('btn-hide');
    this.btnConfirm = document.getElementById('btn-confirm');
    this.btnNextRound = document.getElementById('btn-next-round');
    this.btnReset = document.getElementById('btn-reset');
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIndicator = document.getElementById('sound-indicator');

    // Result Modal
    this.resultModal = document.getElementById('result-modal');
    this.resultTitle = document.getElementById('result-title');
    this.resultScoreTag = document.getElementById('result-score-tag');
    this.resultDetail = document.getElementById('result-detail');
    this.resTargetDeg = document.getElementById('res-target-deg');
    this.resNeedleDeg = document.getElementById('res-needle-deg');
    this.resDiffDeg = document.getElementById('res-diff-deg');
    this.btnModalDismiss = document.getElementById('btn-modal-dismiss');

    this.init();
  }

  init() {
    this.renderTicks();
    this.bindEvents();
    this.startRound();
  }

  renderTicks() {
    this.ticksGroup.innerHTML = '';
    const cx = 250, cy = 250, rOuter = 224;

    for (let deg = 0; deg <= 180; deg += 5) {
      const mathRad = Math.PI - (deg * Math.PI / 180);
      const isMajor = deg % 30 === 0;
      const isMid = deg % 15 === 0;
      const tickLen = isMajor ? 14 : (isMid ? 8 : 4);
      const rInner = rOuter - tickLen;

      const x1 = cx + rOuter * Math.cos(mathRad);
      const y1 = cy - rOuter * Math.sin(mathRad);
      const x2 = cx + rInner * Math.cos(mathRad);
      const y2 = cy - rInner * Math.sin(mathRad);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', `tick-line ${isMajor ? 'major' : ''}`);
      this.ticksGroup.appendChild(line);

      if (isMajor) {
        const rText = rInner - 12;
        const tx = cx + rText * Math.cos(mathRad);
        const ty = cy - rText * Math.sin(mathRad) + 5;

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

  // Semicircular sector wedge builder
  createWedgePath(cx, cy, r, startDeg, endDeg) {
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
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  renderTargetSlices(centerAngle) {
    this.targetSlicesGroup.innerHTML = '';
    const cx = 250, cy = 250, r = 224;

    // Rules:
    // Center Blue (Bullseye) = 3 Points: ±3° (6° span)
    // Flanking Yellow = 2 Points: 3° to 8° on either side (5° span each)
    // Outer Red = 1 Point: 8° to 14° on either side (6° span each)
    const zones = [
      // Left Red (1 pt)
      { start: centerAngle - 14, end: centerAngle - 8, fill: '#ff2255', stroke: '#ff007f', pts: 1 },
      // Left Yellow (2 pts)
      { start: centerAngle - 8, end: centerAngle - 3, fill: '#ffe600', stroke: '#fff275', pts: 2 },
      // Center Neon Blue (3 pts)
      { start: centerAngle - 3, end: centerAngle + 3, fill: '#0066ff', stroke: '#00f3ff', pts: 3 },
      // Right Yellow (2 pts)
      { start: centerAngle + 3, end: centerAngle + 8, fill: '#ffe600', stroke: '#fff275', pts: 2 },
      // Right Red (1 pt)
      { start: centerAngle + 8, end: centerAngle + 14, fill: '#ff2255', stroke: '#ff007f', pts: 1 }
    ];

    zones.forEach(zone => {
      const d = this.createWedgePath(cx, cy, r, zone.start, zone.end);
      if (d) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', zone.fill);
        path.setAttribute('stroke', zone.stroke);
        path.setAttribute('stroke-width', '1.5');
        this.targetSlicesGroup.appendChild(path);
      }
    });

    // Center target laser hairline
    const targetRad = Math.PI - (centerAngle * Math.PI / 180);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + r * Math.cos(targetRad));
    line.setAttribute('y2', cy - r * Math.sin(targetRad));
    line.setAttribute('stroke', '#ffffff');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 4');
    this.targetSlicesGroup.appendChild(line);
  }

  startRound() {
    this.gameState = 'PEEK';

    // Randomize target position between 18° and 162°
    this.targetCenter = Math.floor(Math.random() * 144) + 18;
    this.renderTargetSlices(this.targetCenter);

    // Reset needle to default 90° center
    this.setNeedleAngle(90);

    // 1. Target is VISIBLE at first! (Shutter starts opened)
    this.shutterGroup.classList.remove('closed');
    this.shutterGroup.classList.add('opened');

    // UI Buttons state
    this.btnHide.disabled = false;
    this.btnConfirm.disabled = true;
    this.btnNextRound.disabled = true;

    this.roundNumEl.textContent = this.stage.toString().padStart(2, '0');
    this.totalScoreEl.textContent = this.score.toString().padStart(4, '0');

    this.statusBannerEl.innerHTML = '[STAGE START] Target is visible! Memorize its position, then press <strong>[HIDE TARGET]</strong>!';
  }

  hideTarget() {
    this.gameState = 'GUESS';
    this.audio.playShutterSwoosh(true);

    // Motorized shutter closes down
    this.shutterGroup.classList.remove('opened');
    this.shutterGroup.classList.add('closed');

    this.btnHide.disabled = true;
    this.btnConfirm.disabled = false;

    this.statusBannerEl.innerHTML = '[GUESS MODE] Target concealed! Drag the laser needle to your guess, then press <strong>[CONFIRM GUESS]</strong>!';
  }

  confirmGuess() {
    if (this.gameState !== 'GUESS') return;
    this.gameState = 'REVEALED';

    // Target appears!
    this.audio.playShutterSwoosh(false);
    this.shutterGroup.classList.remove('closed');
    this.shutterGroup.classList.add('opened');

    // Evaluate score: Blue=3, Yellow=2, Red=1, Miss=0
    const diff = Math.abs(this.needleAngle - this.targetCenter);
    let pts = 0;
    let title = "MISS! [0 PTS]";
    let desc = "OUTSIDE TARGET FREQUENCY. SIGNAL LOST!";

    if (diff <= 3.0) {
      pts = 3;
      title = "BULLSEYE! [BLUE]";
      desc = "DIRECT FREQUENCY LOCK IN THE 3-POINT BLUE ZONE!";
    } else if (diff <= 8.0) {
      pts = 2;
      title = "CLOSE! [YELLOW]";
      desc = "EXCELLENT CALIBRATION IN THE 2-POINT YELLOW ZONE!";
    } else if (diff <= 14.0) {
      pts = 1;
      title = "NEAR! [RED]";
      desc = "PERIPHERAL CONTACT IN THE 1-POINT RED ZONE!";
    }

    this.score += pts;
    this.totalScoreEl.textContent = this.score.toString().padStart(4, '0');

    this.audio.playResultFanfare(pts);

    // Populate Modal
    this.resultTitle.textContent = title;
    this.resultScoreTag.textContent = `+${pts} POINTS`;
    this.resultScoreTag.className = `res-score-badge score-${pts}`;
    this.resultDetail.textContent = desc;
    this.resTargetDeg.textContent = `${this.targetCenter.toFixed(1)}°`;
    this.resNeedleDeg.textContent = `${this.needleAngle.toFixed(1)}°`;
    this.resDiffDeg.textContent = `${diff.toFixed(1)}°`;

    this.resultModal.classList.remove('hidden');

    this.btnConfirm.disabled = true;
    this.btnNextRound.disabled = false;

    this.statusBannerEl.innerHTML = `[STAGE COMPLETE] Scored <strong>+${pts} PTS</strong> (Variance: ${diff.toFixed(1)}°). Press <strong>[NEXT ROUND]</strong>!`;
  }

  setNeedleAngle(angle) {
    this.needleAngle = Math.max(0, Math.min(180, Math.round(angle * 10) / 10));

    // Needle pointer in SVG:
    // 0° = pointing left (-90° from vertical)
    // 90° = pointing straight up (0° rotation)
    // 180° = pointing right (+90° from vertical)
    const rotation = this.needleAngle - 90;
    this.needleGroup.setAttribute('transform', `rotate(${rotation}, 250, 250)`);

    this.angleValEl.textContent = `${this.needleAngle.toFixed(1)}°`;

    // Audio click every ~3 degrees
    if (Math.abs(this.needleAngle - this.lastTickAngle) >= 3.0) {
      this.audio.playTick(this.needleAngle);
      this.lastTickAngle = this.needleAngle;
    }
  }

  // Accurate pointer-to-angle math using bounding client rect & SVG transformation
  updateAngleFromPointer(clientX, clientY) {
    const rect = this.svgEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Center pivot (250, 250) in screen coordinates
    const pivotScreenX = rect.left + (250 / 500) * rect.width;
    const pivotScreenY = rect.top + (250 / 290) * rect.height;

    const dx = clientX - pivotScreenX;
    const dy = pivotScreenY - clientY; // Upwards is positive

    // Angle in degrees from left baseline:
    // Left (dx < 0, dy = 0) => 0°
    // Top (dx = 0, dy > 0) => 90°
    // Right (dx > 0, dy = 0) => 180°
    let rad = Math.atan2(dy, dx);
    let deg = (Math.PI - rad) * (180 / Math.PI);

    // Clamp when pointer is dragged below the baseline
    if (dy < 0) {
      deg = dx < 0 ? 0 : 180;
    }

    this.setNeedleAngle(deg);
  }

  bindEvents() {
    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      const on = this.audio.toggle();
      this.soundIndicator.textContent = on ? 'SFX: ON' : 'SFX: OFF';
    });

    // Hide Target Button
    this.btnHide.addEventListener('click', () => {
      this.hideTarget();
    });

    // Confirm Guess Button
    this.btnConfirm.addEventListener('click', () => {
      this.confirmGuess();
    });

    // Next Round
    this.btnNextRound.addEventListener('click', () => {
      this.stage++;
      this.startRound();
    });

    // Reset Game
    this.btnReset.addEventListener('click', () => {
      this.stage = 1;
      this.score = 0;
      this.startRound();
    });

    // Dismiss Modal
    this.btnModalDismiss.addEventListener('click', () => {
      this.resultModal.classList.add('hidden');
    });

    // Needle dragging mechanics - responsive across whole window once initiated
    const handleStart = (e) => {
      this.audio.init();
      this.isDragging = true;
      this.needleGroup.classList.add('dragging');

      const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
      if (clientX !== undefined) {
        this.updateAngleFromPointer(clientX, clientY);
      }
      if (e.cancelable) e.preventDefault();
    };

    const handleMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
      const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
      if (clientX !== undefined) {
        this.updateAngleFromPointer(clientX, clientY);
      }
      if (e.cancelable) e.preventDefault();
    };

    const handleEnd = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.needleGroup.classList.remove('dragging');
      }
    };

    // Listen on wheel-stage & needle, track globally on window
    this.wheelStageEl.addEventListener('mousedown', handleStart);
    this.wheelStageEl.addEventListener('touchstart', handleStart, { passive: false });

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });

    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  }
}

// Boot up game
window.addEventListener('DOMContentLoaded', () => {
  new Wavelength80sGame();
});
