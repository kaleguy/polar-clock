# Polar Clock

A real-time polar clock visualization built with HTML Canvas. Time units are displayed as concentric arcs that sweep proportionally to their current value.

## Rings

From outside to inside:

- **Month** — progress through the year
- **Date** — progress through the month
- **Day** — progress through the week
- **12 Hour** — 12-hour cycle
- **Hours** — 24-hour cycle
- **Minutes** — progress through the hour
- **Seconds** — progress through the minute

## Features

- Smooth 60fps animation using `requestAnimationFrame`
- Color-coded labels with current values
- Click any label to toggle its ring on/off — remaining rings collapse to fill the space
- Responsive — scales to any window size with HiDPI/Retina support

## Usage

Open `index.html` in a browser. No build step or dependencies required.

## Tech

- Vanilla HTML, CSS, and JavaScript
- Canvas 2D API
- Zero dependencies
