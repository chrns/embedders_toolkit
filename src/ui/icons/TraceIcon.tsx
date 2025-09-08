export default function TraceIcon(props: preact.ComponentProps<'svg'>) {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="#0d385d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2.5" y="15.5" width="19" height="6" rx="1.5"/>
        <rect x="6" y="9" width="12" height="4" rx="1.5"/>
        <path d="M8 9v-2m8 2v-2" />
        <path d="M9 7h6" />
      </g>
    </svg>
  );
}