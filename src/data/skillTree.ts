import type { Restaurant } from "../types/restaurant";

export type SkillMetric =
  | "visits"
  | "cuisines"
  | "italian"
  | "japanese"
  | "indian"
  | "thai"
  | "french"
  | "greek"
  | "mexican"
  | "chinese";
export type SkillNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  parents?: string[];
  metric: SkillMetric;
  target: number;
  branch: "origin" | "explorer" | "regular" | "italian" | "japanese";
  reward?: { title: string; restaurant: string; code: string };
};

export const SKILL_NODES: SkillNode[] = [
  { id: "origin", name: "First Bite", x: 1100, y: 900, metric: "visits", target: 1, branch: "origin" },
  {
    id: "explorer-1",
    name: "Curious Palate",
    x: 890,
    y: 710,
    parents: ["origin"],
    metric: "cuisines",
    target: 2,
    branch: "explorer",
  },
  {
    id: "explorer-2",
    name: "Border Hopper",
    x: 670,
    y: 650,
    parents: ["explorer-1"],
    metric: "cuisines",
    target: 4,
    branch: "explorer",
  },
  {
    id: "explorer-3",
    name: "World Taster",
    x: 540,
    y: 460,
    parents: ["explorer-2"],
    metric: "cuisines",
    target: 6,
    branch: "explorer",
  },
  {
    id: "explorer-reward",
    name: "A World of Flavor",
    x: 350,
    y: 360,
    parents: ["explorer-3"],
    metric: "cuisines",
    target: 8,
    branch: "explorer",
    reward: { title: "$15 off a tasting menu", restaurant: "Atlas Kitchen", code: "MOCK-ATLAS-15" },
  },
  {
    id: "regular-1",
    name: "Table for One",
    x: 1300,
    y: 670,
    parents: ["origin"],
    metric: "visits",
    target: 3,
    branch: "regular",
  },
  {
    id: "regular-2",
    name: "Familiar Face",
    x: 1530,
    y: 640,
    parents: ["regular-1"],
    metric: "visits",
    target: 6,
    branch: "regular",
  },
  {
    id: "regular-3",
    name: "Seasoned Diner",
    x: 1740,
    y: 490,
    parents: ["regular-2"],
    metric: "visits",
    target: 10,
    branch: "regular",
  },
  {
    id: "regular-reward",
    name: "The Chef’s Table",
    x: 1910,
    y: 350,
    parents: ["regular-3"],
    metric: "visits",
    target: 15,
    branch: "regular",
    reward: { title: "A complimentary dessert", restaurant: "Ember & Oak", code: "MOCK-EMBER-SWEET" },
  },
  {
    id: "italian-1",
    name: "Ciao, Italia",
    x: 860,
    y: 1060,
    parents: ["origin"],
    metric: "italian",
    target: 1,
    branch: "italian",
  },
  {
    id: "italian-2",
    name: "Pasta Pilgrim",
    x: 640,
    y: 1080,
    parents: ["italian-1"],
    metric: "italian",
    target: 2,
    branch: "italian",
  },
  {
    id: "italian-3",
    name: "La Dolce Vita",
    x: 500,
    y: 1280,
    parents: ["italian-2"],
    metric: "italian",
    target: 3,
    branch: "italian",
  },
  {
    id: "italian-reward",
    name: "An Italian Evening",
    x: 320,
    y: 1450,
    parents: ["italian-3"],
    metric: "italian",
    target: 4,
    branch: "italian",
    reward: { title: "20% off a pasta entrée", restaurant: "Casa Luna", code: "MOCK-LUNA-20" },
  },
  {
    id: "japanese-1",
    name: "First Sakura",
    x: 1330,
    y: 1090,
    parents: ["origin"],
    metric: "japanese",
    target: 1,
    branch: "japanese",
  },
  {
    id: "japanese-2",
    name: "Umami Seeker",
    x: 1530,
    y: 1050,
    parents: ["japanese-1"],
    metric: "japanese",
    target: 2,
    branch: "japanese",
  },
  {
    id: "japanese-3",
    name: "Taste of Tokyo",
    x: 1680,
    y: 1260,
    parents: ["japanese-2"],
    metric: "japanese",
    target: 3,
    branch: "japanese",
  },
  {
    id: "japanese-reward",
    name: "The Sakura Table",
    x: 1890,
    y: 1440,
    parents: ["japanese-3"],
    metric: "japanese",
    target: 4,
    branch: "japanese",
    reward: { title: "A complimentary starter", restaurant: "Sakura House", code: "MOCK-SAKURA-START" },
  },
  {
    id: "spice-india",
    name: "Spice Route",
    x: 850,
    y: 450,
    parents: ["explorer-1"],
    metric: "indian",
    target: 1,
    branch: "explorer",
  },
  {
    id: "spice-thai",
    name: "Thai Detour",
    x: 1100,
    y: 500,
    parents: ["explorer-1"],
    metric: "thai",
    target: 1,
    branch: "explorer",
  },
  {
    id: "spice-junction",
    name: "Spice Confluence",
    x: 1000,
    y: 260,
    parents: ["spice-india", "spice-thai"],
    metric: "cuisines",
    target: 4,
    branch: "explorer",
  },
  {
    id: "spice-reward",
    name: "The Spice Table",
    x: 1160,
    y: 90,
    parents: ["spice-junction"],
    metric: "cuisines",
    target: 6,
    branch: "explorer",
    reward: { title: "A complimentary shared starter", restaurant: "Saffron & Lime", code: "MOCK-SPICE-START" },
  },
  {
    id: "med-french",
    name: "Bonjour, Bistro",
    x: 850,
    y: 1330,
    parents: ["italian-1"],
    metric: "french",
    target: 1,
    branch: "italian",
  },
  {
    id: "med-greek",
    name: "Aegean Escape",
    x: 1100,
    y: 1350,
    parents: ["italian-1"],
    metric: "greek",
    target: 1,
    branch: "italian",
  },
  {
    id: "med-junction",
    name: "Coastal Crossing",
    x: 1000,
    y: 1530,
    parents: ["med-french", "med-greek"],
    metric: "cuisines",
    target: 5,
    branch: "italian",
  },
  {
    id: "med-reward",
    name: "Coast to Coast",
    x: 1100,
    y: 1700,
    parents: ["med-junction"],
    metric: "cuisines",
    target: 7,
    branch: "italian",
    reward: { title: "A complimentary mezze plate", restaurant: "Olive Terrace", code: "MOCK-OLIVE-MEZZE" },
  },
  {
    id: "street-mexico",
    name: "Taco Trail",
    x: 1480,
    y: 870,
    parents: ["regular-1"],
    metric: "mexican",
    target: 1,
    branch: "regular",
  },
  {
    id: "street-china",
    name: "Dumpling Detour",
    x: 1720,
    y: 840,
    parents: ["regular-2"],
    metric: "chinese",
    target: 1,
    branch: "regular",
  },
  {
    id: "street-junction",
    name: "Market Crossroads",
    x: 1920,
    y: 940,
    parents: ["street-mexico", "street-china"],
    metric: "visits",
    target: 12,
    branch: "regular",
  },
  {
    id: "street-reward",
    name: "Night Market",
    x: 2100,
    y: 800,
    parents: ["street-junction"],
    metric: "visits",
    target: 18,
    branch: "regular",
    reward: { title: "$10 off a market platter", restaurant: "Lantern Market", code: "MOCK-LANTERN-10" },
  },
  {
    id: "explorer-mastery",
    name: "Beyond Borders",
    x: 380,
    y: 800,
    parents: ["explorer-2"],
    metric: "cuisines",
    target: 10,
    branch: "explorer",
  },
  {
    id: "explorer-mastery-reward",
    name: "The Grand Tour",
    x: 150,
    y: 900,
    parents: ["explorer-mastery"],
    metric: "cuisines",
    target: 12,
    branch: "explorer",
    reward: { title: "25% off a tasting flight", restaurant: "Meridian Table", code: "MOCK-MERIDIAN-25" },
  },
  {
    id: "regular-mastery",
    name: "Dining Devotee",
    x: 1990,
    y: 560,
    parents: ["regular-3"],
    metric: "visits",
    target: 20,
    branch: "regular",
  },
  {
    id: "regular-mastery-reward",
    name: "Guest of Honor",
    x: 2100,
    y: 150,
    parents: ["regular-mastery"],
    metric: "visits",
    target: 25,
    branch: "regular",
    reward: { title: "$20 off dinner for two", restaurant: "The Copper Room", code: "MOCK-COPPER-20" },
  },
  {
    id: "japanese-mastery",
    name: "Ramen Rambler",
    x: 1550,
    y: 1490,
    parents: ["japanese-3"],
    metric: "japanese",
    target: 5,
    branch: "japanese",
  },
  {
    id: "japanese-mastery-reward",
    name: "Umami Master",
    x: 1750,
    y: 1690,
    parents: ["japanese-mastery"],
    metric: "japanese",
    target: 6,
    branch: "japanese",
    reward: { title: "A complimentary bowl of ramen", restaurant: "Kumo Noodle Bar", code: "MOCK-KUMO-RAMEN" },
  },
];

export function getSkillProgress(restaurants: Restaurant[]) {
  const visited = restaurants.filter((restaurant) => restaurant.status === "visited");
  const cuisines = visited.map((restaurant) => restaurant.cuisine.trim().toLowerCase());
  const metrics: Record<SkillMetric, number> = {
    indian: 0,
    thai: 0,
    french: 0,
    greek: 0,
    mexican: 0,
    chinese: 0,
    visits: visited.length,
    cuisines: new Set(cuisines.filter(Boolean)).size,
    italian: cuisines.filter((cuisine) => cuisine === "italian").length,
    japanese: cuisines.filter((cuisine) => cuisine === "japanese").length,
  };
  for (const cuisine of ["indian", "thai", "french", "greek", "mexican", "chinese"] as const) {
    metrics[cuisine] = cuisines.filter((value) => value === cuisine).length;
  }
  // Parents precede children so every unlock requires an unbroken path from the origin.
  const unlocked = new Set<string>();
  for (const node of SKILL_NODES) {
    if (isPathOpen(node, unlocked) && metrics[node.metric] >= node.target) unlocked.add(node.id);
  }
  return { metrics, unlocked };
}

export function skillRequirement(node: SkillNode) {
  if (node.metric === "cuisines") return `Visit restaurants from ${node.target} different cuisines.`;
  const cuisine = node.metric === "visits" ? "" : `${node.metric[0].toUpperCase()}${node.metric.slice(1)} `;
  return `Save ${node.target} ${cuisine}${node.target === 1 ? "restaurant" : "restaurants"} as visited.`;
}

export type TreeCamera = { x: number; y: number; scale: number };
export function zoomTree(camera: TreeCamera, factor: number, anchor: { x: number; y: number }): TreeCamera {
  const scale = Math.min(2.2, Math.max(0.1, camera.scale * factor));
  const ratio = scale / camera.scale;
  return { x: anchor.x - (anchor.x - camera.x) * ratio, y: anchor.y - (anchor.y - camera.y) * ratio, scale };
}

export function isPathOpen(node: SkillNode, unlocked: Set<string>): boolean {
  return (node.parents ?? []).every((id) => unlocked.has(id));
}

export const TREE_SIZE = { width: 2250, height: 1840, originX: 1100, originY: 900 };
