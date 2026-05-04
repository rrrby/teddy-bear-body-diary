let particles = [];
let currentIndex = 0;

let pressStart = 0;
let isPressing = false;

let bearImg;
let selectedParticle = null;

let canvas;

let colors = [
  [220, 130, 130],   // pain
  [130, 170, 210],  // tight
  [220, 200, 140],  // pressure
  [190, 190, 190]  // numb
];

let labels = ["pain", "tight", "pressure", "numb"];

// 🧸 Load Image (Ensure bear.png is uploaded/in the folder)
function preload() {
  bearImg = loadImage('bear.png');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  // Redundant check for Safari gestures/scrolling just in case
  canvas.elt.style.touchAction = 'none';
  
  textAlign(CENTER);
}

function draw() {
  background(10);

  drawInstruction();
  drawBody();
  drawParticles();
  drawColorPicker();
  drawPressFeedback();
}

// Instructions
function drawInstruction() {
  fill(180);
  textSize(18);
  text("This is your body diary. Press and hold where you feel it and how much.", width/2, 50);
}

// Bear (Slow breathing)
function drawBody() {
  push();

  translate(width/2, height/2);

  let t = frameCount * 0.02;
  let breath = sin(t);
  breath = breath > 0 ? breath : breath * 0.5;

  let s = 1 + breath * 0.015;
  scale(s);

  imageMode(CENTER);
  tint(255, 190);
  image(bearImg, 0, 0, 250, 350);

  pop();
}

// Color Picker
function drawColorPicker() {
  let y = height - 90;
  let spacing = width / (colors.length + 1);

  for (let i = 0; i < colors.length; i++) {
    let x = spacing * (i + 1);

    if (i === currentIndex) {
      stroke(255);
      strokeWeight(2);
    } else {
      noStroke();
    }

    fill(colors[i]);
    circle(x, y, 36);

    noStroke();
    fill(180);
    textSize(12);
    text(labels[i], x, y + 30);
  }
}

// Particles
function drawParticles() {
  for (let p of particles) {

    let size = (p === selectedParticle) ? p.size * 1.2 : p.size;

    fill(colors[p.type][0], colors[p.type][1], colors[p.type][2], 200);
    noStroke();
    circle(p.x, p.y, size);

    // Delete Button
    if (p === selectedParticle) {
      fill(255);
      textSize(14);
      text("×", p.x + size/2, p.y - size/2);
    }
  }
}

// Press Feedback
function drawPressFeedback() {
  if (isPressing) {

    let duration = millis() - pressStart;

    let maxSize = width * 1.2;

    // it won't move at the first time period
    let delay = 200;

    let t;

    if (duration < delay) {
      t = 0;
    } else {
      t = (duration - delay) / 4000; // delay
      t = constrain(t, 0, 1);
      t = t * t * t;  
    }

    let size = lerp(20, maxSize, t);

    let cx = width / 2;
    let cy = height / 2;

    let c = colors[currentIndex];

    // transparency changed with spreading
    let alpha = map(t, 0, 1, 60, 140);

    // fill in the circle
    fill(c[0], c[1], c[2], 20);
    noStroke();
    circle(cx, cy, size);

    // circle
    noFill();
    stroke(c[0], c[1], c[2], alpha);
    strokeWeight(2);
    circle(cx, cy, size);
  }
}

// ==========================================
//  MOUSE EVENTS (on Mac)
// ==========================================
function mousePressed() {
  startInteraction();
}

function mouseReleased() {
  let duration = millis() - pressStart;

  // time setting to default
  let t = constrain(duration / 2000, 0, 1);

  // change slowlier
  t = pow(t, 0.4); 

  // change in small range
  let size = lerp(10, 16, t);
  endInteraction();
}

// ==========================================
// TOUCH EVENTS (iPhone)
// ==========================================
function touchStarted() {
  startInteraction();
  return false; // Safely blocks Safari scrolling here
}

function touchEnded() {
  endInteraction();
  return false; // Prevents double-taps on mobile
}

// ==========================================
// CORE LOGIC (Shared by both Mouse and Touch)
// ==========================================
function startInteraction() {
  let y = height - 90;
  let spacing = width / (colors.length + 1);

  // 1. Check colors first
  for (let i = 0; i < colors.length; i++) {
    let x = spacing * (i + 1);
    if (dist(mouseX, mouseY, x, y) < 45) { 
      currentIndex = i;
      selectedParticle = null;
      return; 
    }
  }

  // 2. Delete Button
  if (selectedParticle) {
    let x = selectedParticle.x + selectedParticle.size/2;
    let yX = selectedParticle.y - selectedParticle.size/2;
    if (dist(mouseX, mouseY, x, yX) < 30) { 
      particles = particles.filter(p => p !== selectedParticle);
      selectedParticle = null;
      return; 
    }
  }

  // 3. Select Particle
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    if (dist(mouseX, mouseY, p.x, p.y) < (p.size / 2) + 15) { 
      selectedParticle = p;
      return; 
    }
  }

  // 4. Start recording press
  pressStart = millis();
  isPressing = true;
  selectedParticle = null;
}

function endInteraction() {
  if (!isPressing) return;

  let duration = millis() - pressStart;
  let size = map(duration, 0, 1000, 10, 50);

  particles.push({
    x: mouseX + random(-6, 6),
    y: mouseY + random(-6, 6),
    size: size,
    type: currentIndex
  });

  isPressing = false;
}

// Responsive
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
