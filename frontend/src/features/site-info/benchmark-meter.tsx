/**
 * One labelled horizontal bar on a benchmark row.
 *
 * `share` is 0–1 and is only meaningful against the other models in the same category. A `null`
 * share renders an empty hatched track for "not published" so a missing value never reads as zero.
 */
export function BenchmarkMeter({
  label,
  value,
  caption,
  share,
  tone,
}: {
  label: string;
  value: string;
  caption?: string;
  share: number | null;
  tone: "recommendation" | "price";
}) {
  const percent = share === null ? 0 : Math.round(share * 100);
  return (
    <div className={`bench-meter bench-meter-${tone}${share === null ? " is-missing" : ""}`}>
      <div className="bench-meter-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div
        className="bench-meter-track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={caption ? `${value}, ${caption}` : value}
      >
        {share === null ? null : <span style={{ width: `${percent}%` }} />}
      </div>
      {caption ? <small>{caption}</small> : null}
    </div>
  );
}
