export function Slider(props: {
  label: string;
  value: number;
  min: number; max: number; step?: number;
  onInput: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div class="slider">
      <span class="small">{props.label}</span>
      <input type="range"
        min={props.min} max={props.max} step={props.step ?? 1}
        value={props.value}
        onInput={(e) => props.onInput(parseFloat((e.target as HTMLInputElement).value))}
      />
      <span class="badge">{props.value} {props.suffix ?? ''}</span>
    </div>
  );
}
