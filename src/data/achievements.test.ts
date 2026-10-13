import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, DiningRecord, earnedAchievements, progressFor } from "./achievements";
import { CUISINES, normalizeCuisine } from "./cuisines";
const visit = (cuisine: string, status = "visited"): DiningRecord => ({ cuisine, status, rating: 5, location: "Town" });
describe("Tasting Atlas progression", () => {
  it("has 55 connected achievements and six reachable reward endpoints", () => {
    expect(ACHIEVEMENTS).toHaveLength(55);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(55);
    for (const node of ACHIEVEMENTS)
      for (const parent of node.parents) expect(ACHIEVEMENTS.some((a) => a.id === parent)).toBe(true);
    const restaurants = CUISINES.flatMap((cuisine, i) =>
      Array.from({ length: 3 }, () => ({ ...visit(cuisine), location: `Town ${i}` })),
    ).concat(Array.from({ length: 12 }, () => visit("Italian", "want-to-visit")));
    expect(earnedAchievements(restaurants)).toHaveLength(55);
    expect(ACHIEVEMENTS.filter((a) => a.reward)).toHaveLength(6);
  });
  it("does not award visits for saved restaurants", () => {
    expect(earnedAchievements([visit("Italian", "want-to-visit")])).toEqual([]);
  });
  it("unlocks a reward through either route and preserves it after deletion", () => {
    const restaurants = Array.from({ length: 25 }, () => visit("American"));
    const earned = earnedAchievements(restaurants);
    expect(earned).toContain("trail-0-reward");
    expect(earnedAchievements([], earned)).toEqual(earned);
    expect(earnedAchievements(restaurants, ["trail-0-bridge-1"])).toContain("trail-0-reward");
  });
  it("does not bypass prerequisites just because a metric is met", () => {
    expect(earnedAchievements(Array.from({ length: 25 }, () => visit("Other")))).toEqual(["first-bite"]);
  });
  it("normalizes legacy cuisine labels and ignores unrecognized cuisines for variety", () => {
    expect(normalizeCuisine(" sushi ")).toBe("Japanese");
    const node = ACHIEVEMENTS.find((a) => a.metric === "cuisines")!;
    expect(progressFor(node, [visit("Japanese"), visit("Sushi"), visit("unknown")])).toBe(1);
  });
});
