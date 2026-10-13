import { AtlasIconName, CUISINE_ICONS } from "./atlasIcons";
import { normalizeCuisine } from "./cuisines";

export type DiningRecord = { cuisine: string; status: string; rating?: number; location: string };
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: AtlasIconName;
  trail: string;
  x: number;
  y: number;
  parents: string[];
  target: number;
  metric: "visits" | "cuisines" | "ratings" | "saved" | "locations" | "cuisine";
  cuisine?: string;
  reward?: string;
};
export const TRAILS = [
  {
    name: "The comfort table",
    cuisines: ["American", "Mexican", "Italian"],
    reward: "A little on the house · appetizer",
  },
  {
    name: "Eastern discoveries",
    cuisines: ["Japanese", "Chinese", "Korean"],
    reward: "Tea for two · complimentary drinks",
  },
  {
    name: "The spice route",
    cuisines: ["Indian", "Thai", "Vietnamese"],
    reward: "Something sweet · dessert",
  },
  {
    name: "Mediterranean evenings",
    cuisines: ["Greek", "Spanish", "Mediterranean"],
    reward: "Share the table · small plate",
  },
  {
    name: "Beyond the familiar",
    cuisines: ["Ethiopian", "Peruvian", "Middle Eastern"],
    reward: "Your next discovery · dining discount",
  },
  {
    name: "Slow mornings",
    cuisines: ["French", "Bakery & Café", "Vegetarian"],
    reward: "Morning ritual · coffee & pastry",
  },
];
const root: Achievement = {
  id: "first-bite",
  title: "The first bite",
  description: "Log your first visited restaurant.",
  icon: "place",
  trail: "Your journey",
  x: -245,
  y: 65,
  parents: [],
  target: 1,
  metric: "visits",
};
export const ACHIEVEMENTS: Achievement[] = [root];
// Hand-spaced, uneven neighborhoods keep the atlas organic and stable across visits.
// Each trail has three tastes, three regulars, two connecting stops, and a reward.
const TRAIL_POSITIONS: [number, number][][] = [
  [
    [-360, -100],
    [-505, -170],
    [-300, -260],
    [-625, -285],
    [-460, -355],
    [-260, -435],
    [-655, -475],
    [-455, -570],
    [-660, -655],
  ],
  [
    [-60, -145],
    [75, -260],
    [-90, -355],
    [210, -370],
    [65, -465],
    [-120, -540],
    [225, -570],
    [60, -645],
    [300, -720],
  ],
  [
    [255, -120],
    [375, -245],
    [485, -105],
    [540, -350],
    [675, -245],
    [615, -55],
    [710, -455],
    [445, -505],
    [590, -620],
  ],
  [
    [90, 70],
    [275, 140],
    [410, 45],
    [480, 245],
    [655, 120],
    [670, 325],
    [520, 435],
    [725, 475],
    [655, 630],
  ],
  [
    [-45, 240],
    [140, 315],
    [300, 365],
    [-125, 425],
    [80, 495],
    [320, 530],
    [-60, 615],
    [225, 675],
    [70, 755],
  ],
  [
    [-440, 80],
    [-600, 155],
    [-350, 280],
    [-700, 310],
    [-525, 365],
    [-300, 470],
    [-640, 515],
    [-425, 605],
    [-655, 685],
  ],
];
TRAILS.forEach((trail, i) => {
  const position = (index: number) => ({ x: TRAIL_POSITIONS[i][index][0], y: TRAIL_POSITIONS[i][index][1] });
  const id = (suffix: string) => `trail-${i}-${suffix}`;
  trail.cuisines.forEach((cuisine, j) => {
    ACHIEVEMENTS.push({
      id: id(`taste-${j}`),
      title: `${cuisine} curious`,
      description: `Visit 1 ${cuisine} restaurant.`,
      icon: CUISINE_ICONS[cuisine],
      trail: trail.name,
      ...position(j),
      parents: [root.id],
      target: 1,
      metric: "cuisine",
      cuisine,
    });
    ACHIEVEMENTS.push({
      id: id(`lover-${j}`),
      title: `${cuisine} regular`,
      description: `Visit 3 ${cuisine} restaurants.`,
      icon: CUISINE_ICONS[cuisine],
      trail: trail.name,
      ...position(j + 3),
      parents: [id(`taste-${j}`), id(`taste-${(j + 1) % 3}`)],
      target: 3,
      metric: "cuisine",
      cuisine,
    });
  });
  const metrics = ["visits", "cuisines", "ratings", "locations", "cuisines", "saved"] as const;
  const targets = [10, 6, 8, 5, 10, 12];
  const titles = [
    "A table for every mood",
    "Passport of flavors",
    "A trusted palate",
    "Around the neighborhood",
    "A world at your table",
    "The next chapter",
  ];
  const descriptions = [
    "Visit 10 restaurants.",
    "Try 6 different preset cuisines.",
    "Rate 8 visited restaurants.",
    "Visit restaurants in 5 different locations.",
    "Try 10 different preset cuisines.",
    "Save 12 restaurants to your want-to-visit list.",
  ];
  for (let k = 0; k < 2; k++)
    ACHIEVEMENTS.push({
      id: id(`bridge-${k}`),
      title: k ? `${trail.name}: connoisseur` : titles[i],
      description: k ? "Visit 20 restaurants and follow any connecting route." : descriptions[i],
      icon: k ? "cloche" : (["table", "passport", "review", "map", "globe", "bookmark"] as const)[i],
      trail: trail.name,
      ...position(k + 6),
      parents: [0, 1, 2].map((j) => id(`lover-${j}`)).concat(`trail-${(i + (k ? 1 : 5)) % 6}-lover-${k ? 0 : 2}`),
      target: k ? 20 : targets[i],
      metric: k ? "visits" : metrics[i],
    });
  ACHIEVEMENTS.push({
    id: id("reward"),
    title: `${trail.name}: table reward`,
    description: "Visit 25 restaurants and complete either connecting achievement.",
    icon: (["appetizer", "tea", "cake", "sharing", "coupon", "breakfast"] as const)[i],
    trail: trail.name,
    ...position(8),
    parents: [id("bridge-0"), id("bridge-1")],
    target: 25,
    metric: "visits",
    reward: trail.reward,
  });
});
export function progressFor(node: Achievement, restaurants: DiningRecord[]) {
  const visited = restaurants.filter((r) => r.status === "visited");
  switch (node.metric) {
    case "visits":
      return visited.length;
    case "ratings":
      return visited.filter((r) => (r.rating || 0) > 0).length;
    case "saved":
      return restaurants.filter((r) => r.status === "want-to-visit").length;
    case "locations":
      return new Set(visited.map((r) => r.location.trim().toLowerCase())).size;
    case "cuisines":
      return new Set(visited.map((r) => normalizeCuisine(r.cuisine)).filter((c) => c !== "Other")).size;
    case "cuisine":
      return visited.filter((r) => normalizeCuisine(r.cuisine) === node.cuisine).length;
  }
}
export function earnedAchievements(restaurants: DiningRecord[], previous: string[] = []) {
  const earned = new Set(previous.filter((id) => ACHIEVEMENTS.some((a) => a.id === id)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of ACHIEVEMENTS) {
      if (
        !earned.has(node.id) &&
        progressFor(node, restaurants) >= node.target &&
        (!node.parents.length || node.parents.some((id) => earned.has(id)))
      ) {
        earned.add(node.id);
        changed = true;
      }
    }
  }
  return Array.from(earned);
}
