import { useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { FactoryIllustration } from '../AuthVisuals';
import { getStoredTheme, saveTheme } from '../utils/theme';

export default function AuthLayout({ ariaLabel, children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  function handleThemeChange(nextTheme) {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <main className="login-layout relative min-h-screen bg-auth-background text-app-text transition-colors duration-200">
      <section className="brand-panel relative isolate overflow-visible" aria-labelledby="brand-title">
        <div className="brand-logo absolute z-20">
          <BrandLogo />
        </div>
        <div className="brand-copy relative z-10">
          <h1 id="brand-title" className="font-bold tracking-[-1.8px] leading-[1.3]">
            <span className="block">더 안전한 산업현장을 위한</span>
            <span className="block text-app-accent">스마트 안전관리 시스템</span>
          </h1>
          
        </div>
        <FactoryIllustration theme={theme} />
      </section>

      <section className="form-panel flex items-center justify-center rounded-xl" aria-label={ariaLabel}>
        <div className="auth-card w-full rounded-xl border border-auth-card-border">
          {children}
        </div>
      </section>
      <ThemeToggle
        theme={theme}
        onChange={handleThemeChange}
        compact
        className="fixed right-5 bottom-5 z-50 sm:right-7 sm:bottom-7"
      />
    </main>
  );
}
