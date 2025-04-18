let data;
let months;

let baseRadius;
let maxRadius;

let currentRow = 0;
let currentMonth = 0;

let lastYear;
let lastMonth;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const REFERENCE_ANOMALIES = [-1, 0, 1, 1.5, 2];

function preload() {
  data = loadTable("glb_temp.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let minDimension = min(windowWidth, windowHeight);
  baseRadius = minDimension * 0.1;
  maxRadius = minDimension * 0.4;

  const lastRowIndex = data.getRowCount() - 1;
  lastYear = parseInt(data.getRow(lastRowIndex).get("Year"));

  lastMonth = 11;
  for (let i = MONTHS.length - 1; i >= 0; i--) {
    const value = data.getRow(lastRowIndex).get(MONTHS[i]);
    if (value !== "***" && value !== "") {
      lastMonth = i;
      break;
    }
  }

  loop();
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  drawMonthLabels();

  const year = data.getRow(currentRow).get("Year");
  drawYearLabel(year);

  drawAnomalySpiral();
  drawReferenceCircles();

  currentMonth++;
  if (shouldStopAnimation(year)) {
    noLoop();
    return;
  }
  if (currentMonth === MONTHS.length) {
    currentRow++;
    currentMonth = 0;
  }

  frameRate(60);
}

function drawYearLabel(year) {
  textSize(baseRadius * 0.35);
  textAlign(CENTER, CENTER);
  fill(255);
  text(year, 0, 0);
}

function drawAnomalySpiral() {
  let points = [];

  for (let j = 0; j <= currentRow; j++) {
    const row = data.getRow(j);
    let totalMonths = MONTHS.length;
    const year = row.get("Year");

    if (j === currentRow) {
      totalMonths = year == lastYear ? lastMonth + 1 : currentMonth;
    }

    for (let i = 0; i < totalMonths; i++) {
      const anomalyStr = row.getString(MONTHS[i]);
      if (anomalyStr === "***") return;

      const anomaly = parseFloat(anomalyStr);
      if (isNaN(anomaly)) continue;

      const angle = getAngle(i);
      const radius = mapAnomalyToRadius(anomaly);
      const x = radius * cos(angle);
      const y = radius * sin(angle);

      points.push({ x, y, anomaly });
    }
  }

  if (points.length < 4) return;

  strokeWeight(2);
  noFill();

  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];

    stroke(getAnomalyColor(p1.anomaly));
    beginShape();
    curveVertex(p0.x, p0.y);
    curveVertex(p1.x, p1.y);
    curveVertex(p2.x, p2.y);
    curveVertex(p3.x, p3.y);
    endShape();
  }
}

function getAnomalyColor(anomaly) {
  if (anomaly < 0) {
    return lerpColor(color(0, 0, 255), color(255), map(anomaly, -1, 0, 0, 1));
  } else {
    return lerpColor(color(255), color(255, 0, 0), map(anomaly, 0, 2, 0, 1));
  }
}

function mapAnomalyToRadius(anomaly) {
  return map(
    anomaly,
    REFERENCE_ANOMALIES[0],
    REFERENCE_ANOMALIES[REFERENCE_ANOMALIES.length - 1],
    baseRadius,
    maxRadius
  );
}

function drawReferenceCircles() {
  for (let i = 0; i < REFERENCE_ANOMALIES.length; i++) {
    const anomaly = REFERENCE_ANOMALIES[i];
    const radius = mapAnomalyToRadius(anomaly);

    stroke(0, 255, 0);
    strokeWeight(2);
    noFill();
    circle(0, 0, radius * 2);

    const labelX = radius + 10;
    const labelY = 0;
    textSize(baseRadius * 0.15);
    textAlign(LEFT, CENTER);
    const txt = `${anomaly}°C`;
    const txtWidth = textWidth(txt);
    const txtHeight = textAscent() + textDescent();

    fill(0, 150);
    noStroke();
    rect(labelX - 5, labelY - txtHeight / 2 - 5, txtWidth + 10, txtHeight + 10);

    fill(255);
    text(txt, labelX, labelY);
  }
}

function drawMonthLabels() {
  for (let i = 0; i < MONTHS.length; i++) {
    const angle = getAngle(i);
    const x = (maxRadius + baseRadius * 0.5) * cos(angle);
    const y = (maxRadius + baseRadius * 0.5) * sin(angle);

    push();
    translate(x, y);
    rotate(angle + HALF_PI);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(baseRadius * 0.22);
    text(MONTHS[i], 0, 0);
    pop();
  }
}

function getAngle(i) {
  const adjustedIndex = (i + 1) % MONTHS.length;
  return map(adjustedIndex, 0, MONTHS.length, 0, TWO_PI) - PI / 2;
}

function shouldStopAnimation(currentYear) {
  return currentMonth > lastMonth && currentRow >= data.getRowCount() - 1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const minDimension = min(windowWidth, windowHeight);
  baseRadius = minDimension * 0.1;
  maxRadius = minDimension * 0.4;
}
