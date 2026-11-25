import { parseFragment, type DefaultTreeAdapterTypes } from "parse5";
import type { CalendarDate, CalendarTerm } from "./calendar-dates";
import { attribute, elements, htmlText } from "./handbook-html";

const months = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2020, index, 1)),
  ),
);
const dateRange = /^([A-Z][a-z]+) (\d{1,2})(?: to (?:([A-Z][a-z]+) )?(\d{1,2}))?(?:\.|$)/;

function readDate(year: string, label: string, display: string): CalendarDate {
  const [, month, day, endMonth, endDay] = display.match(dateRange) ?? [];
  if (!month) throw new Error(`Unrecognized calendar date: ${display}`);
  const iso = (name: string, day: string) => {
    const number = months.indexOf(name) + 1;
    if (!number) throw new Error(`Unrecognized calendar month: ${name}`);
    return `${year}-${String(number).padStart(2, "0")}-${day.padStart(2, "0")}`;
  };
  return { label, display, start: iso(month, day), end: iso(endMonth ?? month, endDay ?? day) };
}

function readTerms(table: DefaultTreeAdapterTypes.Element, source?: string): CalendarTerm[] {
  const head = elements(table, "thead").next().value;
  const body = elements(table, "tbody").next().value;
  if (!head || !body) return [];

  const rows = [...elements(body, "tr")].map((row) => {
    const event = elements(row, "th").next().value;
    return {
      label: event ? htmlText(event).trim() : "",
      cells: [...elements(row, "td")].map((cell) => htmlText(cell).trim()),
    };
  });
  return [...elements(head, "th")].slice(1).flatMap((heading, index) => {
    const label = htmlText(heading).trim();
    const year = label.match(/^(?:Fall|Spring|Summer) (\d{4})$/)?.[1];
    const anchor = attribute(heading, "id");
    if (!year || !anchor) return [];

    const dates = rows.flatMap(({ label, cells }) => {
      const display = cells[index];
      return label && display && display !== "Not listed" ? [readDate(year, label, display)] : [];
    });
    dates.sort((a, b) => a.start.localeCompare(b.start));
    return [{ label, anchor, source, dates }];
  });
}

export function readCalendar(html: string) {
  const terms: CalendarTerm[] = [];
  let official: string | undefined;
  let source: string | undefined;
  for (const node of parseFragment(html).childNodes) {
    if (!("tagName" in node)) continue;
    if (node.tagName === "h2") {
      source = undefined;
    } else if (node.tagName === "p") {
      for (const link of elements(node, "a")) {
        const href = attribute(link, "href");
        if (href && htmlText(link) === "Official academic calendars") official = href;
        if (href?.endsWith(".pdf")) source = href;
      }
    } else {
      for (const table of elements(node, "table")) terms.push(...readTerms(table, source));
    }
  }

  terms.sort((a, b) => (a.dates[0]?.start ?? "").localeCompare(b.dates[0]?.start ?? ""));
  return { official, terms };
}
