import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { remarkHandbookLinks } from "../../src/lib/remark-handbook-links.mjs";

let root: string;
let docsRoot: string;
let source: string;
let readme: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "handbook-markdown-"));
  docsRoot = join(root, "src/content/docs");
  source = join(docsRoot, "grade-distribution/longitudinal/2017-2018.md");
  readme = join(root, "README.md");

  await mkdir(dirname(source), { recursive: true });
  await Promise.all(
    [
      source,
      readme,
      join(docsRoot, "grade-distribution/index.md"),
      join(dirname(source), "index.md"),
    ].map((file) => writeFile(file, "")),
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function render(markdown: string, base = "/handbook/") {
  const processor = await createMarkdownProcessor({
    remarkPlugins: [[remarkHandbookLinks, { docsRoot, readme, base }]],
  });
  return (await processor.render(markdown, { fileURL: pathToFileURL(source) })).code;
}

describe("handbook Markdown links", () => {
  it("routes nested indexes and repository home, retaining queries and fragments under the base", async () => {
    const html = await render(
      "[Workbook](index.md?view=all#course-grades) [Archive](../index.md#2025-2026) " +
        "[Home](../../../../../README.md#programs-by-school)",
    );

    expect(html).toContain(
      'href="/handbook/grade-distribution/longitudinal/?view=all#course-grades"',
    );
    expect(html).toContain('href="/handbook/grade-distribution/#2025-2026"');
    expect(html).toContain('href="/handbook/#programs-by-school"');
  });

  it("routes reference-style links and leaves external links, unknown files and footnotes intact", async () => {
    const html = await render(
      "[Report][year] [External](https://source.test/file.md#pages) [Missing](missing.md) [Jump](#grades).[^source]\n\n" +
        "[year]: 2017-2018.md?source=workbook#grades\n\n[^source]: Source note.",
      "/",
    );

    expect(html).toContain(
      'href="/grade-distribution/longitudinal/2017-2018/?source=workbook#grades"',
    );
    expect(html).toContain('href="https://source.test/file.md#pages"');
    expect(html).toContain('href="missing.md"');
    expect(html).toContain('href="#grades"');
    expect(html).toContain('href="#user-content-fn-source"');
  });
});
