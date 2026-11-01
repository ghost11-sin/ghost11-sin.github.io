// 허브 아이콘(헤드셋 끼고 게임하는 유령, 픽셀 그래픽)을 PNG로 만든다.
// 실행: node icons/_make_icon.mjs   → icons/icon-180/192/512.png, apple-touch-icon.png
//
// 32x32 칸에 그림을 그리고, 칸 하나를 정수 픽셀로 키워서 가장자리가 흐려지지 않게 한다.

import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const 여기 = dirname(fileURLToPath(import.meta.url));
const N = 32;

const 색 = {
  K: "#1e1b4b", // 외곽선
  W: "#ffffff", // 유령
  G: "#d9d3ff", // 유령 그림자
  H: "#2a2470", // 헤드셋
  h: "#4338ca", // 헤드셋 하이라이트
  M: "#5eead4", // 헤드셋 불빛
  P: "#f9a8d4", // 볼
  R: "#f472b6", // 마이크 끝
  C: "#433a9e", // 패드
  c: "#2a2470", // 패드 그림자
  w: "#e0e7ff", // 십자키
  y: "#facc15", r: "#f472b6", t: "#5eead4", b: "#93c5fd", // 버튼
  S: "#d8ccff", // 배경 반짝이
};
const 배경띠 = ["#5b5ff0", "#6460f0", "#6d5ff1", "#775ef2", "#815cf3", "#8b5bf4", "#955af5", "#9f58f6"];

// ---------- 그림 ----------
const 칸 = Array.from({ length: N }, () => Array(N).fill(null));
const 칠 = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) 칸[y][x] = c; };
const 사각 = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) 칠(x, y, c); };

const cx = 15.5, cy = 12, r = 8; // 머리 둥근 부분의 중심

// 몸통: 둥근 머리 + 네모 몸 + 물결 끝자락
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const dx = x + 0.5 - cx - 0.5, dy = y + 0.5 - cy;
  if (y < cy && dx * dx + dy * dy <= r * r) 칠(x, y, "W");
}
사각(8, 12, 23, 25, "W");
for (let x = 8; x <= 23; x++) if (Math.floor((x - 8) / 2) % 2 === 0) 칠(x, 26, "W");
// 오른쪽 아래 그림자
for (let y = 6; y <= 26; y++) for (let x = 21; x <= 23; x++) if (칸[y][x] === "W" && (x === 23 || (x === 22 && y > 14))) 칠(x, y, "G");
for (let x = 8; x <= 23; x++) if (칸[26][x]) 칠(x, 26, "G");

// 헤드셋 머리띠: 머리 가장자리에 얹힌 한 칸 두께 고리
for (let y = 0; y < cy - 1; y++) for (let x = 0; x < N; x++) {
  const dx = x + 0.5 - cx - 0.5, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
  if (d >= 7.1 && d < 8.3 && 칸[y][x]) 칠(x, y, "H");
}
for (let x = 13; x <= 18; x++) 칠(x, 4, "h"); // 머리띠 윗면 반짝임
// 귀 부분
사각(5, 11, 7, 16, "H"); 사각(6, 12, 6, 15, "M");
사각(24, 11, 26, 16, "H"); 사각(25, 12, 25, 15, "M");
사각(7, 9, 7, 10, "H"); 사각(24, 9, 24, 10, "H"); // 머리띠와 귀를 잇는 부분

// 얼굴: 찡그린 눈썹, 집중한 눈, 볼
for (const [x, y] of [[11, 9], [12, 9], [13, 10], [14, 10], [20, 9], [19, 9], [18, 10], [17, 10]]) 칠(x, y, "K");
사각(12, 12, 13, 14, "K"); 사각(18, 12, 19, 14, "K");
칠(12, 12, "W"); 칠(18, 12, "W");
칠(10, 16, "P"); 칠(11, 16, "P"); 칠(20, 16, "P"); 칠(21, 16, "P");

// 마이크: 왼쪽 귀에서 입 쪽으로
for (const [x, y] of [[7, 17], [8, 17], [9, 17], [10, 17]]) 칠(x, y, "H");
칠(11, 17, "H"); 칠(12, 17, "M");

// 게임패드: 십자키는 유령의 왼손(보는 사람 기준 오른쪽), 버튼은 오른손(보는 사람 기준 왼쪽)
사각(7, 19, 24, 22, "C");
칠(7, 19, null); 칠(24, 19, null);
사각(7, 23, 10, 24, "C"); 사각(21, 23, 24, 24, "C");
칠(7, 24, null); 칠(24, 24, null);
사각(11, 22, 20, 22, "c"); 사각(8, 24, 10, 24, "c"); 사각(21, 24, 23, 24, "c");
// 버튼 (보는 사람 기준 왼쪽)
칠(11, 19, "t"); 칠(10, 20, "y"); 칠(12, 20, "r"); 칠(11, 21, "b");
// 십자키 (보는 사람 기준 오른쪽)
칠(20, 19, "w"); 칠(19, 20, "w"); 칠(20, 20, "w"); 칠(21, 20, "w"); 칠(20, 21, "w");
// 패드를 쥔 손
사각(5, 20, 6, 22, "W"); 사각(25, 20, 26, 22, "W");

// 위아래 가운데로 옮기기
const 줄들 = 칸.map((줄, y) => (줄.some(Boolean) ? y : -1)).filter((y) => y >= 0);
const 내림 = Math.floor((N - 2 - (줄들.at(-1) - 줄들[0] + 1)) / 2) - 줄들[0] + 1;
칸.unshift(...칸.splice(N - 내림, 내림));

// 외곽선: 그림 바로 바깥 칸(상하좌우)을 테두리로
const 그림 = 칸.map((줄) => 줄.slice());
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  if (그림[y][x]) continue;
  const 옆 = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => 그림[y + b]?.[x + a]);
  if (옆) 칸[y][x] = "K";
}

// 배경 반짝이
for (const [x, y] of [[3, 4], [28, 5], [3, 27], [28, 27]]) {
  for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) if (!칸[y + b][x + a]) 칸[y + b][x + a] = "S";
}

// ---------- PNG ----------
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function 덩어리(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

// size 픽셀 정사각형. 칸 크기는 정수, 남는 가장자리는 배경으로 채운다
function png(size) {
  const cell = Math.floor(size / N), off = Math.floor((size - cell * N) / 2);
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 3);
    const gy = Math.min(N - 1, Math.max(0, Math.floor((py - off) / cell)));
    for (let px = 0; px < size; px++) {
      const gx = Math.floor((px - off) / cell);
      const 안 = gx >= 0 && gx < N && py >= off && py < off + cell * N;
      const 값 = 안 && 칸[gy][gx];
      const hex = 값 ? 색[값] : 배경띠[Math.floor((gy / N) * 배경띠.length)];
      rgb(hex).forEach((v, i) => (row[1 + px * 3 + i] = v));
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8비트 RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    덩어리("IHDR", ihdr), 덩어리("IDAT", deflateSync(Buffer.concat(rows))), 덩어리("IEND", Buffer.alloc(0)),
  ]);
}

for (const s of [180, 192, 512]) writeFileSync(join(여기, `icon-${s}.png`), png(s));
writeFileSync(join(여기, "..", "apple-touch-icon.png"), png(180));
console.log(칸.map((줄) => 줄.map((c) => c || ".").join("")).join("\n"));
