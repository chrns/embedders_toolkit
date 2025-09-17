/****
 * Ohm's Law Circle Wheel SVG React Component
 * Four quadrants: Power (P), Voltage (V), Current (I), Resistance (R)
 * Each quadrant colored and labeled, with formulas in each slice.
 */
export default function OhmsCircle() {
  // Geometry helpers for quadrant arcs
  // Center at (250, 250), radius 240 (outer), 160 (inner for text), 80 (for center letters)
  // Angles: 0° = right, 90° = down, 180° = left, 270° = up
  // Quadrants: P (top), V (right), I (bottom), R (left)
  // Colors: P=gold, V=red, I=green, R=purple
  // Formulas per quadrant (examples):
  // P: P = VI, P = I²R, P = V²/R
  // V: V = IR, V = P/I, V = sqrt(PR)
  // I: I = V/R, I = P/V, I = sqrt(P/R)
  // R: R = V/I, R = V²/P, R = P/I²

  // Helper to describe an SVG arc path (large-arc-flag always 0 for 90deg)
  function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    // Angles in degrees, 0 = right, positive = clockwise
    const rad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    return { x1, y1, x2, y2 };
  }

  // Helper to build a quadrant path (from center, arc outer, back to center)
  function quadrantPath(cx: number, cy: number, r: number, a0: number, a1: number) {
    const { x1, y1, x2, y2 } = arcPath(cx, cy, r, a0, a1);
    return [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 0 1 ${x2} ${y2}`,
      `Z`
    ].join(" ");
  }

  // Quadrant definitions
  const quadrants = [
    {
      label: "P",
      color: "#FFD700", // gold
      start: -45,
      end: 45,
      formulas: [
        { text: "P = VI", angle: 0 },
        { text: "P = I²R", angle: -22 },
        { text: "P = V²/R", angle: 22 }
      ]
    },
    {
      label: "V",
      color: "#FF6666", // red
      start: 45,
      end: 135,
      formulas: [
        { text: "V = IR", angle: 90 },
        { text: "V = P/I", angle: 68 },
        { text: "V = √PR", angle: 112 }
      ]
    },
    {
      label: "I",
      color: "#7ED957", // green
      start: 135,
      end: 225,
      formulas: [
        { text: "I = V/R", angle: 180 },
        { text: "I = P/V", angle: 158 },
        { text: "I = √(P/R)", angle: 202 }
      ]
    },
    {
      label: "R",
      color: "#B266FF", // purple
      start: 225,
      end: 315,
      formulas: [
        { text: "R = V/I", angle: 270 },
        { text: "R = V²/P", angle: 248 },
        { text: "R = P/I²", angle: 292 }
      ]
    }
  ];

  // For placing center letters
  const centerLetterPos = [
    { x: 250, y: 140 }, // P (top)
    { x: 360, y: 250 }, // V (right)
    { x: 250, y: 360 }, // I (bottom)
    { x: 140, y: 250 }  // R (left)
  ];

  // For placing formulas, radius at 200
  function formulaPos(angle: number, r = 200) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 250 + r * Math.cos(rad),
      y: 250 + r * Math.sin(rad)
    };
  }

  return (
    <svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Circle */}
      <circle cx="250" cy="250" r="240" fill="none" stroke="#ccc" strokeWidth="4" />
      {/* Quadrant backgrounds */}
      {quadrants.map((q, i) => (
        <path
          key={q.label}
          d={quadrantPath(250, 250, 240, q.start, q.end)}
          fill={q.color}
          fillOpacity="0.25"
          stroke="none"
        />
      ))}
      {/* Center white circle for separation */}
      <circle cx="250" cy="250" r="80" fill="#fff" stroke="#eee" strokeWidth="2" />
      {/* Center letters */}
      {quadrants.map((q, i) => (
        <text
          key={q.label + "_letter"}
          x={centerLetterPos[i].x}
          y={centerLetterPos[i].y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="48"
          fontWeight="bold"
          fill={q.color}
          stroke="#fff"
          strokeWidth="2"
        >
          {q.label}
        </text>
      ))}
      {/* Formulas in each quadrant */}
      {quadrants.map((q, i) =>
        q.formulas.map((f, j) => {
          const pos = formulaPos(f.angle);
          return (
            <text
              key={q.label + "_formula_" + j}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fill="#222"
              fontWeight="500"
              style={{ userSelect: "none" }}
            >
              {f.text}
            </text>
          );
        })
      )}
      {/* Faint quadrant boundaries */}
      <line x1="250" y1="10" x2="250" y2="490" stroke="#bbb" strokeWidth="2" />
      <line x1="10" y1="250" x2="490" y2="250" stroke="#bbb" strokeWidth="2" />
    </svg>
  );
}