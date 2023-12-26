export function formatDateTime(date: Date | string): string {
  const convDate = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: "UTC"
  });
  return formatter.format(convDate);
}
