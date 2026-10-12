//run the real routes against a temporary database, never the app's database
const assert = require("node:assert/strict");
const { test, after } = require("node:test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local", quiet: true });

if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env.local to run account tests");
const databaseName = `tableaux_test_${Date.now()}_${process.pid}`;
const uri = new URL(process.env.MONGODB_URI);
uri.pathname = `/${databaseName}`;
process.env.MONGODB_URI = uri.toString();

//load the project's TypeScript and simulate Next's cookie store for each request
const cookieValues = new Map();
const cookieSettings = new Map();
const cookieStore = {
  get: (name) => (cookieValues.has(name) ? { value: cookieValues.get(name) } : undefined),
  set: (name, value, options) => {
    cookieSettings.set(name, options);
    if (options.maxAge === 0) cookieValues.delete(name);
    else cookieValues.set(name, value);
  },
};
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === "next/headers") return { cookies: async () => cookieStore };
  if (name.startsWith("@/")) name = path.resolve(__dirname, "..", name.slice(2));
  return originalLoad.call(this, name, parent, isMain);
};
require.extensions[".ts"] = (module, filename) => {
  const code = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  module._compile(code, filename);
};

const users = require("../app/api/users/route.ts");
const sessions = require("../app/api/session/route.ts");
const restaurants = require("../app/api/restaurants/route.ts");
const ratings = require("../app/api/restaurants/[id]/rating/route.ts");
const visitedCount = require("../app/api/restaurants/visited-count/route.ts");
const wishlistCount = require("../app/api/restaurants/want-to-visit-count/route.ts");
const UserModel = require("../database/userSchema.ts").default;
const SessionModel = require("../database/sessionSchema.ts").default;
const { hashPassword, verifyPassword } = require("../lib/password.ts");

function request(body, method = "POST", origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/test", {
    method,
    headers: { "Content-Type": "application/json", origin },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const first = { username: "alice_test", password: "first-password-123" };
const second = { username: "bob_test", password: "second-password-123" };
const restaurant = { name: "Test Cafe", cuisine: "Italian", location: "Chicago", status: "visited" };

after(async () => {
  //only delete the temporary database created by this test run
  if (mongoose.connection.db?.databaseName === databaseName) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("passwords use unique salts and reject the wrong password", async () => {
  const hash = await hashPassword(first.password);
  assert.notEqual(hash, first.password);
  assert.notEqual(hash, await hashPassword(first.password));
  assert.equal(await verifyPassword(first.password, hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
  assert.equal(await verifyPassword(first.password, "plaintext"), false);
});

test("signup, login, account isolation, embedded restaurants, expiry, and logout", async () => {
  assert.equal((await users.GET()).status, 401);
  assert.equal((await restaurants.GET()).status, 401);
  assert.deepEqual(await (await visitedCount.GET()).json(), { count: 0 });
  assert.equal((await restaurants.PATCH(request({ id: "a".repeat(24), status: "visited" }, "PATCH"))).status, 401);
  assert.equal((await restaurants.DELETE(request({ id: "a".repeat(24) }, "DELETE"))).status, 401);
  assert.equal((await restaurants.POST(request(restaurant))).status, 401);
  assert.equal((await users.POST(request(null))).status, 400);
  assert.equal((await users.POST(request({ username: { $ne: null }, password: first.password }))).status, 400);
  assert.equal((await users.POST(request({ ...first, password: "short" }))).status, 400);
  assert.equal((await users.POST(request(first, "POST", "https://other.example"))).status, 403);

  await require("../database/db.ts").default();
  const signup = await users.POST(request({ ...first, username: "ALICE_TEST" }));
  assert.equal(signup.status, 201, JSON.stringify(await signup.clone().json()));
  assert.deepEqual(await signup.json(), { username: first.username });
  assert.equal(UserModel.collection.name, "users");
  const storedUser = await UserModel.findOne({ username: first.username }).select("+password");
  assert.notEqual(storedUser.password, first.password);
  assert.equal((await UserModel.findById(storedUser._id)).password, undefined);
  assert.equal((await users.POST(request(first))).status, 409);
  assert.equal(cookieSettings.get("tableaux-session").httpOnly, true);
  assert.equal(cookieSettings.get("tableaux-session").sameSite, "lax");
  const firstToken = cookieValues.get("tableaux-session");
  assert.equal(await SessionModel.countDocuments({ token: firstToken }), 0);

  assert.equal((await restaurants.POST(request({ ...restaurant, name: " " }))).status, 400);
  assert.equal((await restaurants.POST(request({ ...restaurant, rating: 9 }))).status, 400);
  assert.equal((await restaurants.POST(request(null))).status, 400);
  assert.equal(
    (await restaurants.POST(new Request("http://localhost:3000/api/restaurants", { method: "POST", body: "{" })))
      .status,
    400,
  );
  assert.equal((await restaurants.POST(request(restaurant, "POST", "https://other.example"))).status, 403);
  assert.equal((await restaurants.POST(request({ ...restaurant, imageURL: "javascript:alert(1)" }))).status, 400);
  const added = await restaurants.POST(request({ ...restaurant, imageURL: "https://example.com/restaurant.jpg" }));
  assert.equal(added.status, 201);
  const addedRestaurant = await added.json();
  assert.match(addedRestaurant.id, /^[a-f0-9]{24}$/);
  const ratingContext = { params: { id: addedRestaurant.id } };
  const rated = await ratings.PATCH(request({ rating: 5 }, "PATCH"), ratingContext);
  assert.equal(rated.status, 200);
  assert.equal((await rated.json()).rating, 5);
  assert.equal((await (await restaurants.GET()).json())[0].rating, 5);
  for (const rating of [0, 6, 2.5, "5", null]) {
    assert.equal((await ratings.PATCH(request({ rating }, "PATCH"), ratingContext)).status, 400);
  }
  assert.equal(
    (await ratings.PATCH(request({ rating: 2 }, "PATCH", "https://other.example"), ratingContext)).status,
    403,
  );
  for (const status of ["want-to-visit", "want-to-visit", "visited"]) {
    assert.equal((await restaurants.PATCH(request({ id: addedRestaurant.id, status }, "PATCH"))).status, 204);
    const saved = (await (await restaurants.GET()).json()).find((item) => item.id === addedRestaurant.id);
    assert.equal(saved.status, status);
    assert.equal(saved.rating, 5);
    if (status === "want-to-visit") {
      assert.equal((await ratings.PATCH(request({ rating: 2 }, "PATCH"), ratingContext)).status, 404);
    }
    assert.equal(saved.imageURL, "https://example.com/restaurant.jpg");
  }
  for (const body of [null, { id: "invalid", status: "visited" }, { id: addedRestaurant.id, status: "invalid" }]) {
    assert.equal((await restaurants.PATCH(request(body, "PATCH"))).status, 400);
  }
  for (const method of ["PATCH", "DELETE"]) {
    assert.equal(
      (
        await restaurants[method](
          request({ id: addedRestaurant.id, status: "visited" }, method, "https://other.example"),
        )
      ).status,
      403,
    );
    assert.equal((await restaurants[method](request({ id: "a".repeat(24), status: "visited" }, method))).status, 404);
  }
  for (const status of ["visited", "want-to-visit"]) {
    const removable = await (await restaurants.POST(request({ ...restaurant, status }))).json();
    assert.equal((await restaurants.DELETE(request({ id: removable.id }, "DELETE"))).status, 204);
    assert.equal((await restaurants.DELETE(request({ id: removable.id }, "DELETE"))).status, 404);
    assert.equal(
      (await (await restaurants.GET()).json()).some((item) => item.id === removable.id),
      false,
    );
  }
  const concurrent = await Promise.all([
    restaurants.POST(request({ ...restaurant, name: "Second", status: "want-to-visit" })),
    restaurants.POST(request({ ...restaurant, name: "Third" })),
  ]);
  concurrent.forEach((response) => assert.equal(response.status, 201));
  assert.equal((await (await restaurants.GET()).json()).length, 3);
  assert.deepEqual(await (await visitedCount.GET()).json(), { count: 2 });
  assert.deepEqual(await (await wishlistCount.GET()).json(), { count: 1 });
  assert.equal((await UserModel.findById(storedUser._id)).restaurants.length, 3);

  assert.equal((await sessions.DELETE(request(undefined, "DELETE"))).status, 200);
  cookieValues.set("tableaux-session", firstToken);
  assert.equal((await restaurants.GET()).status, 401);
  assert.equal((await ratings.PATCH(request({ rating: 2 }, "PATCH"), ratingContext)).status, 401);
  cookieValues.clear();
  assert.equal((await users.POST(request(second))).status, 201);
  assert.deepEqual(await (await restaurants.GET()).json(), []);
  assert.equal((await ratings.PATCH(request({ rating: 2 }, "PATCH"), ratingContext)).status, 404);
  assert.equal(
    (await restaurants.PATCH(request({ id: addedRestaurant.id, status: "want-to-visit" }, "PATCH"))).status,
    404,
  );
  assert.equal((await restaurants.DELETE(request({ id: addedRestaurant.id }, "DELETE"))).status, 404);
  assert.equal((await restaurants.POST(request({ ...restaurant, username: first.username }))).status, 201);
  assert.equal((await (await restaurants.GET()).json()).length, 1);
  assert.equal((await UserModel.findById(storedUser._id)).restaurants.length, 3);

  await sessions.DELETE(request(undefined, "DELETE"));
  assert.equal((await sessions.POST(request({ ...first, password: "wrong-password" }))).status, 401);
  assert.equal((await sessions.POST(request({ username: "missing", password: first.password }))).status, 401);
  assert.equal((await sessions.POST(request(first))).status, 200);
  assert.deepEqual(await (await users.GET()).json(), { username: first.username });
  assert.equal((await (await restaurants.GET()).json()).length, 3);
  assert.equal((await (await restaurants.GET()).json()).find((item) => item.id === addedRestaurant.id).rating, 5);
  await SessionModel.updateMany({}, { expiresAt: new Date(0) });
  assert.equal((await restaurants.GET()).status, 401);
  assert.equal((await users.GET()).status, 401);
});
