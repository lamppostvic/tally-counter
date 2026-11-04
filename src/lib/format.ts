// Game dates are entered as calendar days (stored at UTC midnight), so format in UTC.
export function formatGameDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
