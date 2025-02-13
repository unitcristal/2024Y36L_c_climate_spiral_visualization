let data;
let months;

let minusOneRadius = 100; // -1도 반경
// let minusOneRadius = 100; // -1도 반경 추가
// let zeroRadius = minusOneRadius * 2;
// let oneRadius = minusOneRadius * 3;
let zeroRadius = minusOneRadius * 2; // 0도 반경
let oneRadius = minusOneRadius * 3; // 1도 반경
let onePointFiveRadius = oneRadius + minusOneRadius * 0.5; // 1.5도 반경

let testRadius = minusOneRadius * 4;
let testRadius2 = minusOneRadius * 8 - minusOneRadius;

let currentRow = 0; // Row는 0에서 시작 (0번째부터 데이터가 있음)
let currentMonth = 0; // Month도 0에서 시작 ("Jan"부터 시작)

let previousAnomaly = 0;

const lastYear = 2025; // 마지막 연도 (2024)
const lastMonth = 0; // Jan의 인덱스는 0

const weird_v = 1.5;

function preload() {
  // 데이터를 로드하는 부분
  data = loadTable("glb_temp.csv", "csv", "header");
}

function setup() {
  createCanvas(900, 900);

  // 월 배열을 정의
  months = [
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

  // 데이터 로드 테스트
  console.log("Rows in data:", data.getRowCount());

  loop(); // draw() 함수가 계속해서 호출되도록 설정
}

function draw() {
  background(0); // 검정 배경으로 설정
  translate(width / 2, height / 2);

  // -1도, 0도, 1도 원을 일정하게 정렬하여 그리기
  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, minusOneRadius * 2); // -1도 원
  fill(255);
  noStroke();
  textSize(15); // 온도 표시 글자 크기 줄임
  text("-1°C", minusOneRadius + 18, 0); // -1도 텍스트 표시

  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, zeroRadius * 2); // 0도 원
  fill(255);
  noStroke();
  textSize(15);
  text("0°C", zeroRadius + 18, 0); // 0도 텍스트 표시

  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, oneRadius * 2); // 1도 원
  fill(255);
  noStroke();
  textSize(15);
  text("1°C", oneRadius + 18, 0); // 1도 텍스트 표시

  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, testRadius2);
  fill(255);
  noStroke();
  textSize(15);
  text("1.5°C", testRadius2 + 18, 0); //

  // stroke(255);
  // strokeWeight(2);
  // noFill();
  // circle(0, 0, testRadius * 2);
  // fill(255);
  // noStroke();
  // textSize(15);
  // text("2°C", testRadius + 18, 0); //

  // 각 월을 원 주변에 배치
  for (let i = 0; i < months.length; i++) {
    let angle = map(i, 0, months.length, 0, TWO_PI) - PI / 3; // 정확한 12등분 계산
    let x = 390 * cos(angle); // 텍스트의 x좌표
    let y = 390 * sin(angle); // 텍스트의 y좌표

    push();
    translate(x, y); // 텍스트의 좌표로 이동
    rotate(angle + HALF_PI); // 각도에 따라 텍스트 회전
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(months[i], 0, 0); // 텍스트 표시
    pop();
  }

  // 가운데 연도 표시 (글자 크기 크게 설정)
  let year = data.getRow(currentRow).get("Year");
  textSize(35); // 년도 글자 크기 크게 설정
  textAlign(CENTER, CENTER);
  fill(255);
  text(year, 0, 0); // 가운데에 년도 표시

  noFill();
  stroke(255);
  let firstValue = true;

  // anomaly 데이터를 그리기
  for (let j = 0; j < currentRow; j++) {
    let row = data.getRow(j); // 각 행을 가져옴

    let totalMonths = months.length;
    if (j == currentRow - 1) {
      totalMonths = currentMonth;
    }

    for (let i = 0; i < totalMonths; i++) {
      let anomaly = row.getString(months[i]); // 각 월별 anomaly 값을 문자열로 가져옴

      // anomaly 값이 ***인지 확인하고 그리기를 중단
      if (anomaly === "***") {
        noLoop(); // 모든 데이터를 다 그리면 draw()를 멈춤
        return; // 더 이상 그리지 않도록 draw() 종료
      }

      // anomaly 값이 숫자이고 유효한 값일 경우
      anomaly = parseFloat(anomaly); // 문자열을 숫자로 변환
      if (!isNaN(anomaly)) {
        console.log(
          `Anomaly is not a number for ${row.get("Year")} ${months[i]}`
        );

        // anomaly 값의 범위를 -1 ~ 1로 설정하고 반경을 매핑
        let angle = map(i, 0, months.length, 0, TWO_PI) - PI / 3; // 각도 계산
        let pr = map(
          previousAnomaly,
          -1,
          weird_v,
          minusOneRadius,
          onePointFiveRadius
        ); // 이전 anomaly 값을 반경으로 변환
        let r = map(anomaly, -1, weird_v, minusOneRadius, onePointFiveRadius); // anomaly 값을 반경으로 변환

        let x1 = r * cos(angle); // anomaly에 맞는 x좌표
        let y1 = r * sin(angle); // anomaly에 맞는 y좌표
        let x2 = pr * cos(angle - PI / 6); // 이전 anomaly에 맞는 x좌표
        let y2 = pr * sin(angle - PI / 6); // 이전 anomaly에 맞는 y좌표

        // anomaly 값에 따른 색상 설정 (-1 ~ 0: 파랑 -> 흰색, 0 ~ 1: 흰색 -> 빨강)
        let c;
        if (anomaly < 0) {
          c = lerpColor(
            color(0, 0, 255),
            color(255),
            map(anomaly, -1, 0, 0, 1)
          ); // 파랑 -> 흰색
        } else {
          c = lerpColor(color(255), color(255, 0, 0), map(anomaly, 0, 1, 0, 1)); // 흰색 -> 빨강
        }
        stroke(c);

        if (!firstValue) {
          line(x2, y2, x1, y1); // 이전 점과 현재 점을 선으로 연결
        }
        firstValue = false;
        previousAnomaly = anomaly;
      }
    }
  }

  // 다음 달로 이동
  currentMonth = currentMonth + 1;

  // 마지막 연도와 Jul에 도달하면 멈춤
  if (year == lastYear && currentMonth == lastMonth + 1) {
    noLoop();
    return;
  }

  if (currentMonth == months.length) {
    currentRow = currentRow + 1;
    currentMonth = 0; // 새로운 연도 시작
    if (currentRow == data.getRowCount()) {
      noLoop(); // 모든 데이터를 다 그리면 draw()를 멈춤
    }
  }

  frameRate(60); // 프레임 속도 설정
}
