import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FactoryIllustration, Icon } from './AuthVisuals';

const SAVED_ID_KEY = 'virnect.savedLoginId';

function readSavedId() {
  try { return localStorage.getItem(SAVED_ID_KEY) || ''; }
  catch { return ''; }
}

function Brand() {
  return (
    <div className="flex items-center gap-4" aria-label="VIRNECT Industrial Safety">
      <svg className="h-12 w-12 shrink-0 text-[#FF8418]" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">
        <path d="M8 1h32l-6 9H14ZM1 11h13l10 19 10-19h13L29 47H19Z" />
      </svg>
      <div><div className="text-[29px] leading-none font-extrabold tracking-[-1px]">VIRNECT</div><div className="mt-1.5 text-[14px] tracking-[.6px] text-[#AFBDCB]">INDUSTRIAL SAFETY</div></div>
    </div>
  );
}


export default function LoginPage({ onLogin, signupHref = '/signup', forgotPasswordHref = '/forgot-password' }) {
  const [savedId] = useState(readSavedId);
  const [loginId, setLoginId] = useState(savedId);
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(Boolean(savedId));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    const normalizedId = loginId.trim();
    if (!normalizedId || !password) {
      setMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }
    if (!onLogin) {
      setMessage('백엔드 연결 필요');
      return;
    }
    setIsSubmitting(true);
    try {
      await onLogin({ loginId: normalizedId, password });
      try {
        if (rememberId) localStorage.setItem(SAVED_ID_KEY, normalizedId);
        else localStorage.removeItem(SAVED_ID_KEY);
      } catch {}
    } catch {
      setMessage('로그인에 실패했습니다. 입력 정보와 네트워크 연결을 확인해 주세요.');
    } finally { setIsSubmitting(false); }
  }

  function changeRememberId(checked) {
    setRememberId(checked);
    if (!checked) {
      try { localStorage.removeItem(SAVED_ID_KEY); } catch { /* optional storage */ }
    }
  }

  return (
    <main className="login-layout min-h-screen bg-[#081720] text-[#E7EDF5]">
      <section className="brand-panel relative isolate overflow-visible" aria-labelledby="brand-title">
        <div className="brand-logo absolute z-20"><Brand /></div>
        <div className="brand-copy relative z-10">
          <h1 id="brand-title" className="font-bold tracking-[-1.8px] leading-[1.3]">
            <span className="block">더 안전한 산업현장을 위한</span>
            <span className="block text-[#FF8418]">스마트 안전관리 시스템</span>
          </h1>
          <p className="mt-5 text-[#B6C3D0] leading-[1.55] tracking-[-.4px]">AI 기반 위험 탐지부터 현장 모니터링까지,<br />하나의 플랫폼에서 관리하세요.</p>
        </div>
        <FactoryIllustration />
      </section>

      <section className="form-panel flex items-center justify-center rounded-xl" aria-label="로그인">
        <div className="auth-card w-full rounded-xl border border-[#173848]">
          <header>
            <h2 className="text-[38px] leading-tight font-bold tracking-[-1px] sm:text-[42px]">로그인</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-[#AFBDCB] sm:text-[19px]">VIRNECT Industrial Safety에 로그인하세요.</p>
          </header>
          <form className="mt-9" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-[18px] font-semibold" htmlFor="login-id">아이디</label>
              <div className="input-shell flex h-[59px] items-center gap-5 rounded-lg border border-[#31566B] bg-[#0D202C]/65 px-5 text-[#94A9B9]">
                <Icon name="user" className="shrink-0" />
                <input id="login-id" name="username" className="min-w-0 flex-1 bg-transparent text-[18px] text-[#E7EDF5] outline-none placeholder:text-[#879DAC]" type="text" autoComplete="username" placeholder="아이디를 입력하세요" value={loginId} onChange={e => setLoginId(e.target.value)} required disabled={isSubmitting} />
              </div>
            </div>
            <div className="mt-6">
              <label className="mb-2 block text-[18px] font-semibold" htmlFor="login-password">비밀번호</label>
              <div className="input-shell flex h-[59px] items-center gap-5 rounded-lg border border-[#31566B] bg-[#0D202C]/65 px-5 text-[#94A9B9]">
                <Icon name="lock" className="shrink-0" />
                <input id="login-password" name="password" className="min-w-0 flex-1 bg-transparent text-[18px] text-[#E7EDF5] outline-none placeholder:text-[#879DAC]" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="비밀번호를 입력하세요" value={password} onChange={e => setPassword(e.target.value)} required disabled={isSubmitting} />
                <button className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded hover:text-white focus-visible:outline-2 focus-visible:outline-[#FF8418]" type="button" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}><Icon name={showPassword ? 'eye' : 'eyeOff'} /></button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[17px]">
              <label className="flex cursor-pointer items-center gap-3 text-[#AFBDCB]">
                <input className="remember-checkbox" type="checkbox" checked={rememberId} onChange={e => changeRememberId(e.target.checked)} disabled={isSubmitting} />아이디 저장
              </label>
              <a className="text-[#F28C38] hover:underline" href={forgotPasswordHref}>비밀번호 찾기</a>
            </div>
            <button className="mt-10 h-[66px] w-full cursor-pointer rounded-lg bg-[#E87817] text-[24px] font-bold text-[#081720] transition-colors hover:bg-[#FF952E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF8418] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? '로그인 중…' : '로그인'}</button>
            {message && <p className="mt-4 text-sm leading-relaxed text-[#FFAA74]" role="status">{message}</p>}
          </form>
          <div className="mt-8 flex items-center gap-5 text-[16px]">
            <div className="h-px flex-1 bg-[#173848]" />
            <p className="text-center text-[#AFBDCB]">계정이 없으신가요? <Link className="ml-2 font-semibold text-[#F28C38] underline underline-offset-4" to={signupHref}>회원가입</Link></p>
            <div className="h-px flex-1 bg-[#173848]" />
          </div>
        </div>
      </section>
    </main>
  );
}
