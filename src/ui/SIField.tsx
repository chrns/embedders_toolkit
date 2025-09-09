// src/ui/SIField.tsx
import { Field } from './Field';

type Props = {
  label: preact.ComponentChildren;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
};

// Allow only digits, ., +, -, e/E, and SI letters incl. µ and R
const VALID = /^[0-9.+\-eEµTGMKkmunpfR]*$/;
const ALLOWED_KEYS = '0123456789.+-eEµTGMKkmunpfR';

export function SIField({ label, value, setValue, placeholder, suffix, disabled }: Props) {
  // Accept only strings that fully match allowed chars
  function handleInput(v: string) {
    if (VALID.test(v)) setValue(v);
    // else ignore (keep previous value)
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Allow navigation & edit keys
    const nav = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Backspace','Delete','Tab','Home','End'];
    if (nav.includes(e.key)) return;

    // Allow common shortcuts
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && ['a','c','v','x','z','y'].includes(e.key.toLowerCase())) return;

    // IME/composition
    if (e.isComposing || e.key === 'Process') return;

    // Block any other single character not in ALLOWED_KEYS
    if (e.key.length === 1 && !ALLOWED_KEYS.includes(e.key)) {
      e.preventDefault();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    // Keep only allowed chars from the paste
    const filtered = text.split('').filter(ch => VALID.test(ch)).join('');
    if (filtered) setValue(value + filtered);
  }

  return (
    <Field
      label={label}
      value={value}
      onInput={handleInput}
      placeholder={placeholder}
      suffix={suffix}
      disabled={disabled}
      onKeyDown={handleKeyDown as any}
      onPaste={handlePaste as any}
      type="text"
    />
  );
}