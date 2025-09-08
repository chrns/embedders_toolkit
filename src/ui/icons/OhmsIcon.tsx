export default function OhmLawTriangle(props: preact.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 100 90"
      width="72"
      height="72"
      {...props}
    >
      <polygon
        points="50,5 95,85 5,85"
        fill="#1e88e5"
        stroke="#0d385d"
        strokeWidth="3"
        rx="8"
      />
      {/* Dividing lines */}
      <line x1="20" y1="55" x2="80" y2="55" stroke="#0d385d" strokeWidth="2" />
      <line x1="50" y1="55" x2="50" y2="85" stroke="#0d385d" strokeWidth="2" />

      {/* Letters */}
      <text x="50" y="40" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="bold">V</text>
      <text x="30" y="75" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="bold">I</text>
      <text x="70" y="75" textAnchor="middle" fontSize="20" fill="#fff" fontWeight="bold">R</text>
    </svg>
  );
}