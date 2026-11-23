import type { ProbabilityPoint } from "./passProbability.js";

type Props = { points: ProbabilityPoint[] };

const WIDTH = 760;
const HEIGHT = 286;
const LEFT = 54;
const RIGHT = 730;
const TOP = 18;
const BOTTOM = 222;

function xAt(index: number, count: number) {
  return count <= 1 ? (LEFT + RIGHT) / 2 : LEFT + (index / (count - 1)) * (RIGHT - LEFT);
}
function yAt(value: number) {
  return BOTTOM - (value / 100) * (BOTTOM - TOP);
}
function dateLabel(value: number) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PassProbabilityChart({ points }: Props) {
  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : undefined;
  const change = previous ? latest.probability - previous.probability : 0;
  const coords = points.map((point, index) => [xAt(index, points.length), yAt(point.probability)] as const);
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const area = coords.length ? `${line} L ${coords[coords.length - 1][0]} ${BOTTOM} L ${coords[0][0]} ${BOTTOM} Z` : "";
  const labelIndexes = points.length <= 4
    ? points.map((_, index) => index)
    : [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];

  return (
    <section className="dashboard-card pass-probability-card" aria-labelledby="pass-probability-title">
      <div className="pass-probability-heading">
        <div>
          <div className="eyebrow">ASSESSMENT TREND</div>
          <h2 id="pass-probability-title">NCLEX pass probability</h2>
          <p>Estimated from completed CAT and Readiness Exams only</p>
        </div>
        {latest && points.length >= 3 ? <div className="pass-probability-current">
          <strong>{latest.probability}%</strong>
          <span>Current estimate</span>
          {previous && <small className={change >= 0 ? "trend-up" : "trend-down"}>{change > 0 ? "+" : ""}{change} pts since last test</small>}
        </div> : null}
      </div>
      {points.length > 0 && points.length < 3 && <div className="pass-probability-empty"><strong>Building a reliable estimate</strong><span>Complete {3-points.length} more CAT or Readiness Exam{3-points.length===1?"":"s"} before QuickRN displays a probability. The chart will populate as you complete assessments.</span></div>}
      <div className="pass-probability-chart-wrap">            <svg className="pass-probability-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Line chart showing estimated NCLEX pass probability after each completed CAT or Readiness Exam">
              <defs>
                <linearGradient id="passProbabilityFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6558dc" stopOpacity=".19" />
                  <stop offset="100%" stopColor="#6558dc" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 25, 50, 75, 100].map(value => (
                <g key={value}>
                  <line x1={LEFT} x2={RIGHT} y1={yAt(value)} y2={yAt(value)} className="pass-chart-grid" />
                  <text x={LEFT - 12} y={yAt(value) + 4} textAnchor="end" className="pass-chart-axis">{value}%</text>
                </g>
              ))}
              {points.length > 0 && <path d={area} fill="url(#passProbabilityFill)" />}
              {coords.length > 1 && <path d={line} className="pass-chart-line" />}
              {points.map((point, index) => {
                const [x, y] = coords[index];
                return <g key={`${point.completedAtMs}-${index}`}>
                  <circle cx={x} cy={y} r="9" className="pass-chart-point-halo" />
                  <circle cx={x} cy={y} r="4.5" className="pass-chart-point" />
                  <title>{`${point.mode === "cat" ? "CAT" : "Readiness Exam"} · ${dateLabel(point.completedAtMs)} · ${point.scorePercent}% score · ${point.probability}% estimated probability`}</title>
                </g>;
              })}
              {labelIndexes.map(index => (
                <text key={index} x={coords[index][0]} y={BOTTOM + 25} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} className="pass-chart-date">
                  {dateLabel(points[index].completedAtMs)}
                </text>
              ))}
            </svg>
          </div>
          {points.length>0 && <div className="pass-probability-legend">
            <span><i /> Estimated pass probability</span>
            <span>{points.length} completed assessment{points.length === 1 ? "" : "s"}</span>
          </div>
          <div className="pass-probability-disclaimer">QuickRN study estimate based on score trend, consistency, and assessment count. It is not a validated NCLEX outcome prediction or a guarantee of passing.</div>
        </>
      )}
    </section>
  );
}
