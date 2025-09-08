export function SubTabs(props: {
  tabs: { key: string; label: string }[];
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div class="tabs">
      {props.tabs.map(t => (
        <button
          class="tab-btn"
          role="tab"
          aria-selected={props.active === t.key}
          onClick={() => props.onSelect(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
