import { describe, test, expect } from "vitest";

//test the functionality of the want-to-visit page
describe("want-to-visit", () => {
  //make sure there is not a server-side error when fetching from the restaurant api route
  test("fetching from the api route", async () => {
    const response = await fetch("http://localhost:3000/api/restaurants");
    expect(response.status).not.toBe(500);
  });

  //test that the want-to-visit page exists
  test("want-to-visit page is available", async () => {
    const response = await fetch("http://localhost:3000/want-to-visit");
    expect(response.status).toBe(200);
  });

  //test that saved restaurants require a logged-in account
  test("restaurants require a login", async () => {
    const response = await fetch("http://localhost:3000/api/restaurants");
    expect(response.status).toBe(401);
  });
});
