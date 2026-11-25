import { readFile, readdir } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "parse5";

function inspectHtml(html) {
  const anchors = new Set();
  const links = new Set();
  let canonical;

  function visit(node) {
    if (node.attrs) {
      const attrs = Object.fromEntries(node.attrs.map(({ name, value }) => [name, value]));
      if (attrs.id) anchors.add(attrs.id);
      if (node.tagName === "a" && attrs.name) anchors.add(attrs.name);
      if (node.tagName === "a" || node.tagName === "area") {
        if (attrs.href !== undefined) links.add(attrs.href);
      }
      if (node.tagName === "link" && attrs.rel === "canonical") canonical = attrs.href;
    }
    node.childNodes?.forEach(visit);
  }

  visit(parse(html));
  return { anchors, links, canonical };
}

export async function checkLinks(directory) {
  const root = resolve(directory);
  const paths = (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map(({ parentPath, name }) => relative(root, resolve(parentPath, name)))
    .sort();

  const pages = new Map();
  for (const path of paths) {
    if (path.endsWith(".html")) {
      pages.set(path, inspectHtml(await readFile(resolve(root, path), "utf8")));
    }
  }

  const home = pages.get("index.html");
  if (!home) throw new Error(`Missing generated homepage in ${root}`);
  const site = new URL(home.canonical ?? "https://handbook.invalid/");
  const base = site.pathname.replace(/\/$/, "");
  const assets = new Map();
  const routes = new Map();

  for (const path of paths) {
    const asset = base + "/" + path.split(sep).map(encodeURIComponent).join("/");
    const page = pages.get(path);
    assets.set(asset, page);
    if (!page) continue;

    const route = asset.endsWith("/index.html") ? asset.slice(0, -10) : asset;
    routes.set(route, page);
    if (route.endsWith("/") && route !== "/") assets.set(route.slice(0, -1), page);
  }

  const problems = [];
  for (const [referrer, { links }] of routes) {
    for (const href of links) {
      let target;
      try {
        target = new URL(href, new URL(referrer, site));
      } catch {
        problems.push({ referrer, href, reason: "invalid URL" });
        continue;
      }
      if (target.origin !== site.origin) continue;

      const path = target.pathname;
      if (!assets.has(path) && !routes.has(path)) {
        problems.push({ referrer, href, reason: "missing route" });
        continue;
      }
      const page = routes.get(path) ?? assets.get(path);
      if (!page || !target.hash || target.hash === "#top") continue;

      try {
        if (!page.anchors.has(decodeURIComponent(target.hash.slice(1)))) {
          problems.push({ referrer, href, reason: "missing anchor" });
        }
      } catch {
        problems.push({ referrer, href, reason: "invalid anchor encoding" });
      }
    }
  }

  return { pagesChecked: pages.size, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { pagesChecked, problems } = await checkLinks(process.argv[2] ?? "dist");
  for (const { referrer, href, reason } of problems) {
    console.error(`${referrer} → ${href} (${reason})`);
  }
  console.log(
    `Checked ${pagesChecked} HTML pages. Found ${problems.length} broken internal links.`,
  );
  if (problems.length > 0) process.exitCode = 1;
}
