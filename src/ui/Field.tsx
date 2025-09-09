// src/ui/Field.tsx
type Props = {
  label: preact.ComponentChildren;
  value?: string;
  onInput?: (v: string) => void;
  type?: string;
  step?: number | 'any';
  min?: number;
  max?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;

  // NEW: forward raw handlers so wrappers like SIField can intercept
  onKeyDown?: (e: KeyboardEvent) => void;
  onPaste?: (e: ClipboardEvent) => void;
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
          onKeyDown={p.onKeyDown as any}
          onPaste={p.onPaste as any}
        />
        {p.suffix && <span class="badge">{p.suffix}</span>}
      </div>
    </label>
  );
}