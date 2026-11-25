export type CalendarDate = { label: string; display: string; start: string; end: string };
export type CalendarTerm = {
  label: string;
  anchor: string;
  source?: string;
  dates: CalendarDate[];
};

const almatyDate = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short",
  timeZone: "Asia/Almaty",
});

export function calendarToday() {
  return almatyDate.format(new Date());
}

export function upcomingDates(terms: CalendarTerm[], today: string) {
  const term = terms.find(({ dates }) => dates.some(({ end }) => end >= today));
  return {
    term,
    dates: term?.dates.filter(({ end }) => end >= today).slice(0, 3) ?? [],
  };
}
