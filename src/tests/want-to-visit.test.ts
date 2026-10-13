import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, test, expect, vi } from "vitest";
import WishlistPage from "@/app/want-to-visit/page";
import { AccountProvider } from "@/components/AccountProvider";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderPage() {
  render(createElement(AccountProvider, null, createElement(WishlistPage)));
}

function mockRestaurants(restaurants: object[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (url: string) => {
      if (url === "/api/users") return Response.json({ username: "test-user" });
      if (url === "/api/restaurants") return Response.json(restaurants);
      throw new Error(`Unexpected request: ${url}`);
    }),
  );
}

//test the functionality of the want-to-visit page
describe("want-to-visit", () => {
  //test that a logged-in user can see the page and add restaurants
  test("want-to-visit page is available", async () => {
    mockRestaurants([]);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Want to visit" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Add Restaurant" })).toBeInTheDocument();
  });

  //test that saved restaurants require a logged-in account
  test("restaurants require a login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Please log in first" }, { status: 401 })));
    renderPage();
    expect(await screen.findByRole("link", { name: /Log in or sign up/ })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Add Restaurant" })).not.toBeInTheDocument();
  });

  //test that visited restaurants are excluded from the wishlist
  test("only shows restaurants marked want-to-visit", async () => {
    mockRestaurants([
      { id: "1", name: "Future Bistro", cuisine: "French", location: "Seattle", status: "want-to-visit" },
      { id: "2", name: "Visited Cafe", cuisine: "Italian", location: "Seattle", status: "visited" },
    ]);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Future Bistro" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Visited Cafe" })).not.toBeInTheDocument();
  });
});
