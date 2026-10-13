import { describe, test, expect } from "vitest";

//test the functionality of the want-to-visit page
describe("want-to-visit", () => {
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

  //test that navigation identifies the want-to-visit page as active
  test("want-to-visit navigation link is active", async () => {
    const response = await fetch("http://localhost:3000/want-to-visit");
    const html = new DOMParser().parseFromString(await response.text(), "text/html");
    const link = html.querySelector('nav a[href="/want-to-visit"]');
    expect(link?.getAttribute("aria-current")).toBe("page");
  });
});
