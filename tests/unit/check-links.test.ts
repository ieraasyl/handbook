import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it } from "vite-plus/test";
import { checkLinks } from "../../scripts/check-links.mjs";

let dist: string;

beforeEach(async () => {
  dist = await mkdtemp(join(tmpdir(), "handbook-links-"));
  await mkdir(join(dist, "archive"));
  await writeFile(
    join(dist, "archive/index.html"),
    '<h2 id="course-grades">Course grades</h2><h3 id="résultats">Résultats</h3>',
  );
});

afterEach(async () => {
  await rm(dist, { recursive: true, force: true });
});

it("accepts generated routes, encoded headings, assets and external links", async () => {
  await writeFile(join(dist, "grades.csv"), "Course");
  await writeFile(
    join(dist, "index.html"),
    `<link rel="canonical" href="https://handbook.example/handbook/">
     <a href="archive/?view=all#course-grades">Report</a>
     <a href="https://handbook.example/handbook/archive/#r%C3%A9sultats">Results</a>
     <a href="grades.csv">Grades</a>
     <a href="https://source.example/missing/#document">Official report</a>`,
  );

  await expect(checkLinks(dist)).resolves.toEqual({ pagesChecked: 2, problems: [] });
});

it("reports the referring page and original href for missing routes and anchors", async () => {
  await writeFile(join(dist, "index.html"), '<a href="/absent/?year=2026">Missing report</a>');
  await writeFile(
    join(dist, "archive/index.html"),
    '<a href="#unpublished">Missing section</a><a href="#%">Bad fragment</a>',
  );

  await expect(checkLinks(dist)).resolves.toEqual({
    pagesChecked: 2,
    problems: [
      { referrer: "/archive/", href: "#unpublished", reason: "missing anchor" },
      { referrer: "/archive/", href: "#%", reason: "invalid anchor encoding" },
      { referrer: "/", href: "/absent/?year=2026", reason: "missing route" },
    ],
  });
});
