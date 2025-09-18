import { TOLERANCE_OPTIONS } from '@/lib/units';
import { JSX } from 'preact/jsx-runtime';

type FixableInputProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;                 // ← ваш суффикс, например "A" или "Ω"
  isFixed?: boolean;               // активно ли это поле
  onToggleFix?: () => void;        // обработчик кнопки fix!
  disabled?: boolean;
  tolerance?: number;
  onToleranceChange?: (n: number) => void;
};

export function FixableInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  tolerance,
  onToleranceChange,
  isFixed = true,
  onToggleFix,
  disabled = false,
}: FixableInputProps): JSX.Element {
  const inputDisabled = disabled || !isFixed;

  return (
    <label class="flex items-center gap-4 w-full">
      {label && <span class="text-right w-5 sm:w-24 shrink-0">{label}</span>}

      <div class="fixable-input min-w-0 flex-1">
        {/* Поле ввода */}
        <input
          class=""
          value={value}
          placeholder={placeholder}
          onInput={(e) => onChange((e.target as HTMLInputElement).value)}
          disabled={inputDisabled}
        />

        {/* Суффикс между полем и кнопкой */}
        {suffix && (
          <span
            aria-hidden="true"
            class="suffix"
          >
            {suffix}
          </span>
        )}

        {/* Погрешность */}
        {tolerance !== undefined && (
          <select
            value={tolerance}
            onChange={(e) => { const v = Number((e.currentTarget as HTMLSelectElement).value); if (!Number.isNaN(v)) onToleranceChange?.(v); }}
          >
            {TOLERANCE_OPTIONS.map(o => (
              <option value={o.percentage}>{o.percentage} %</option>
            ))}
          </select>
        )}

        {/* Кнопка fix! (опционально) */}
        {onToggleFix && (
          <button
            type="button"
            class={isFixed ? 'active' : ''}
            aria-pressed={isFixed}
            onClick={onToggleFix}
          >
            fix!
          </button>
        )}
      </div>
    </label>
  );
}