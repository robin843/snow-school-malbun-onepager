/** Display only. Never use these values for slots, prices, day selection or payroll. */
export const effectiveTeachingMinutes = (minutes: number): number =>
  minutes === 60 ? 55 : minutes === 120 ? 115 : minutes;

const clock = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const minuteOfDay = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));

/** Only known, distinct daily teaching blocks can establish a total; alternatives cannot. */
export function teachingMinutesForBlocks(raw: unknown): number | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 2) return null;
  const spans: { start: number; end: number }[] = [];
  for (const block of raw) {
    if (!block || !clock(block.start) || !clock(block.end)) return null;
    const start = minuteOfDay(block.start), end = minuteOfDay(block.end);
    if (end - start !== 60 && end - start !== 120) return null;
    spans.push({ start, end });
  }
  spans.sort((a, b) => a.start - b.start);
  if (spans.length === 2 && spans[0].end > spans[1].start) return null;
  return spans.reduce((total, block) => total + effectiveTeachingMinutes(block.end - block.start), 0);
}

/** Only standalone numeric duration metadata is rewritten, never arbitrary Core prose or clocks. */
export function effectiveDurationLabel(label: string, blockTotal: number | null = null): string {
  const match = /^(\d+)\s*(Minuten|Min\.)$/.exec(label.trim());
  return match ? `${blockTotal ?? effectiveTeachingMinutes(Number(match[1]))} ${match[2]}` : label;
}