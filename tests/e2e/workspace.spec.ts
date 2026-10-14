import { test, expect, type Page } from "@playwright/test";
const destinations = [
  ["AI Agent", "/ai-agent"],
  ["Executive management", "/systems/executive-management"],
  ["People and team management", "/systems/people-and-team-management"],
  ["Project requirements and tasks", "/systems/project-requirements-and-tasks"],
  [
    "Engineering, quality, and releases",
    "/systems/engineering-quality-and-releases",
  ],
  ["Infrastructure and resources", "/systems/infrastructure-and-resources"],
  [
    "Communication, integration, and AI operations",
    "/systems/communication-integration-and-ai-operations",
  ],
  ["Sales, marketing, and CMS", "/systems/sales-marketing-and-cms"],
  [
    "Finance, expenses, and investment",
    "/systems/finance-expenses-and-investment",
  ],
  [
    "Documents, reporting, and data room",
    "/systems/documents-reporting-and-data-room",
  ],
  [
    "Administration, security, and reliability",
    "/systems/administration-security-and-reliability",
  ],
];
async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/ai-agent$/);
  await expect(
    page.getByRole("heading", { name: "AI Agent", exact: true }),
  ).toBeVisible();
}
test("login validates demo credentials and preserves a safe deep link", async ({
  page,
}) => {
  await page.goto("/systems/finance-expenses-and-investment");
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Use the demo credentials" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByLabel("Password", { exact: true }).fill("demo12345");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/systems\/finance-expenses-and-investment$/);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Finance, expenses, and investment",
      exact: true,
    }),
  ).toBeVisible();
});
test("every destination renders its placeholder and active navigation", async ({
  page,
}) => {
  await signIn(page);
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  for (const [title, path] of destinations) {
    await nav.getByRole("link", { name: title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Coming soon", exact: true }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: title, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
  await expect(page.getByRole("button", { name: "Add company" })).toHaveCount(
    0,
  );
});
test("sidebar, navigation search, popovers, and sign out work", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Executive management", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Executive management", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search navigation" });
  await expect(search).toBeVisible();
  await search.getByRole("textbox").fill("data room");
  await search
    .getByRole("link", {
      name: "Documents, reporting, and data room",
      exact: true,
    })
    .click();
  await expect(search).not.toBeVisible();
  await expect(page).toHaveURL(/documents-reporting-and-data-room$/);
  await page.getByLabel("Notifications", { exact: true }).click();
  await expect(page.getByText("All caught up", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("All caught up", { exact: true }),
  ).not.toBeVisible();
  await page.getByLabel("Account menu", { exact: true }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/ai-agent");
  await expect(page).toHaveURL(/\/login\?next=/);
});
test("mobile drawer navigates, dismisses, and keeps pages inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog", { name: "Navigation", exact: true });
  await expect(drawer).toBeVisible();
  await drawer
    .getByRole("link", {
      name: "Communication, integration, and AI operations",
      exact: true,
    })
    .click();
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Communication, integration, and AI operations",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
});
test("login rejects external return targets and unknown pages have a recovery link", async ({
  page,
}) => {
  await page.goto("/login?next=https://untrusted.example");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/ai-agent$/);
  await page.goto("/systems/unknown");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to workspace" }),
  ).toBeVisible();
});
