import BrandLogo from '../components/BrandLogo';
import { FactoryIllustration } from '../AuthVisuals';

export default function AuthLayout({ ariaLabel, children }) {
  return (
    <main className="login-layout min-h-screen bg-auth-background text-app-text">
      <section className="brand-panel relative isolate overflow-visible" aria-labelledby="brand-title">
        <div className="brand-logo absolute z-20">
          <BrandLogo />
        </div>
        <div className="brand-copy relative z-10">
          <h1 id="brand-title" className="font-bold tracking-[-1.8px] leading-[1.3]">
            <span className="block">더 안전한 산업현장을 위한</span>
            <span className="block text-app-accent">스마트 안전관리 시스템</span>
          </h1>
          <p className="mt-5 leading-[1.55] tracking-[-.4px] text-auth-muted">
            AI 기반 위험 탐지부터 현장 모니터링까지,
            <br />
            하나의 플랫폼에서 관리하세요.
          </p>
        </div>
        <FactoryIllustration />
      </section>

      <section className="form-panel flex items-center justify-center rounded-xl" aria-label={ariaLabel}>
        <div className="auth-card w-full rounded-xl border border-app-border-soft">
          {children}
        </div>
      </section>
    </main>
  );
}
