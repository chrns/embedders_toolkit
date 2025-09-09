export function ResultCard(props: { rows: { label: preact.ComponentChildren; value: string }[] }) {
  return (
    <div class="panel result-card">
      {props.rows.map(r => (
        <div class="kpi">
          <span class="small">{r.label}</span>
          <strong>{r.value}</strong>
        </div>
      ))}
    </div>
  );
}
