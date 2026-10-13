// Original 32px line drawings: dishes for cuisines, objects for actions and rewards.
// Each silhouette is intentionally readable at the atlas node's small scale.
export const ATLAS_ICONS = {
  burger: {
    paths: [
      "M5 13c0-11 22-11 22 0H5Z",
      "M4 17h24M5 21h22l-2 6H7l-2-6Z",
      "m6 17 5 4 6-4 5 4 4-4",
      "M11 9h1m5-2h1m4 3h1",
    ],
    fill: ["M5 13c0-11 22-11 22 0H5Z"],
  },
  taco: {
    paths: ["M4 24C4 3 28 3 28 24H4Z", "M9 24c0-14 14-14 14 0", "m7 14 3-2 3 2 3-3 3 2 4-1", "m12 20 2-1m4-3 2 1"],
    fill: ["M4 24C4 3 28 3 28 24H4Z"],
  },
  pizza: {
    paths: [
      "m7 5 20 8-18 15L7 5Z",
      "M7 5c9-1 16 2 20 8l-3 3C20 11 15 9 8 9",
      "M13 14a2 2 0 1 0 0 .1M17 19a2 2 0 1 0 0 .1",
      "m11 22 1 1",
    ],
    fill: ["M7 5c9-1 16 2 20 8l-3 3C20 11 15 9 8 9Z"],
  },
  sushi: {
    paths: [
      "M6 16h20v8c-2 4-18 4-20 0v-8Z",
      "M4 15c0-9 24-9 24 0l-2 3H6l-2-3Z",
      "m10 10-3 6m10-7-4 8m10-6-4 6",
      "M13 18v9h6v-9",
    ],
    fill: ["M4 15c0-9 24-9 24 0l-2 3H6l-2-3Z"],
  },
  dumpling: {
    paths: ["M4 21C5 7 27 7 28 21c-5 8-19 8-24 0Z", "m5 19 4-2 1-5 4 3 3-5 3 5 4-2 1 6 3 2", "M10 23c4 2 8 2 12 0"],
    fill: ["M4 21C5 7 27 7 28 21c-5 8-19 8-24 0Z"],
  },
  kimchi: {
    paths: [
      "M5 19h22l-4 9H9l-4-9Z",
      "M10 19C5 7 13 3 17 7c4-4 10 1 5 12",
      "M15 19 13 8m3 11 4-10",
      "m9 11 5 2m-3 2 4 1m3-3 5-2m-6 6 5-2",
    ],
    fill: ["M5 19h22l-4 9H9l-4-9Z"],
  },
  curry: {
    paths: [
      "M6 17h20v5c0 8-20 8-20 0v-5Z",
      "M6 19H3v4h3m20-4h3v4h-3",
      "M5 17c2-7 20-7 22 0",
      "M11 9c-3-3 3-3 0-6m7 6c-3-3 3-3 0-6",
      "m12 14 3 1 4-2",
    ],
    fill: ["M6 17h20v5c0 8-20 8-20 0v-5Z"],
  },
  noodles: {
    paths: [
      "M3 18h26c-1 8-7 10-13 10S4 26 3 18Z",
      "m18 4 11 4m-12 0 12 4",
      "M12 10v8m4-7v7m4-6v6",
      "M8 18c-4-6 4-8 5-4m7 3c2-6 8-4 5 1",
    ],
    fill: ["M3 18h26c-1 8-7 10-13 10S4 26 3 18Z"],
  },
  pho: {
    paths: [
      "M4 17h24c-2 13-22 13-24 0Z",
      "M5 17c0-7 22-7 22 0",
      "M9 15c2-3 4 3 6 0s4 3 6 0",
      "m20 12 6-9m-3 11 7-9",
      "M8 8c-2-2 2-3 0-5",
      "m12 12 2-4 3 3",
    ],
    fill: ["M4 17h24c-2 13-22 13-24 0Z"],
  },
  olives: {
    paths: [
      "M7 27c7-5 12-12 16-23",
      "M14 19C4 21 3 12 11 14l3 5Z",
      "M19 12c-8 0-9-8-2-7l2 7Z",
      "M17 21c2-7 11-6 8 0-2 4-6 4-8 0Z",
      "M23 12c4-5 8 0 4 4-3 3-6 0-4-4Z",
    ],
    fill: ["M14 19C4 21 3 12 11 14l3 5Z", "M17 21c2-7 11-6 8 0-2 4-6 4-8 0Z"],
  },
  paella: {
    paths: [
      "M5 17a11 9 0 1 0 22 0 11 9 0 1 0-22 0",
      "M5 16H2v5h4m21-5h3v5h-4",
      "M9 16c3-5 7-2 4 1m6-5c6 0 6 7 1 6",
      "m12 22 2-2m5 3 2-2m-4-7 1 2",
    ],
    fill: ["M5 17a11 9 0 1 0 22 0 11 9 0 1 0-22 0"],
  },
  mezze: {
    paths: [
      "M3 21c1-7 25-7 26 0s-28 7-26 0Z",
      "M9 20c0-5 14-5 14 0s-14 5-14 0Z",
      "M13 20c1-2 5-2 6 0",
      "m5 14 4-9 6 8m3-2 5-6 4 10",
    ],
    fill: ["m5 14 4-9 6 8Z", "m18 11 5-6 4 10Z"],
  },
  injera: {
    paths: [
      "M3 17a13 11 0 1 0 26 0 13 11 0 1 0-26 0",
      "M7 12c5-5 9 1 4 4-5 2-7-1-4-4Z",
      "M20 10c6-1 7 6 1 6-5 0-5-4-1-6Z",
      "M14 20c5-5 12 1 7 4-6 4-12 0-7-4Z",
      "m7 21 1 1m8-13 1 1m-1 8 1 1",
    ],
    fill: ["M7 12c5-5 9 1 4 4-5 2-7-1-4-4Z", "M14 20c5-5 12 1 7 4-6 4-12 0-7-4Z"],
  },
  ceviche: {
    paths: [
      "M4 18h24c-2 12-22 12-24 0Z",
      "m7 17 3-6 6 3-3 4m4-1 3-6 5 4-2 3",
      "M19 9a6 6 0 0 1 10 6l-10-6Z",
      "m23 10-1 2m4 0-2 2",
      "M10 10c1-5 5-5 6 0",
    ],
    fill: ["M4 18h24c-2 12-22 12-24 0Z"],
  },
  falafel: {
    paths: [
      "M3 24c2 6 24 6 26 0",
      "M6 19a5 5 0 1 0 10 0 5 5 0 1 0-10 0",
      "M17 19a5 5 0 1 0 10 0 5 5 0 1 0-10 0",
      "M11 10a5 5 0 1 0 10 0 5 5 0 1 0-10 0",
      "m14 9 1 1m-5 8 1 2m10-2 1 1",
    ],
    fill: ["M11 10a5 5 0 1 0 10 0 5 5 0 1 0-10 0"],
  },
  croissant: {
    paths: [
      "M4 12c-5 12 8 20 12 14C22 32 35 17 27 11l-5 5-3-8-7 1-3 8-5-5Z",
      "m12 9 1 14m6-15-1 15M4 12l5 5m18-6-5 5",
      "M4 22 9 20m18 2-5-3",
    ],
    fill: ["m12 9 7-1 3 8-4 10h-5L9 17Z"],
  },
  coffee: {
    paths: ["M6 12h17v9c0 7-17 7-17 0v-9Z", "M23 14h3c6 0 3 9-3 7", "M3 28h25", "M10 8c-3-3 3-3 0-6m7 6c-3-3 3-3 0-6"],
    fill: ["M6 12h17v9c0 7-17 7-17 0v-9Z"],
  },
  carrot: {
    paths: ["M7 27c0-8 3-17 9-17 12 0 1 12-9 17Z", "m17 10 1-7 4 5 6-2-5 7", "m12 14 4 3m-7 3 3 2"],
    fill: ["M7 27c0-8 3-17 9-17 12 0 1 12-9 17Z"],
  },
  place: {
    paths: ["M10 17a7 7 0 1 0 14 0 7 7 0 1 0-14 0", "M4 5v8m3-8v8m-6-8v8h6m-3 0v15", "M28 5c-4 4-4 10 0 10V5Zm0 10v13"],
    fill: ["M13 17a4 4 0 1 0 8 0 4 4 0 1 0-8 0"],
  },
  table: {
    paths: ["M4 13h24v5H4Zm3 5v10m18-10v10", "M12 9h8m-4 0V4m-4 0h8", "M3 22h5m16 0h5"],
    fill: ["M4 13h24v5H4Z"],
  },
  passport: {
    paths: [
      "M7 4h19v24H7c-4 0-4-5 0-5h19M7 4C3 4 3 7 3 9v17",
      "M11 13a5 5 0 1 0 10 0 5 5 0 1 0-10 0",
      "M11 13h10m-5-5c-3 3-3 7 0 10 3-3 3-7 0-10",
    ],
    fill: ["M7 4h19v24H7Z"],
  },
  review: {
    paths: ["M6 4h17v10M6 4v24h17v-6", "M10 9h8m-8 5h5m-5 5h3", "m16 23 2-6L26 9l4 4-8 8-6 2Z", "m24 11 4 4"],
    fill: ["m16 23 2-6L26 9l4 4-8 8-6 2Z"],
  },
  map: {
    paths: [
      "m3 9 8-3 10 3 8-3v20l-8 3-10-3-8 3V9Z",
      "M11 6v20m10-17v20",
      "M12 12c0-6 9-6 9 0 0 3-4 7-4 7s-5-4-5-7Z",
      "M16 12h1",
    ],
    fill: ["M12 12c0-6 9-6 9 0 0 3-4 7-4 7s-5-4-5-7Z"],
  },
  globe: {
    paths: [
      "M4 16a12 12 0 1 0 24 0 12 12 0 1 0-24 0",
      "M4 16h24M16 4c-8 6-8 18 0 24 8-6 8-18 0-24",
      "M7 8c5 4 13 4 18 0M7 24c5-4 13-4 18 0",
    ],
    fill: [],
  },
  bookmark: {
    paths: ["M7 4h19v25H7c-4 0-4-5 0-5h19M7 4C3 4 3 7 3 9v17", "M16 4v13l4-3 3 3V4", "M9 20h7"],
    fill: ["M16 4v13l4-3 3 3V4Z"],
  },
  cloche: {
    paths: ["M5 23c0-17 22-17 22 0H5Z", "M3 27h26M16 9V5m-3 0h6", "M10 18c1-3 3-4 5-4"],
    fill: ["M5 23c0-17 22-17 22 0H5Z"],
  },
  appetizer: {
    paths: ["M4 25h24M7 25l-2-7h22l-2 7", "M7 18v-5h18v5M10 13l3-5 8 2 2 3", "M16 11V3m-2 0h4"],
    fill: ["M7 18v-5h18v5Z"],
  },
  tea: {
    paths: [
      "M3 16h10v5c0 6-10 6-10 0v-5Zm10 1h3v5h-3",
      "M18 12h10v5c0 6-10 6-10 0v-5Zm10 1h3v5h-3",
      "M2 28h13m2-4h13",
      "M7 12c-3-3 3-3 0-6m15 2c-2-2 2-3 0-5",
    ],
    fill: ["M3 16h10v5c0 6-10 6-10 0v-5Z", "M18 12h10v5c0 6-10 6-10 0v-5Z"],
  },
  cake: {
    paths: ["m5 16 17-8 5 8H5Zm0 0v11h22V16M5 22h22", "M18 9V6m-1-2c-3-4 6-4 3 0-1 2-2 2-3 0Z"],
    fill: ["m5 16 17-8 5 8H5Z"],
  },
  sharing: {
    paths: [
      "M8 16a8 8 0 1 0 16 0 8 8 0 1 0-16 0",
      "M12 16a4 4 0 1 0 8 0 4 4 0 1 0-8 0",
      "M3 3v7m3-7v7H1V3m2 7v8",
      "M29 29V15c-4 3-4 8 0 8",
      "m11 4 3-2m5 28 3-2",
    ],
    fill: ["M12 16a4 4 0 1 0 8 0 4 4 0 1 0-8 0"],
  },
  coupon: {
    paths: [
      "M3 8h26v6c-5 0-5 6 0 6v6H3v-6c5 0 5-6 0-6V8Z",
      "M10 8v3m0 3v3m0 3v3m0 2v1",
      "m17 21 7-8M17 13h.1M24 21h.1",
    ],
    fill: ["M3 8h26v6c-5 0-5 6 0 6v6H3v-6c5 0 5-6 0-6V8Z"],
  },
  breakfast: {
    paths: [
      "M3 7h13v8c0 6-13 6-13 0V7Zm13 2h4v5h-4",
      "M4 25c2-10 20-10 24 0l-5-2-3 5-5-2-5 2-2-5-4 2Z",
      "m13 20 2 6m4-6 1 8M7 4h5",
    ],
    fill: ["M4 25c2-10 20-10 24 0l-5-2-3 5-5-2-5 2-2-5-4 2Z"],
  },
} satisfies Record<string, { paths: string[]; fill: string[] }>;
export type AtlasIconName = keyof typeof ATLAS_ICONS;
export const CUISINE_ICONS: Record<string, AtlasIconName> = {
  American: "burger",
  Mexican: "taco",
  Italian: "pizza",
  Japanese: "sushi",
  Chinese: "dumpling",
  Korean: "kimchi",
  Indian: "curry",
  Thai: "noodles",
  Vietnamese: "pho",
  Greek: "olives",
  Spanish: "paella",
  Mediterranean: "mezze",
  Ethiopian: "injera",
  Peruvian: "ceviche",
  "Middle Eastern": "falafel",
  French: "croissant",
  "Bakery & Café": "coffee",
  Vegetarian: "carrot",
};
