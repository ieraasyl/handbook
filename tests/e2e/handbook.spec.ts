import { expect, test } from "@playwright/test";

const computerScience = "/programs/computer-science/";
const archive = "/grade-distribution/";
const engineeringReport = archive + "2025-2026/spring-2026-engineering-and-digital-sciences/";

test("links to published programs, guidance, semester reports and workbook years", async ({
  page,
}) => {
  await page.goto("/");
  const toc = page.getByRole("navigation", { name: "On this page", exact: true });
  await expect(toc.getByRole("link", { name: "Academic information" })).toBeVisible();
  await expect(toc.getByRole("link", { name: "Programs by school" })).toBeVisible();
  await toc.getByRole("link", { name: "School of Engineering", exact: true }).click();
  await expect(page).toHaveURL("/#school-of-engineering");

  const content = page.getByRole("main");
  const tasks = content.getByRole("navigation", { name: "Common tasks" });
  await expect(tasks.getByRole("link", { name: "Find my program" })).toHaveAttribute(
    "href",
    "#programs-by-school",
  );
  await expect(tasks.getByRole("link", { name: "Academic dates" })).toHaveAttribute(
    "href",
    "/academic-calendar/",
  );
  await expect(tasks.getByRole("link", { name: "Book advising" })).toHaveAttribute(
    "href",
    "/academic-advising/#appointments",
  );
  await expect(tasks.getByRole("link", { name: "Look up past grades" })).toHaveAttribute(
    "href",
    archive,
  );
  const programs = content.getByRole("region", { name: "Programs by school" });
  await expect(programs.locator('a[href^="/programs/"]')).toHaveCount(22);
  await expect(
    content.getByRole("region", { name: "Academic information" }).getByRole("link"),
  ).toHaveCount(5);

  await programs.getByRole("link", { name: "BSc in Computer Science" }).click();
  await expect(page).toHaveURL(computerScience);
  await expect(content.getByText("2024 intake handbook.", { exact: true })).toBeVisible();
  await expect(content.getByRole("link", { name: "Official handbooks by intake" })).toHaveAttribute(
    "href",
    "https://aao.nu.edu.kz/handbook",
  );
  const shortcuts = content.getByRole("navigation", { name: "Program shortcuts" });
  await expect(shortcuts.getByRole("link").first()).toHaveText("Recommended course plan");
  await expect(shortcuts.getByRole("link", { name: "Transfer requirements" })).toHaveAttribute(
    "href",
    "#transfer-requirements",
  );

  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto(archive);
  await expect(content.locator('a[href^="/grade-distribution/2"]')).toHaveCount(96);
  await content.getByRole("link", { name: "2025-2026", exact: true }).click();
  await expect(page).toHaveURL(`${archive}#2025-2026`);
  const gap = content.getByRole("listitem").filter({
    hasText: "School of Sciences and Humanities. Google Drive returned Page Not Found.",
  });
  await expect(gap).toContainText("Google Drive returned Page Not Found.");
  await expect(gap.getByRole("link", { name: "Original link" })).toHaveAttribute(
    "href",
    "https://drive.google.com/file/d/1Tbe-X5nN_rZFSHZUgfF6Xm1wOgOdZscb/view?usp=sharing",
  );
  await content.getByRole("link", { name: "2011-2012 through 2017-2018 workbook tables" }).click();
  await expect(content.locator('a[href^="/grade-distribution/longitudinal/2"]')).toHaveCount(7);
});

test("serves the handbook 404 page for an unknown URL", async ({ page }) => {
  const response = await page.goto("/missing-handbook-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle page outline" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Return to the handbook home" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("cycles between Auto, Light, and Dark and persists the mode across pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  const root = page.locator("html");
  const body = page.locator("body");
  const tasks = page.getByRole("navigation", { name: "Common tasks" });
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(tasks.getByRole("list")).toHaveCSS("grid-template-columns", /^[\d.]+px [\d.]+px$/);
  const lightBackground = await body.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  const theme = page.getByRole("button", { name: /^Theme is / });
  await expect(theme).toHaveAccessibleName("Theme is Auto. Switch to Light.");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(theme).toHaveAccessibleName("Theme is Auto. Switch to Light.");

  await theme.press("Enter");
  await expect(theme).toHaveAccessibleName("Theme is Light. Switch to Dark.");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(body).toHaveCSS("background-color", lightBackground);

  await theme.press("Space");
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(theme).toHaveAccessibleName("Theme is Dark. Switch to Auto.");
  await expect(theme).toBeFocused();
  await expect(body).not.toHaveCSS("background-color", lightBackground);
  await page.emulateMedia({ colorScheme: "light" });
  await tasks.getByRole("link", { name: "Look up past grades" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(theme).toHaveAccessibleName("Theme is Dark. Switch to Auto.");
  const courseField = page.getByRole("group").filter({
    has: page.getByRole("combobox", { name: "Course code or title" }),
  });
  const darkFieldBackground = await courseField.evaluate(
    (field) => getComputedStyle(field).backgroundColor,
  );

  await theme.click();
  await expect(theme).toHaveAccessibleName("Theme is Auto. Switch to Light.");
  await expect(body).toHaveCSS("background-color", lightBackground);
  await expect(courseField).not.toHaveCSS("background-color", darkFieldBackground);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(theme).toHaveAccessibleName("Theme is Auto. Switch to Light.");
});

test("finds programs, policy terms and CSCI 151 in the production Pagefind index", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const search = page.getByRole("dialog", { name: "Search" });
  const input = search
    .getByRole("search", { name: "Search" })
    .getByRole("searchbox", { name: "Search the handbook" });
  await expect(input).toBeFocused();
  const program = search.locator(`a[href="${computerScience}"]`);
  const results = search.getByRole("list", { name: "Search results" });
  const status = search.getByRole("status");
  const resultsHeight = () => status.evaluate((element) => element.parentElement!.offsetHeight);
  expect(await resultsHeight()).toBe(0);

  await input.fill("Nursing");
  await input.press("Enter");
  await expect(results.getByRole("heading", { level: 3 }).first()).toHaveText("BSc in Nursing");
  await expect(search.getByRole("checkbox", { name: /Academic guidance/ })).toBeAttached();
  await expect(search.getByRole("checkbox", { name: /Grade reports/ })).toBeAttached();
  const programsFilter = search.getByRole("checkbox", { name: /^Programs \(\d+\)$/ });
  await programsFilter.click();
  await expect(results.getByRole("heading", { level: 3 })).toHaveCount(1);
  await programsFilter.click();

  await input.fill("Computer Science");
  await expect(program).toHaveText("BSc in Computer Science");

  await input.fill("semester GPA");
  await expect(search.locator('a[href="/grades-and-gpa/"]')).toHaveText("Grades and GPA");
  expect(await resultsHeight()).toBeGreaterThan(0);

  await input.clear();
  await expect(status).toBeEmpty();
  await expect(results).toBeHidden();
  expect(await resultsHeight()).toBe(0);

  await input.fill("CSCI 151");
  await expect(program).toHaveText("BSc in Computer Science");
  await expect(
    search.getByRole("link", { name: /School of Engineering and Digital Sciences \(.+\)/ }).first(),
  ).toBeVisible();

  await input.fill("CSCI 151 Spring 2026 section 1");
  const report = search.getByRole("link", {
    name: "School of Engineering and Digital Sciences (Spring 2026)",
  });
  await expect(report).toHaveAttribute("href", `${engineeringReport}?course=CSCI+151&section=1`);
  await report.click();
  await expect(page).toHaveURL(`${engineeringReport}#course-csci-151-section-1`);
  await expect(page.locator("#course-csci-151-section-1")).toBeFocused();
});

test("uses the Starwind drawer and page contents on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const openNav = page.getByRole("button", { name: "Toggle navigation" });
  await openNav.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Main", exact: true });
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(openNav).toBeFocused();

  await openNav.press("Enter");
  const theme = drawer.getByRole("button", { name: /^Theme is / });
  await theme.click();
  await expect(theme).toHaveAccessibleName("Theme is Light. Switch to Dark.");
  await theme.click();
  await expect(drawer).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(theme).toHaveAccessibleName("Theme is Dark. Switch to Auto.");
  await drawer
    .getByRole("button", { name: "School of Computing and Artificial Intelligence" })
    .click();
  await drawer.getByRole("link", { name: "BSc in Computer Science" }).click();
  await expect(page).toHaveURL(computerScience);

  const contents = page.getByRole("navigation", { name: "On this page", exact: true });
  const contentsTrigger = contents.getByRole("button", { name: "On this page" });
  await contentsTrigger.press("Enter");
  await contents.getByRole("link", { name: "Recommended course plan" }).click();
  await expect(page).toHaveURL(`${computerScience}#recommended-course-plan`);
  await expect(contentsTrigger).toHaveAttribute("aria-expanded", "false");
});

test("remembers the collapsed desktop sidebar across pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  await expect(nav).toBeVisible();
  const toggleBounds = (await toggle.boundingBox())!;
  const navBounds = (await nav.boundingBox())!;
  expect(toggleBounds.x).toBeGreaterThanOrEqual(navBounds.x);
  expect(toggleBounds.x + toggleBounds.width).toBeLessThanOrEqual(navBounds.x + navBounds.width);
  await toggle.click();
  await expect(nav).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  // Pause client initialization to check the layout the reader sees first.
  const scripts = /\/_astro\/[^/]+\.js$/;
  await page.route(scripts, (route) => route.abort());
  await page.reload();
  await expect(nav).toBeHidden();
  await expect(page.locator('[data-slot="sidebar-gap"]')).toHaveCSS("width", "0px");

  await page.getByRole("link", { name: "Academic dates" }).click();
  await expect(nav).toBeHidden();
  await expect(page.locator('[data-slot="sidebar-gap"]')).toHaveCSS("width", "0px");
  await page.unroute(scripts);
  await page.reload();
  await toggle.press("Enter");
  await expect(nav.getByRole("link", { name: "Academic calendars" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("restores expanded sidebar groups and scroll before client initialization", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 450 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  const computing = nav.getByRole("button", {
    name: "School of Computing and Artificial Intelligence",
  });
  const program = nav.getByRole("link", { name: "BSc in Computer Science" });
  const scroller = page.locator('[data-sw-sidebar] [data-slot="sidebar-content"]');
  await nav.getByRole("button", { name: "School of Sciences and Humanities" }).click();
  await nav.getByRole("button", { name: "School of Engineering", exact: true }).click();
  await computing.click();
  await expect(program).toBeVisible();
  await program.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  const scrollTop = await scroller.evaluate((element) => element.scrollTop);
  expect(scrollTop).toBeGreaterThan(0);

  await page.route(/\/_astro\/[^/]+\.js$/, (route) => route.abort());
  await page.reload();
  await expect(computing).toHaveAttribute("aria-expanded", "true");
  await expect(program).toBeVisible();
  expect(await scroller.evaluate((element) => element.scrollTop)).toBe(scrollTop);

  await program.click();
  await expect(page).toHaveURL(computerScience);
  await expect(program).toHaveAttribute("aria-current", "page");
  expect(await scroller.evaluate((element) => element.scrollTop)).toBe(scrollTop);
});

test("remembers explicitly closed groups that contain the current page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(computerScience);
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  const computing = nav.getByRole("button", {
    name: "School of Computing and Artificial Intelligence",
  });
  await expect(computing).toHaveAttribute("aria-expanded", "true");
  await computing.click();
  await page.reload();
  await expect(computing).toHaveAttribute("aria-expanded", "false");
  await computing.click();
  await expect(nav.getByRole("link", { name: "BSc in Computer Science" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("remembers the collapsed desktop page outline without hiding the mobile contents", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle page outline" });
  const outline = page.locator("#page-outline");
  const main = page.getByRole("main");
  await expect(toggle).toHaveAttribute("aria-controls", "page-outline");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(outline.getByRole("link", { name: "Academic information" })).toBeVisible();
  const toggleBounds = (await toggle.boundingBox())!;
  const outlineBounds = (await outline.boundingBox())!;
  expect(toggleBounds.x).toBeGreaterThanOrEqual(outlineBounds.x);
  expect(toggleBounds.x + toggleBounds.width).toBeLessThanOrEqual(
    outlineBounds.x + outlineBounds.width,
  );
  const mainBounds = (await main.boundingBox())!;

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(outline).toBeHidden();
  expect((await main.boundingBox())!.width).toBeGreaterThan(mainBounds.width);

  await main.getByRole("link", { name: "Academic dates" }).click();
  await expect(page).toHaveURL("/academic-calendar/");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(outline).toBeHidden();

  await page.setViewportSize({ width: 390, height: 780 });
  await expect(toggle).toBeHidden();
  const contentsTrigger = outline.getByRole("button", { name: "On this page" });
  await contentsTrigger.press("Enter");
  await expect(contentsTrigger).toHaveAttribute("aria-expanded", "true");

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(outline).toBeHidden();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(outline).toBeVisible();
});

test("includes a breadcrumb back to the report's archive year", async ({ page }) => {
  await page.goto(engineeringReport);
  const breadcrumbs = page.getByRole("navigation", { name: "breadcrumb" });
  await expect(breadcrumbs.getByRole("link", { name: "Grade archive" })).toHaveAttribute(
    "href",
    archive,
  );
  await breadcrumbs.getByRole("link", { name: "2025-2026" }).click();
  await expect(page).toHaveURL(`${archive}#2025-2026`);
  await expect(page.getByRole("heading", { name: "2025-2026", exact: true })).toBeInViewport();
});

for (const width of [320, 390]) {
  test(`keeps the engineering report readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 780 });
    await page.goto(engineeringReport);
    const content = page.getByRole("main");
    const tableRegion = content.getByRole("region", { name: "Computer Science", exact: true });
    const table = tableRegion.getByRole("table");
    const columnHeader = table.getByRole("columnheader", { name: "Course Section", exact: true });
    const courseCode = table.getByRole("rowheader", { name: "CSCI 151 Section 1", exact: true });

    await expect(table).toBeVisible();
    await expect(columnHeader).toHaveAttribute("scope", "col");
    await expect(courseCode).toBeVisible();
    await expect(tableRegion).toHaveAccessibleDescription("Scroll sideways for more columns.");

    const lookup = content
      .getByRole("search", { name: "Find a course in this report" })
      .getByRole("searchbox", { name: "Find a course in this report" });
    await expect(lookup).toHaveAttribute("autocomplete", "off");
    await lookup.fill("csci151");
    await lookup.press("Enter");
    await expect(page).toHaveURL(engineeringReport);
    await expect(content.getByRole("status")).toHaveText("2 matching rows.");
    await content.getByRole("link", { name: /CSCI 151 .*Section 1/ }).click();
    await expect(page).toHaveURL(`${engineeringReport}#course-csci-151-section-1`);
    await expect(courseCode).toBeInViewport();

    const initialLeft = await courseCode.evaluate((cell) => cell.getBoundingClientRect().left);
    await tableRegion.focus();
    await expect(tableRegion).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBeGreaterThan(0);

    await tableRegion.evaluate((region) => (region.scrollLeft = region.scrollWidth));
    const lastHeader = table.getByRole("columnheader", {
      name: "Letter and administrative grades",
    });
    expect(
      await lastHeader.evaluate((cell) => cell.getBoundingClientRect().right),
    ).toBeLessThanOrEqual(width);

    const scrolledLeft = await courseCode.evaluate((cell) => cell.getBoundingClientRect().left);
    expect(Math.abs(scrolledLeft - initialLeft)).toBeLessThan(1);
    const finalCount = table
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "CSCI 151 Section 1", exact: true }) })
      .getByRole("cell")
      .last();
    await expect(finalCount).toHaveText("42");
    const textBounds = await finalCount.evaluate((cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const { left, right, top } = range.getBoundingClientRect();
      return { left, right, top };
    });
    const stickyColumn = (await courseCode.boundingBox())!;
    const stickyHeader = (await columnHeader.boundingBox())!;
    expect(textBounds.left).toBeGreaterThan(stickyColumn.x + stickyColumn.width);
    expect(textBounds.right).toBeLessThanOrEqual(width);
    expect(textBounds.top).toBeGreaterThan(stickyHeader.y + stickyHeader.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);

    const source = content.getByRole("link", { name: "Source report" });
    await source.scrollIntoViewIfNeeded();
    await expect(source).toBeInViewport();
    await expect(source).toHaveAttribute(
      "href",
      "https://drive.google.com/file/d/1x03RfeBg2n0Sw4ySFuZja2x-M0lvIDGX/view?usp=drive_link",
    );
  });
}

test("shows calendar dates and the GPA example without horizontal scrolling on a narrow phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/academic-calendar/#summer-2027");
  const current = page.getByRole("region", { name: "2026 to 2027" });
  await expect(current.getByRole("columnheader")).toHaveText([
    "Event",
    "Fall 2026",
    "Spring 2027",
    "Summer 2027",
  ]);
  await expect(current.locator(":target")).toHaveText("Summer 2027");
  await expect(current.getByRole("row", { name: /^Final exams/ }).getByRole("cell")).toHaveText([
    "November 30 to December 10",
    "April 26 to May 6",
    "July 22 to 23",
  ]);

  const previous = page.getByRole("region", { name: "2024 to 2025" });
  await expect(previous.getByText("April 28 to May 10. No exams May 1, 7, or 9.")).toBeVisible();
  for (const calendar of [current, previous]) {
    expect(await calendar.evaluate((region) => region.scrollWidth)).toBe(
      await calendar.evaluate((region) => region.clientWidth),
    );
  }

  await page.goto("/grades-and-gpa/#semester-gpa");
  const example = page.getByRole("region", { name: "Semester GPA" });
  await expect(example.getByRole("columnheader", { name: "Weighted points" })).toBeVisible();
  expect(await example.evaluate((region) => region.scrollWidth)).toBe(
    await example.evaluate((region) => region.clientWidth),
  );
});

test("finds a historical grade row from the homepage on a narrow phone using the keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Search", exact: true }).getByText("Search"),
  ).toBeVisible();
  await page.getByRole("link", { name: "Look up past grades" }).click();
  await expect(page.getByRole("link", { name: "Browse by year" })).toBeVisible();

  const input = page
    .getByRole("search", { name: "Find past grades" })
    .getByRole("combobox", { name: "Course code or title" });
  await expect(input).toHaveAttribute("type", "search");
  await expect(input).toHaveAttribute("autocomplete", "off");
  await input.fill("csci151");
  await expect(page.getByRole("option").first()).toContainText("CSCI 151");
  await expect
    .poll(async () => {
      const popup = await page.getByRole("listbox").boundingBox();
      return popup !== null && popup.x >= 0 && popup.x + popup.width <= 320;
    })
    .toBe(true);
  await input.press("ArrowDown");
  const highlighted = page.getByRole("listbox").getByRole("option", { name: /^CSCI 151/ });
  await expect(highlighted).toHaveAttribute("data-highlighted", "");
  await expect(highlighted).toHaveCSS("outline-style", "solid");
  await expect(highlighted).toHaveCSS("outline-width", "2px");
  await input.press("Enter");

  const results = page.getByRole("region", { name: "Reports for CSCI 151" });
  await expect(results.getByRole("heading", { level: 4 }).first()).toHaveText(
    "Spring 2026, School of Engineering and Digital Sciences",
  );
  const section = results.getByRole("link", {
    name: "Section 1, CSCI 151, Spring 2026, School of Engineering and Digital Sciences",
  });
  const address = `${engineeringReport}#course-csci-151-section-1`;
  await expect(section).toHaveAttribute("href", address);
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Clear course search" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(section).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(address);
  await expect(page.locator("#course-csci-151-section-1:target")).toBeInViewport();
  await page.reload();
  const row = page.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "CSCI 151 Section 1", exact: true }),
  });
  await expect(row.getByRole("cell").last()).toHaveText("42");
});

test("erasing a selected course clears its reports and allows selecting it again", async ({
  page,
}) => {
  await page.goto(archive);
  const input = page.getByRole("combobox", { name: "Course code or title" });
  const option = page.getByRole("listbox").getByRole("option", { name: /^CSCI 151/ });
  const results = page.getByRole("region", { name: "Reports for CSCI 151" });

  await input.fill("csci151");
  await option.click();
  await expect(results).toBeVisible();

  await input.press("ControlOrMeta+a");
  await input.press("Backspace");
  await expect(input).toHaveValue("");
  await expect(results).toBeHidden();
  await expect(page.getByRole("main").getByRole("status")).toBeEmpty();

  await input.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Browse by year" })).toBeFocused();
  await expect(input).toHaveValue("");
  await input.fill("csci151");
  await option.click();
  await expect(results).toBeVisible();
});

test("updates upcoming dates at midnight in Almaty", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-27T18:58:00Z") });
  await page.goto("/academic-calendar/");
  const upcoming = page.getByRole("region", { name: "Upcoming academic dates" });
  await expect(upcoming.getByRole("heading", { name: "Fall 2026" })).toBeVisible();
  await expect(upcoming.getByText("Last day of classes")).toBeVisible();
  await expect(upcoming.getByText("November 27", { exact: true })).toBeVisible();
  await expect(upcoming.getByRole("link", { name: "Full term calendar" })).toHaveAttribute(
    "href",
    "#fall-2026",
  );
  await expect(upcoming.getByRole("link", { name: "Registrar’s calendar" })).toHaveAttribute(
    "href",
    /registrar\.nu\.edu\.kz\/sites\/default\/files\/.+\.pdf$/,
  );

  await page.clock.fastForward(3 * 60 * 1000);
  await expect(upcoming.getByText("Last day of classes")).toHaveCount(0);
  await expect(upcoming.getByText("Final exams")).toBeVisible();
});
