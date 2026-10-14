import { useState } from 'react';
import AppIcon from '../../../components/AppIcon';

export const signupInputClass =
  'h-[43px] w-full min-w-0 rounded-md border border-auth-input ' +
  'bg-auth-input-bg px-5 text-[14px] text-app-text ' +
  'outline-none transition-colors placeholder:text-auth-placeholder ' +
  'focus:border-app-accent disabled:cursor-not-allowed disabled:opacity-60';

export const signupLabelClass =
  'mb-1.5 block text-[14px] font-semibold text-app-text';

export default function PasswordField({ id, label, value, onChange, placeholder, disabled, error }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className={signupLabelClass} htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} className={`${signupInputClass} pr-12`} type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} required disabled={disabled} />
        <button type="button" className="absolute inset-y-0 right-3 flex items-center justify-center text-auth-icon hover:text-white" aria-label={visible ? `${label} 숨기기` : `${label} 표시`} aria-pressed={visible} onClick={() => setVisible(current => !current)}>
          <AppIcon name={visible ? 'eyeOff' : 'eye'} className="h-5 w-5" />
        </button>
      </div>
      {error && <p className="mt-1 text-[12px] text-auth-error">{error}</p>}
    </div>
  );
}
