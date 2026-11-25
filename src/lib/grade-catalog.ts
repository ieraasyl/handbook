import { courseCodes } from "./course-code";

export type GradeCatalog = {
  reports: { title: string; href: string }[];
  courses: { code: string; titles: string[]; rows: GradeRow[] }[];
};

export type GradeRow = [report: number, anchor: string, section: string];

export function findArchiveCourses(courses: GradeCatalog["courses"], query: string) {
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();
  const words = normalize(query);
  const compact = words.replace(/[\s-]+/g, "");
  if (!compact) return [];

  return courses
    .map((course, index) => {
      const codes = [course.code, ...courseCodes(course.code)].map((code) =>
        normalize(code).replace(/[\s-]+/g, ""),
      );
      const matchedTitle = course.titles.find((title) => normalize(title).includes(words));
      const rank = codes.includes(compact)
        ? 0
        : codes.some((code) => code.startsWith(compact))
          ? 1
          : matchedTitle || codes.some((code) => code.includes(compact))
            ? 2
            : -1;
      return { course, index, rank, title: matchedTitle ?? course.titles[0] };
    })
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 12);
}
