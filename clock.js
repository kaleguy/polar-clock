const canvas = document.getElementById('clock');
const ctx = canvas.getContext('2d');

const rings = [
  { label: 'Seconds',  color: '#ff6b6b', max: 60 },
  { label: 'Minutes',  color: '#feca57', max: 60 },
  { label: 'Hours',    color: '#48dbfb', max: 24 },
  { label: '12 Hour',  color: '#f368e0', max: 12 },
  { label: 'Day',      color: '#ff9ff3', max: 7  },
  { label: 'Date',     color: '#54a0ff', max: 31 },
  { label: 'Month',    color: '#5f27cd', max: 12 },
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const timeDisplay = document.getElementById('time-display');

const TAU = Math.PI * 2;
const START_ANGLE = -Math.PI / 2; // 12 o'clock
// Track which ring indices are disabled (greyed out, ring hidden)
const disabled = new Set();

// Display line config: maps display order to ring index
// Order: Month, Date, Day, HH:MM:SS
const displayLines = [
  { ringIndex: 4, format: (now) => dayNames[now.getDay()] },
];

const timeParts = [
  { ringIndex: 2, format: (now) => String(now.getHours()).padStart(2, '0') },
  { ringIndex: 1, format: (now) => String(now.getMinutes()).padStart(2, '0') },
  { ringIndex: 0, format: (now) => String(now.getSeconds()).padStart(2, '0') },
];

function makeClickable(ringIndex) {
  const el = document.createElement('span');
  el.style.cursor = 'pointer';
  el.addEventListener('click', () => {
    if (disabled.has(ringIndex)) disabled.delete(ringIndex);
    else disabled.add(ringIndex);
  });
  return el;
}

// Build month/date line: "February 28" with each part clickable
const monthDateRow = document.createElement('div');
const monthSpan = makeClickable(6);
monthDateRow.appendChild(monthSpan);
const monthDateSpace = document.createElement('span');
monthDateSpace.textContent = ' ';
monthDateRow.appendChild(monthDateSpace);
const dateSpan = makeClickable(5);
monthDateRow.appendChild(dateSpan);
timeDisplay.appendChild(monthDateRow);

// Build day line
const displayDivs = displayLines.map(dl => {
  const div = makeClickable(dl.ringIndex);
  div.style.display = 'block';
  timeDisplay.appendChild(div);
  return div;
});

// Build time line: HH:MM:SS as one row with individually clickable parts
const timeRow = document.createElement('div');
const timeSpans = timeParts.map((tp, idx) => {
  if (idx > 0) {
    const colon = document.createElement('span');
    colon.textContent = ':';
    colon.style.color = '#555';
    timeRow.appendChild(colon);
  }
  const span = makeClickable(tp.ringIndex);
  timeRow.appendChild(span);
  return span;
});
timeDisplay.appendChild(timeRow);

// Build 12-hour time line: H:MM:SS AM/PM with three colors
const time12Row = document.createElement('div');
const time12Parts = [
  { ringIndex: 3, format: (now) => String(now.getHours() % 12 || 12) },
  { ringIndex: 1, format: (now) => String(now.getMinutes()).padStart(2, '0') },
  { ringIndex: 0, format: (now) => String(now.getSeconds()).padStart(2, '0') },
];
const time12Spans = time12Parts.map((tp, idx) => {
  if (idx > 0) {
    const colon = document.createElement('span');
    colon.textContent = ':';
    colon.style.color = '#555';
    time12Row.appendChild(colon);
  }
  const span = makeClickable(tp.ringIndex);
  time12Row.appendChild(span);
  return span;
});
const ampmSpan = makeClickable(3);
time12Row.appendChild(ampmSpan);
timeDisplay.appendChild(time12Row);

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getValues(now) {
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = now.getHours() + min / 60;
  const dayOfWeek = now.getDay() + hr / 24;
  const dayOfMonth = now.getDate() - 1 + hr / 24;
  const month = now.getMonth() + (dayOfMonth / daysInMonth(now));

  return [
    { fraction: sec / 60, display: Math.floor(sec) },
    { fraction: min / 60, display: Math.floor(min) },
    { fraction: hr / 24,  display: Math.floor(hr) },
    { fraction: (hr % 12) / 12, display: Math.floor(hr % 12) || 12 },
    { fraction: dayOfWeek / 7, display: dayNames[now.getDay()] },
    { fraction: dayOfMonth / daysInMonth(now), display: now.getDate() },
    { fraction: month / 12, display: monthNames[now.getMonth()] },
  ];
}

function draw() {
  const now = new Date();
  const values = getValues(now);

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = devicePixelRatio;

  ctx.clearRect(0, 0, w, h);

  const maxRadius = Math.min(cx, cy) * 0.85;
  const activeOrder = [...rings.keys()].reverse()
    .filter(i => !disabled.has(i));
  const activeCount = activeOrder.length;
  const ringWidth = Math.min(maxRadius / (Math.max(activeCount, 1) + 1.5), 28 * scale);
  const gap = ringWidth * 0.35;

  for (let pos = 0; pos < activeCount; pos++) {
    const i = activeOrder[pos];
    const ring = rings[i];
    const val = values[i];
    const radius = maxRadius - pos * (ringWidth + gap);
    const endAngle = START_ANGLE + val.fraction * TAU;

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, TAU);
    ctx.strokeStyle = ring.color + '22';
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Foreground arc
    if (val.fraction > 0.001) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, START_ANGLE, endAngle);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ringWidth * 0.7;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Label at end of arc
    const labelAngle = endAngle + 0.05;
    const labelRadius = radius;
    const lx = cx + Math.cos(labelAngle) * labelRadius;
    const ly = cy + Math.sin(labelAngle) * labelRadius;

    ctx.font = `${11 * scale}px -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff99';
    ctx.textAlign = labelAngle > START_ANGLE + Math.PI ? 'right' : 'left';
    ctx.textBaseline = 'middle';

    const text = `${ring.label}: ${val.display}`;
    ctx.fillText(text, lx, ly);
  }

  // Update center time display
  monthSpan.textContent = monthNames[now.getMonth()];
  monthSpan.style.color = disabled.has(6) ? '#555' : rings[6].color;
  dateSpan.textContent = now.getDate();
  dateSpan.style.color = disabled.has(5) ? '#555' : rings[5].color;

  // Update 12-hour display
  time12Parts.forEach((tp, idx) => {
    const span = time12Spans[idx];
    const off = disabled.has(tp.ringIndex);
    span.style.color = off ? '#555' : rings[tp.ringIndex].color;
    span.textContent = tp.format(now);
  });
  const ampm = now.getHours() < 12 ? ' AM' : ' PM';
  ampmSpan.textContent = ampm;
  ampmSpan.style.color = disabled.has(3) ? '#555' : rings[3].color;
  displayLines.forEach((dl, idx) => {
    const div = displayDivs[idx];
    const off = disabled.has(dl.ringIndex);
    div.style.color = off ? '#555' : rings[dl.ringIndex].color;
    div.textContent = dl.format(now);
  });
  timeParts.forEach((tp, idx) => {
    const span = timeSpans[idx];
    const off = disabled.has(tp.ringIndex);
    span.style.color = off ? '#555' : rings[tp.ringIndex].color;
    span.textContent = tp.format(now);
  });

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
