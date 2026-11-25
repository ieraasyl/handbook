function textContent(node = {}) {
  return node.type === "text" ? node.value : (node.children ?? []).map(textContent).join("");
}

function element(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}

function text(value) {
  return { type: "text", value };
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatProgramIntro(tree) {
  const firstHeading = tree.children.findIndex((node) => node.tagName === "h2");
  if (firstHeading < 0) return;
  const intro = tree.children.slice(0, firstHeading);
  const intake = intro.find(
    (node) => node.tagName === "p" && /^\d{4} intake handbook\./.test(textContent(node)),
  );
  if (!intake) return;
  intake.properties.className = [
    "flex",
    "flex-wrap",
    "items-baseline",
    "gap-x-4",
    "gap-y-1",
    "text-muted-foreground",
  ];

  const existing = intro.find(
    (node) => node.tagName === "p" && node.children?.[0]?.properties?.href?.startsWith("#"),
  );
  const links = existing?.children.filter((node) => node.tagName === "a") ?? [];
  const headings = tree.children.filter((node) => /^h[23]$/.test(node.tagName ?? ""));
  const plan = headings.find((node) => /^recommended course plan$/i.test(textContent(node)));
  const firstYear = headings.find((node) => /^year 1$/i.test(textContent(node)));
  const transfer = headings.find((node) => /\btransfer\b/i.test(textContent(node)));
  const priority = [plan ?? firstYear, transfer].flatMap((heading) => {
    if (!heading) return [];
    const label = textContent(heading);
    const href = `#${heading.properties.id ?? slug(label)}`;
    return (
      links.find((link) => link.properties.href === href) ?? element("a", { href }, [text(label)])
    );
  });
  const ordered = [...new Set([...priority, ...links])];
  if (!ordered.length) return;

  const nav = element(
    "nav",
    { className: ["border-y", "border-border", "py-1.5"], ariaLabel: "Program shortcuts" },
    [
      element(
        "ul",
        { className: ["m-0", "flex", "list-none", "flex-wrap", "gap-x-4", "p-0"] },
        ordered.map((link) => {
          link.properties.className = [
            "inline-flex",
            "min-h-11",
            "items-center",
            "py-1.5",
            "font-medium",
          ];
          return element("li", { className: ["m-0"] }, [link]);
        }),
      ),
    ],
  );
  tree.children = tree.children.filter((node) => node !== existing);
  tree.children.splice(tree.children.indexOf(intake) + 1, 0, nav);
}

function labelCourseRows(table, headers, courseIds) {
  const sectionIndex = headers.findIndex((header) => textContent(header) === "Section");
  if (sectionIndex !== -1) {
    headers[0].children.push(
      element("span", { className: ["block", "text-xs", "font-normal", "text-muted-foreground"] }, [
        text("Section"),
      ]),
    );
    const headingRow = table.children
      .find((node) => node.tagName === "thead")
      .children.find((node) => node.tagName === "tr");
    headingRow.children = headingRow.children.filter((node) => node !== headers[sectionIndex]);
  }

  const body = table.children.find((node) => node.tagName === "tbody");
  for (const row of body?.children ?? []) {
    if (row.tagName !== "tr") continue;
    const cells = row.children.filter((node) => node.tagName === "td");
    const course = cells[0];
    const code = textContent(course).trim();
    const sectionCell = cells[sectionIndex];
    const section = sectionCell ? textContent(sectionCell).trim() : "";
    row.children = row.children.filter((node) => node !== sectionCell);

    course.tagName = "th";
    course.properties.scope = "row";
    course.children = [
      element(
        "span",
        { className: ["block", "max-w-[min(9rem,34vi)]", "wrap-anywhere", "whitespace-normal"] },
        course.children,
      ),
    ];
    if (section) {
      course.children.push(
        element(
          "span",
          { className: ["block", "text-xs", "font-normal", "text-muted-foreground"] },
          [text(`Section ${section}`)],
        ),
      );
    }
    if (!code || /^overall$/i.test(code)) continue;

    const base = `course-${slug(code)}${section ? `-section-${slug(section)}` : ""}`;
    const count = (courseIds.get(base) ?? 0) + 1;
    courseIds.set(base, count);
    course.properties.id = count === 1 ? base : `${base}-${count}`;
    course.properties.tabIndex = -1;
    row.properties["data-course-code"] = code;
    row.properties["data-course-section"] = section;
    if (textContent(headers[1]) === "Title") {
      row.properties["data-course-title"] = textContent(cells[1]).trim();
    }
  }
}

export function rehypeHandbookTables() {
  return (tree, file) => {
    const isArchive = /[/\\]grade-distribution[/\\]/.test(file.path ?? "");
    const isCalendar = /[/\\]academic-calendar\.md$/.test(file.path ?? "");
    const isProgram = /[/\\]programs[/\\]/.test(file.path ?? "");
    const courseIds = new Map();
    let section;
    let tableCount = 0;

    function wrapTables(parent) {
      parent.children = parent.children.map((node) => {
        if (/^h[1-6]$/.test(node.tagName ?? "")) {
          section = textContent(node);
          tableCount = 0;
        }
        if (node.tagName !== "table") {
          if (node.children) wrapTables(node);
          return node;
        }

        const headers =
          node.children
            .find((child) => child.tagName === "thead")
            ?.children.find((child) => child.tagName === "tr")
            ?.children.filter((child) => child.tagName === "th") ?? [];
        for (const header of headers) header.properties.scope = "col";

        const classes = ["handbook-table"];
        const columnNames = headers.map(textContent);
        const hasCourseColumn = /^course( code)?$/i.test(columnNames[0]?.trim());
        if (isCalendar && columnNames[0] === "Event") {
          classes.push("handbook-calendar-table");
          for (const header of headers.slice(1)) header.properties.id = slug(textContent(header));
          const body = node.children.find((child) => child.tagName === "tbody");
          for (const row of body?.children ?? []) {
            const event = row.children?.find((cell) => cell.tagName === "td");
            if (!event) continue;
            event.tagName = "th";
            event.properties.scope = "row";
          }
        }
        if (isArchive) {
          classes.push("handbook-archive-table");
          if (hasCourseColumn) {
            classes.push("handbook-course-table");
            if (columnNames[1] === "Title") classes.push("handbook-table-with-titles");
            labelCourseRows(node, headers, courseIds);
          }
        }
        if (columnNames[3] === "Weighted points") classes.push("handbook-gpa-example");

        tableCount++;
        const label = section ?? (hasCourseColumn ? "Course grades" : "Table");
        return element("div", { className: ["handbook-table-frame"] }, [
          element(
            "p",
            {
              className: [
                "handbook-table-hint",
                "mt-0",
                "mb-2",
                "text-sm",
                "text-muted-foreground",
                "print:hidden",
              ],
              hidden: true,
              "data-pagefind-ignore": true,
            },
            [text("Scroll sideways for more columns.")],
          ),
          element(
            "div",
            {
              className: classes,
              tabIndex: 0,
              role: "region",
              ariaLabel: tableCount === 1 ? label : `${label}, table ${tableCount}`,
              ...(isProgram && hasCourseColumn ? { "data-pagefind-weight": "3" } : {}),
            },
            [node],
          ),
        ]);
      });
    }

    if (isProgram) formatProgramIntro(tree);
    wrapTables(tree);
  };
}
