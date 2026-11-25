const sourceLinkLabels = new Set([
  "Canva source",
  "Source archive",
  "Source PDF",
  "Source report",
  "Source workbook",
]);

export function rehypeHandbookSources() {
  return (tree) => {
    for (const paragraph of tree.children) {
      if (paragraph.tagName !== "p") continue;
      const hasSourceLink = paragraph.children.some(
        (child) =>
          child.tagName === "a" &&
          child.children.length === 1 &&
          sourceLinkLabels.has(child.children[0].value),
      );
      const isPdfPageNote =
        paragraph.children.length === 1 &&
        /^PDF pages? \d+(?: to \d+)?\.$/.test(paragraph.children[0].value ?? "");
      if (hasSourceLink || isPdfPageNote) {
        (paragraph.properties.className ??= []).push("handbook-source-note");
      }
    }
  };
}
