import { pagefindUserConfig } from "virtual:starlight/pagefind-config";
import { courseQuery } from "./course-code";

interface SearchExcerpt {
  url: string;
  title: string;
  excerpt: string;
}

export interface SearchPage extends Omit<SearchExcerpt, "title"> {
  meta: { title?: string };
  sub_results: SearchExcerpt[];
}

export interface SearchResults {
  results: { data(): Promise<SearchPage> }[];
  totalFilters: Record<string, Record<string, number>>;
}

interface Pagefind {
  options(options: typeof pagefindUserConfig & { baseUrl: string }): Promise<void>;
  filters(): Promise<unknown>;
  search(
    term: string,
    options?: { filters: { any: Record<string, string>[] } },
  ): Promise<SearchResults>;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const reportPath = /^(?:\d{4}-\d{4}\/[^/]+|longitudinal\/\d{4}-\d{4})\/?$/;
let pagefind: Promise<Pagefind> | undefined;

export function loadPagefind() {
  return (pagefind ??= (async () => {
    const path = `${base}/pagefind/pagefind.js`;
    const index: Pagefind = await import(/* @vite-ignore */ path);
    await index.options({ ...pagefindUserConfig, baseUrl: import.meta.env.BASE_URL });
    await index.filters();
    return index;
  })().catch((error: unknown) => {
    pagefind = undefined;
    throw error;
  }));
}

export function searchResultUrl(href: string, query: string) {
  const url = new URL(href, location.origin);
  const archive = `${base}/grade-distribution/`;
  const course = courseQuery(query);
  if (
    course &&
    url.origin === location.origin &&
    url.pathname.startsWith(archive) &&
    reportPath.test(url.pathname.slice(archive.length))
  ) {
    url.searchParams.set("course", course.code);
    if (course.section) url.searchParams.set("section", course.section);
  }
  return url.origin === location.origin ? url.pathname + url.search + url.hash : url.href;
}
