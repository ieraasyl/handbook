import { statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

function routeForFile(file, { base, docsRoot, readme }) {
  const prefix = base.replace(/\/$/, "");
  if (file === readme) return prefix + "/";

  const document = relative(docsRoot, file);
  if (document === ".." || document.startsWith(".." + sep) || isAbsolute(document)) return;
  if (!statSync(file, { throwIfNoEntry: false })?.isFile()) return;

  const segments = document.slice(0, -3).split(sep);
  if (segments.at(-1) === "index") segments.pop();
  return [prefix, ...segments.map(encodeURIComponent), ""].join("/");
}

function rewriteLink(url, source, options) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(url)) return url;
  const [, path, suffix] = /^([^?#]+\.md)([?#].*)?$/i.exec(url) ?? [];
  if (!path) return url;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    return url;
  }

  const route = routeForFile(resolve(dirname(source), decodedPath), options);
  return route ? route + (suffix ?? "") : url;
}

export function remarkHandbookLinks(options) {
  return (tree, file) => {
    if (!file.path) return;

    function visit(node) {
      if (node.type === "link" || node.type === "definition") {
        node.url = rewriteLink(node.url, file.path, options);
      }
      node.children?.forEach(visit);
    }

    visit(tree);
  };
}
