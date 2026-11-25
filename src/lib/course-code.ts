const courseCode =
  /\b([a-z]{2,8}(?:\/[a-z]{1,8})*)[\s-]*(\d{3}[a-z]?(?:\.\d+)?)\b(?:[\s:]+(lab|lecture)\b)?/gi;

export function courseCodes(value: string) {
  return [...value.toUpperCase().matchAll(courseCode)].flatMap(([, subjects, number, type]) =>
    subjects.split("/").flatMap((subject) => {
      const code = `${subject} ${number}`;
      return type ? [code, `${code} ${type}`] : [code];
    }),
  );
}

export function courseQuery(value: string) {
  const matches = [...value.toUpperCase().matchAll(courseCode)];
  if (matches.length !== 1) return;
  const [, subject, number, type] = matches[0];
  if (subject.includes("/")) return;
  const code = type ? `${subject} ${number} ${type}` : `${subject} ${number}`;
  const section = /\b(?:section|sec\.?)\s+(\d+)\b/i.exec(value)?.[1];
  return { code, section };
}
