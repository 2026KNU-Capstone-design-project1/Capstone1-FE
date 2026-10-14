import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppIcon from './components/AppIcon';
import AuthLayout from './layouts/AuthLayout';

const SAVED_ID_KEY = 'virnect.savedLoginId';

function readSavedId() {
  try { return localStorage.getItem(SAVED_ID_KEY) || ''; }
  catch { return ''; }
}

export default function LoginPage({ onLogin, signupHref = '/signup', forgotPasswordHref = '/forgot-password', successHref = '/dashboard' }) {
  const navigate = useNavigate();
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
      navigate(successHref, { replace: true });
    } catch (error) {
      setMessage(error?.status === 401 ? '아이디 또는 비밀번호가 올바르지 않습니다.' : '로그인에 실패했습니다. 네트워크 연결을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeRememberId(checked) {
    setRememberId(checked);
    if (!checked) {
      try { localStorage.removeItem(SAVED_ID_KEY); } catch { /* optional storage */ }
    }
  }

  return (
    <AuthLayout ariaLabel="로그인">
      <header>
        <h2 className="text-[38px] leading-tight font-bold tracking-[-1px] sm:text-[42px]">로그인</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-auth-muted sm:text-[19px]">VIRNECT Industrial Safety에 로그인하세요.</p>
      </header>

      <form className="mt-9" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-[18px] font-semibold" htmlFor="login-id">아이디</label>
          <div className="input-shell flex h-[59px] items-center gap-5 rounded-lg border border-auth-input bg-auth-input-bg px-5 text-auth-icon">
            <AppIcon name="user" className="h-6 w-6 shrink-0" strokeWidth={1.5} />
            <input id="login-id" name="username" className="min-w-0 flex-1 bg-transparent text-[18px] text-app-text outline-none placeholder:text-auth-placeholder" type="text" autoComplete="username" placeholder="아이디를 입력하세요" value={loginId} onChange={event => setLoginId(event.target.value)} required disabled={isSubmitting} />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-[18px] font-semibold" htmlFor="login-password">비밀번호</label>
          <div className="input-shell flex h-[59px] items-center gap-5 rounded-lg border border-auth-input bg-auth-input-bg px-5 text-auth-icon">
            <AppIcon name="lock" className="h-6 w-6 shrink-0" strokeWidth={1.5} />
            <input id="login-password" name="password" className="min-w-0 flex-1 bg-transparent text-[18px] text-app-text outline-none placeholder:text-auth-placeholder" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="비밀번호를 입력하세요" value={password} onChange={event => setPassword(event.target.value)} required disabled={isSubmitting} />
            <button className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded hover:text-white" type="button" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}>
              <AppIcon name={showPassword ? 'eye' : 'eyeOff'} className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[17px]">
          <label className="flex cursor-pointer items-center gap-3 text-auth-muted">
            <input className="remember-checkbox" type="checkbox" checked={rememberId} onChange={event => changeRememberId(event.target.checked)} disabled={isSubmitting} />
            아이디 저장
          </label>
          <a className="text-app-accent hover:underline" href={forgotPasswordHref}>비밀번호 찾기</a>
        </div>

        <button className="mt-10 h-[66px] w-full rounded-lg bg-auth-submit text-[24px] font-bold text-auth-submit-text transition-colors hover:bg-auth-submit-hover disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중…' : '로그인'}
        </button>
        {message && <p className="mt-4 text-sm leading-relaxed text-auth-message" role="status">{message}</p>}
      </form>

      <div className="mt-8 flex items-center gap-5 text-[16px]">
        <div className="h-px flex-1 bg-app-border-soft" />
        <p className="text-center text-auth-muted">계정이 없으신가요? <Link className="ml-2 font-semibold text-app-accent underline underline-offset-4" to={signupHref}>회원가입</Link></p>
        <div className="h-px flex-1 bg-app-border-soft" />
      </div>
    </AuthLayout>
  );
}
