const canvas = document.getElementById('clock');
const ctx = canvas.getContext('2d');

const rings = [
  { label: 'Seconds',  color: '#ff6b6b', max: 60 },
  { label: 'Minutes',  color: '#feca57', max: 60 },
  { label: 'Hours',    color: '#48dbfb', max: 24 },
  { label: 'Day',      color: '#ff9ff3', max: 7  },
  { label: 'Date',     color: '#54a0ff', max: 31 },
  { label: 'Month',    color: '#5f27cd', max: 12 },
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const TAU = Math.PI * 2;
const START_ANGLE = -Math.PI / 2; // 12 o'clock

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
  const ringWidth = Math.min(maxRadius / (rings.length + 1.5), 28 * scale);
  const gap = ringWidth * 0.35;

  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    const val = values[i];
    const radius = maxRadius - i * (ringWidth + gap);
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

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
