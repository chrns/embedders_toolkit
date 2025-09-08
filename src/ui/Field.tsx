type Props = {
  label: string;
  value?: string;
  onInput?: (v: string) => void;
  type?: string;
  step?: number | 'any';
  min?: number;
  max?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
};
export function Field(p: Props) {
  return (
    <label class="field">
      <span class="field-label">{p.label}</span>
      <div class="field-input">
        <input
          type={p.type ?? 'text'}
          value={p.value ?? ''}
          onInput={(e) => p.onInput?.((e.target as HTMLInputElement).value)}
          step={p.step as any}
          min={p.min}
          max={p.max}
          placeholder={p.placeholder}
          disabled={p.disabled}
        />
        {p.suffix && <span class="badge">{p.suffix}</span>}
      </div>
    </label>
  );
}
