const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function relativeTime(timestamp: number): string {
  const diffSeconds = (timestamp - Date.now()) / 1000;
  const abs = Math.abs(diffSeconds);

  for (const [unit, secondsInUnit] of UNITS) {
    if (abs >= secondsInUnit || unit === "second") {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return "just now";
}
