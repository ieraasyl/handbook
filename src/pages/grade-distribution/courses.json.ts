import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { parseFragment } from "parse5";
import type { GradeCatalog } from "../../lib/grade-catalog";
import { attribute, elements } from "../../lib/handbook-html";

function termOrder(term: string, academicYear: string) {
  const year = Number(term.match(/\d{4}/)?.[0] ?? academicYear.slice(-4));
  const season = term.startsWith("Fall") ? 3 : term.startsWith("Spring") ? 1 : 2;
  return year * 10 + season;
}

export const GET: APIRoute = async () => {
  const entries = await getCollection("docs");
  const reports = entries.flatMap((entry) => {
    const metadata = entry.data.metadata;
    if (metadata?.kind !== "report" && metadata?.kind !== "longitudinal") return [];
    const term = metadata.kind === "report" ? metadata.term : "";
    const title = metadata.kind === "report" ? `${term}, ${metadata.school}` : entry.data.title;
    return [{ entry, title, order: termOrder(term, metadata.academicYear) }];
  });
  reports.sort((a, b) => b.order - a.order || a.title.localeCompare(b.title));

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const courses = new Map<string, GradeCatalog["courses"][number]>();
  const catalog: GradeCatalog = {
    reports: reports.map(({ entry, title }) => ({
      title,
      href: `${base}/${entry.id}/`,
    })),
    courses: [],
  };

  for (const [reportIndex, { entry }] of reports.entries()) {
    if (!entry.rendered?.html) throw new Error(`Missing rendered grade report: ${entry.id}`);
    const document = parseFragment(entry.rendered.html);
    let rowCount = 0;
    for (const row of elements(document, "tr")) {
      const code = attribute(row, "data-course-code");
      if (!code) continue;
      const header = elements(row, "th").next().value;
      const anchor = header && attribute(header, "id");
      if (!anchor) throw new Error(`Missing anchor for ${code} in ${entry.id}`);

      const key = code.toUpperCase().replace(/\s+/g, " ");
      const course = courses.get(key) ?? { code, titles: [], rows: [] };
      const title = attribute(row, "data-course-title");
      if (title && !course.titles.includes(title)) course.titles.push(title);
      course.rows.push([reportIndex, anchor, attribute(row, "data-course-section") ?? ""]);
      courses.set(key, course);
      rowCount++;
    }
    if (!rowCount) throw new Error(`Missing course rows in ${entry.id}`);
  }

  catalog.courses = [...courses.values()].sort((a, b) => a.code.localeCompare(b.code));
  return Response.json(catalog);
};
