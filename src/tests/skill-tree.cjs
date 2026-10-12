const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const ts = require("typescript");

// Exercise the pure progression and camera rules without a database or a browser.
const source = ts.transpileModule(readFileSync(require.resolve("../data/skillTree.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const compiled = { exports: {} };
new Function("exports", "require", "module", source)(compiled.exports, require, compiled);
const { SKILL_NODES, getSkillProgress, zoomTree } = compiled.exports;
const restaurant = (cuisine, status = "visited") => ({
  id: Math.random().toString(),
  name: "Example",
  location: "Town",
  cuisine,
  status,
});

test("only visited restaurants unlock the tree; cuisine counting ignores whitespace and case", () => {
  assert.equal(getSkillProgress([]).unlocked.size, 0);
  assert.equal(getSkillProgress([restaurant("Italian", "want-to-visit")]).unlocked.size, 0);
  const result = getSkillProgress([restaurant(" Italian "), restaurant("ITALIAN"), restaurant("Japanese")]);
  assert.equal(result.metrics.visits, 3);
  assert.equal(result.metrics.cuisines, 2);
  assert.equal(result.metrics.italian, 2);
  assert.equal(result.metrics.japanese, 1);
  assert.ok(result.unlocked.has("origin"));
  assert.ok(result.unlocked.has("italian-2"));
  assert.ok(!result.unlocked.has("italian-3"));
  assert.ok(!result.unlocked.has("explorer-2"));
});

test("every branch has a valid prerequisite chain and a terminal mock reward", () => {
  const seen = new Set();
  for (const node of SKILL_NODES) {
    assert.ok(!seen.has(node.id), "unique node ID");
    for (const parent of node.parents ?? []) assert.ok(seen.has(parent), "parent precedes child");
    seen.add(node.id);
    if (!SKILL_NODES.some((child) => child.parents?.includes(node.id))) {
      assert.ok(node.reward);
      assert.match(node.reward.code, /^MOCK-/);
    }
  }
});

test("rewards unlock at the threshold, never one visit early", () => {
  const before = getSkillProgress(Array.from({ length: 3 }, () => restaurant("Italian")));
  assert.ok(!before.unlocked.has("italian-reward"));
  const after = getSkillProgress(Array.from({ length: 4 }, () => restaurant("Italian")));
  assert.ok(after.unlocked.has("italian-reward"));
  assert.ok(!after.unlocked.has("japanese-reward"));
});

test("all paths can be completed and every unlocked node has its parent unlocked", () => {
  const cuisines = [
    "Italian",
    "Japanese",
    "French",
    "Thai",
    "Indian",
    "Greek",
    "Mexican",
    "Chinese",
    "German",
    "Spanish",
    "Korean",
    "American",
  ].flatMap((cuisine) => Array(6).fill(cuisine));
  const { unlocked } = getSkillProgress(cuisines.map((cuisine) => restaurant(cuisine)));
  assert.equal(unlocked.size, SKILL_NODES.length);
  for (const node of SKILL_NODES)
    if (unlocked.has(node.id)) for (const parent of node.parents ?? []) assert.ok(unlocked.has(parent));
});

test("zoom holds the world point under the cursor steady and clamps both limits", () => {
  const camera = { x: -120, y: 80, scale: 0.65 };
  const anchor = { x: 247, y: 189 };
  const next = zoomTree(camera, 1.4, anchor);
  assert.ok(Math.abs((anchor.x - camera.x) / camera.scale - (anchor.x - next.x) / next.scale) < 1e-8);
  assert.ok(Math.abs((anchor.y - camera.y) / camera.scale - (anchor.y - next.y) / next.scale) < 1e-8);
  assert.equal(zoomTree(camera, 100, anchor).scale, 2.2);
  assert.equal(zoomTree(camera, 0.001, anchor).scale, 0.1);
});

test("junctions require both connected skills even when their own metric is met", () => {
  const visits = ["Indian", "Italian", "Mexican", "Greek"].map((cuisine) => restaurant(cuisine));
  const before = getSkillProgress(visits);
  assert.equal(before.metrics.cuisines, 4);
  assert.ok(before.unlocked.has("spice-india"));
  assert.ok(!before.unlocked.has("spice-thai"));
  assert.ok(!before.unlocked.has("spice-junction"));
  const after = getSkillProgress([...visits, restaurant("Thai")]);
  assert.ok(after.unlocked.has("spice-junction"));
  assert.ok(!after.unlocked.has("spice-reward"));
});

test("the map includes multiple forks and junctions, with no overlapping node controls", () => {
  const forks = SKILL_NODES.filter(
    (node) => SKILL_NODES.filter((child) => child.parents?.includes(node.id)).length > 1,
  );
  assert.ok(forks.length >= 5);
  assert.ok(SKILL_NODES.filter((node) => node.parents?.length > 1).length >= 3);
  for (let index = 0; index < SKILL_NODES.length; index++) {
    for (const other of SKILL_NODES.slice(index + 1)) {
      const node = SKILL_NODES[index];
      assert.ok(
        Math.abs(node.x - other.x) >= 136 || Math.abs(node.y - other.y) >= 105,
        `${node.id} overlaps ${other.id}`,
      );
    }
  }
});
