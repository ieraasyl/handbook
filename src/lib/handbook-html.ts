import type { DefaultTreeAdapterTypes } from "parse5";

type Node = DefaultTreeAdapterTypes.Node;
type Element = DefaultTreeAdapterTypes.Element;

export function attribute(node: Element, name: string) {
  return node.attrs.find((attr) => attr.name === name)?.value;
}

export function* elements(node: Node, tagName: string): Generator<Element> {
  if ("tagName" in node && node.tagName === tagName) yield node;
  if (!("childNodes" in node)) return;
  for (const child of node.childNodes) yield* elements(child, tagName);
}

export function htmlText(node: Node): string {
  if ("value" in node) return node.value;
  if ("childNodes" in node) return node.childNodes.map(htmlText).join("");
  return "";
}
