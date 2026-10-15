import { test, expect, type Page } from "@playwright/test";
import { comingSoonAreas } from "../../src/config/navigation";
import { createMockApi } from "./mock-api";

async function signIn(page: Page, next = "") {
  await page.goto(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

test.beforeEach(async ({ page }) => {
  await createMockApi()(page);
});

test("login validates demo credentials and preserves a safe deep link", async ({
  page,
}) => {
  await page.goto("/finance");
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Use the demo credentials" }),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill("demo12345");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/finance$/);
  await expect(
    page.getByRole("heading", { name: "Finance & investment", exact: true }),
  ).toBeVisible();
});

test("every area is in the sidebar and unbuilt areas show Coming soon", async ({
  page,
}) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/overview$/);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const area of comingSoonAreas) {
    await nav.getByRole("link", { name: area.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${area.href}$`));
    await expect(
      page.getByRole("heading", { name: area.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Coming soon", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: area.title, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("teams page selects my team, previews a clicked team and shows my team's people", async ({
  page,
}) => {
  await signIn(page, "/teams");
  await expect(
    page.getByRole("heading", { name: "Teams & members" }),
  ).toBeVisible();
  const details = page.getByRole("complementary", { name: "Team details" });
  await expect(details.getByRole("heading", { name: "C-suite" })).toBeVisible();
  await page.getByRole("row", { name: /US AI engineers/ }).click();
  await expect(
    details.getByRole("heading", { name: "US AI engineers" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /People/ }).click();
  await expect(page.getByLabel("Team", { exact: true })).toHaveValue(
    /b+-0000-4000-8000-0+1$/,
  );
  await expect(page.getByRole("row", { name: /Evan Ross/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Nina Patel/ })).toHaveCount(0);
  await page.getByLabel("Team", { exact: true }).selectOption("all");
  await expect(page.getByRole("row", { name: /Nina Patel/ })).toBeVisible();
});

test("managers create a team, add a member and delete it; developers can't", async ({
  page,
}) => {
  await signIn(page, "/teams");
  await page.getByRole("button", { name: "New team" }).click();
  const drawer = page.getByRole("dialog", { name: "New team" });
  await drawer.getByLabel("Team name").fill("QA guild");
  await drawer.getByLabel("Purpose").fill("Testing practice");
  await drawer
    .getByLabel("Team lead")
    .selectOption({ label: "Nina Patel · Frontend developer" });
  await drawer.getByRole("button", { name: "Create team" }).click();
  const panel = page.getByRole("dialog", { name: "Team" });
  await expect(panel.getByRole("heading", { name: "QA guild" })).toBeVisible();
  await panel
    .getByLabel("Add a person to QA guild")
    .selectOption({ label: "Noah Reed · Lead AI engineer" });
  await panel.getByRole("button", { name: "Add", exact: true }).click();
  await expect(panel.getByText("Noah Reed")).toBeVisible();
  await panel.getByRole("button", { name: "Delete team" }).click();
  await panel.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole("row", { name: /QA guild/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Account and preview role" }).click();
  await page.getByRole("menuitemradio", { name: /Nina Patel/ }).click();
  await expect(page.getByRole("button", { name: "New team" })).toHaveCount(0);
});

test("Ask AI explains when the API key is missing", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText("AI answers are off.")).toBeVisible();
  await page.getByRole("button", { name: "Who leads each team?" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "ANTHROPIC_API_KEY" }),
  ).toBeVisible();
});

test("search palette, notifications and sign out work", async ({ page }) => {
  await signIn(page);
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search" });
  await search
    .getByRole("combobox")
    .or(search.getByRole("textbox"))
    .fill("nina");
  await search.getByRole("option", { name: /Nina Patel/ }).click();
  await expect(page).toHaveURL(/\/teams\?view=people&person=/);
  await expect(
    page
      .getByRole("dialog", { name: "Person" })
      .getByRole("heading", { name: "Nina Patel" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByText("You’re all caught up.")).toBeVisible();
  await page.getByRole("button", { name: "Account and preview role" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("mobile drawer navigates and pages stay inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation", exact: true });
  await drawer
    .getByRole("link", { name: "Teams & members", exact: true })
    .click();
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Teams & members" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true);
});

test("login rejects external return targets and unknown pages have a recovery link", async ({
  page,
}) => {
  await page.goto("/login?next=https://untrusted.example");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/overview$/);
  await page.goto("/unknown-area");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to workspace" }),
  ).toBeVisible();
});

test("Ask AI shows Claude's answer with a live view when configured", async ({
  page,
}) => {
  await page.unrouteAll();
  await createMockApi({ aiConfigured: true })(page);
  await signIn(page);
  await page
    .getByLabel("Ask about your teams and people")
    .fill("Who leads India developers?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(
    page.getByText("Mira Sen leads India developers."),
  ).toBeVisible();
  const view = page.locator(".cc-w").filter({ hasText: "India developers" });
  await expect(view.getByText("Team lead · Engineering manager")).toBeVisible();
  await page.getByRole("button", { name: "Save view" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeDisabled();
});
