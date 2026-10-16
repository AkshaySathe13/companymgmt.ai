import { test, expect, type Page } from "@playwright/test";
import { comingSoonAreas } from "../../src/config/navigation";
import { createMockApi, DEMO_PASSWORD, emailOf } from "./mock-api";

async function signIn(page: Page, name = "Aarav Shah", next = "") {
  await page.goto(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.getByLabel("Email address").fill(emailOf(name));
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

const nav = (page: Page) =>
  page.getByRole("navigation", { name: "Main navigation" });

test.beforeEach(async ({ page }) => {
  await createMockApi()(page);
});

test("sign-in checks credentials, offers demo users and keeps a safe deep link", async ({
  page,
}) => {
  await page.goto("/finance");
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Email address").fill(emailOf("Aarav Shah"));
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Email or password is incorrect." }),
  ).toBeVisible();
  await page
    .getByLabel("Try a demo user")
    .selectOption({
      label: "cfo@gmail.com — CFO · C-suite · Executive Member",
    });
  await expect(page.getByLabel("Email address")).toHaveValue(
    emailOf("Meera Iyer"),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/finance$/);
  await expect(
    page.getByRole("heading", { name: "Finance & investment", exact: true }),
  ).toBeVisible();
});

test("the Leadership Lead sees every area, and unbuilt areas show Coming soon", async ({
  page,
}) => {
  await signIn(page);
  await expect(page).toHaveURL(/\/overview$/);
  await expect(
    nav(page).getByRole("link", { name: "Administration" }),
  ).toBeVisible();
  for (const area of comingSoonAreas) {
    await nav(page)
      .getByRole("link", { name: area.title, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${area.href}$`));
    await expect(
      page.getByRole("heading", { name: "Coming soon", exact: true }),
    ).toBeVisible();
    await expect(
      nav(page).getByRole("link", { name: area.title, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
});

test("a team member sees their role's sections and only their team's details", async ({
  page,
}) => {
  await signIn(page, "Sneha Kulkarni", "/teams");
  for (const hidden of [
    "Finance & investment",
    "Sales & marketing",
    "Administration",
  ])
    await expect(nav(page).getByRole("link", { name: hidden })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "New team" })).toHaveCount(0);

  await page.getByRole("tab", { name: /People/ }).click();
  await page.getByLabel("Team", { exact: true }).selectOption("all");
  await expect(page.getByRole("button", { name: "Add user" })).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Rahul Verma/ })).toContainText(
    "Pune, India",
  );
  await expect(page.getByRole("row", { name: /Marcus Lee/ })).toContainText(
    "Visible to their team",
  );
  await page.getByRole("row", { name: /Marcus Lee/ }).click();
  const person = page.getByRole("dialog", { name: "Person" });
  await expect(
    person.getByText("are visible to Marcus’s teammates"),
  ).toBeVisible();
  for (const name of ["Edit profile", "Reset password", "Delete user"])
    await expect(person.getByRole("button", { name })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.goto("/finance");
  await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();
});

test("an investor only gets investor sections", async ({ page }) => {
  await signIn(page, "Robert Hayes");
  await expect(
    nav(page).getByRole("link", { name: "Finance & investment" }),
  ).toBeVisible();
  for (const hidden of [
    "Teams & members",
    "Tasks",
    "Sales & marketing",
    "AI tools & skills",
  ])
    await expect(nav(page).getByRole("link", { name: hidden })).toHaveCount(0);
  await page.goto("/teams");
  await expect(page.getByRole("heading", { name: "No access" })).toBeVisible();
});

test("a team manager adds a user to their team, who then sets their own password", async ({
  page,
}) => {
  await signIn(page, "Rahul Verma", "/teams?view=people");
  await page.getByRole("button", { name: "Add user" }).click();
  const form = page.getByRole("dialog", { name: "New person" });
  // Managers can only add people to the team they manage.
  await expect(form.locator('select[name="teamId"] option')).toHaveText([
    "India developers",
  ]);
  await expect(form.getByText("Team Member", { exact: true })).toBeVisible();
  await form.getByLabel("Full name").fill("Tara Singh");
  await form.getByLabel("Work email").fill("tara.singh@carrieros.example");
  await form.getByLabel("Job title").fill("Software Engineer");
  await form.getByLabel("Location").fill("Pune, India");
  await form.getByLabel("Temporary password").fill("Welcome#2026");
  await form.getByRole("button", { name: "Add user" }).click();

  const person = page.getByRole("dialog", { name: "Person" });
  await expect(
    person.getByRole("heading", { name: "Tara Singh" }),
  ).toBeVisible();
  await expect(
    person.getByRole("button", { name: /^India developers/ }),
  ).toContainText("Team Member");
  await expect(
    person.getByRole("button", { name: "Reset password" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  // Another team's drawer offers no membership controls to this manager.
  await page.getByRole("tab", { name: /Teams/ }).click();
  await page.getByRole("row", { name: /US AI engineers/ }).dblclick();
  const team = page.getByRole("dialog", { name: "Team" });
  await expect(
    team.getByRole("heading", { name: "US AI engineers" }),
  ).toBeVisible();
  await expect(team.getByLabel(/Add a person to/)).toHaveCount(0);
  await expect(team.getByRole("button", { name: /^Remove / })).toHaveCount(0);
  await expect(team.getByRole("button", { name: "Edit team" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email address").fill("tara.singh@carrieros.example");
  await page.getByLabel("Password", { exact: true }).fill("Welcome#2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Set your password" }),
  ).toBeVisible();
  await page.getByLabel("Temporary password").fill("Welcome#2026");
  await page.getByLabel("New password", { exact: true }).fill("Tara-own#2026");
  await page.getByLabel("Confirm new password").fill("Tara-own#2026");
  await page.getByRole("button", { name: "Save password" }).click();
  await expect(
    page.getByRole("heading", { name: /Good .*, Tara/ }),
  ).toBeVisible();
});

test("the Leadership Lead manages teams and suspends users", async ({
  page,
}) => {
  await signIn(page, "Aarav Shah", "/teams");
  await page.getByRole("button", { name: "New team" }).click();
  const drawer = page.getByRole("dialog", { name: "New team" });
  await drawer.getByLabel("Team name").fill("QA guild");
  await drawer.getByLabel("Purpose").fill("Testing practice");
  await drawer
    .getByLabel("Team lead")
    .selectOption({ label: "Rahul Verma · Engineering Manager" });
  await drawer.getByRole("button", { name: "Create team" }).click();
  const panel = page.getByRole("dialog", { name: "Team" });
  await expect(panel.getByRole("heading", { name: "QA guild" })).toBeVisible();
  await expect(
    panel.getByRole("button", { name: /^Rahul Verma/ }),
  ).toContainText("Team Manager");
  await panel.getByRole("button", { name: "Edit team" }).click();
  await panel.getByLabel("Purpose").fill("Quality practice");
  await panel.getByRole("button", { name: "Save changes" }).click();
  await expect(panel.getByText("Quality practice")).toBeVisible();
  await panel.getByRole("button", { name: "Delete team" }).click();
  await panel.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(panel).not.toBeVisible();

  await page.getByRole("row", { name: /US AI engineers/ }).dblclick();
  await panel.getByRole("button", { name: "Delete team" }).click();
  await panel.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText(
    "2 people have no other team",
  );
  await page.keyboard.press("Escape");

  await page.getByRole("tab", { name: /People/ }).click();
  await page.getByLabel("Team", { exact: true }).selectOption("all");
  await page.getByRole("row", { name: /Sneha Kulkarni/ }).click();
  const person = page.getByRole("dialog", { name: "Person" });
  await person.getByRole("button", { name: "Suspend" }).click();
  await expect(person.getByText("Suspended", { exact: true })).toBeVisible();
  await person.getByRole("button", { name: "Reactivate" }).click();
  await expect(person.getByRole("button", { name: "Suspend" })).toBeVisible();
});

test("teams page selects my team, previews clicked and hovered teams and shows my team's people", async ({
  page,
}) => {
  await signIn(page, "Aarav Shah", "/teams");
  const details = page.getByRole("complementary", { name: "Team details" });
  await expect(details.getByRole("heading", { name: "C-suite" })).toBeVisible();
  await expect(page.getByRole("row", { name: /C-suite/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("row", { name: /US AI engineers/ }).click();
  await expect(
    details.getByRole("heading", { name: "US AI engineers" }),
  ).toBeVisible();
  // Hovering previews another team without changing the selection.
  await page.getByRole("row", { name: /India developers/ }).hover();
  await expect(
    details.getByRole("heading", { name: "India developers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("row", { name: /US AI engineers/ }),
  ).toHaveAttribute("aria-selected", "true");
  // Leaving the table shows the selected team again.
  await page.getByRole("heading", { name: "Teams & members" }).hover();
  await expect(
    details.getByRole("heading", { name: "US AI engineers" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: /People/ }).click();
  await expect(page.getByRole("row", { name: /Meera Iyer/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Sneha Kulkarni/ })).toHaveCount(
    0,
  );
  await page.getByLabel("Team", { exact: true }).selectOption("all");
  await expect(page.getByRole("row", { name: /Sneha Kulkarni/ })).toBeVisible();
});

test("the account menu shows team roles and signs out", async ({ page }) => {
  await signIn(page, "Rahul Verma");
  await expect(page.getByText("Team Manager view")).toBeVisible();
  await page.getByRole("button", { name: "Account" }).click();
  const menu = page.getByRole("menu", { name: "Account" });
  await expect(menu.getByText("India developers")).toBeVisible();
  await expect(menu.getByText("Team Manager", { exact: true })).toBeVisible();
  await expect(
    menu.getByRole("menuitem", { name: "Change password" }),
  ).toBeVisible();
  await menu.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/overview");
  await expect(page).toHaveURL(/\/login\?next=/);
});

test("Ask AI explains when the API key is missing", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText("AI answers are off.")).toBeVisible();
  await page.getByRole("button", { name: "Who leads each team?" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "ANTHROPIC_API_KEY" }),
  ).toBeVisible();
});

test("search palette finds permitted pages and people", async ({ page }) => {
  await signIn(page);
  await page.keyboard.press("Control+k");
  const search = page.getByRole("dialog", { name: "Search" });
  await search
    .getByRole("combobox")
    .or(search.getByRole("textbox"))
    .fill("sneha");
  await search.getByRole("option", { name: /Sneha Kulkarni/ }).click();
  await expect(page).toHaveURL(/\/teams\?view=people&person=/);
  await expect(
    page
      .getByRole("dialog", { name: "Person" })
      .getByRole("heading", { name: "Sneha Kulkarni" }),
  ).toBeVisible();
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
  await signIn(page, "Aarav Shah", "https://untrusted.example");
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
    page.getByText("Rahul Verma leads India developers."),
  ).toBeVisible();
  const view = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "India developers" }) })
    .last();
  await expect(
    view.getByText("Team Manager · Engineering Manager"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save view" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeDisabled();
});
