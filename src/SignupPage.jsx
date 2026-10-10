
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FactoryIllustration, Icon } from './AuthVisuals';

function Brand() {
  return (
    <div
      className="flex items-center gap-4"
      aria-label="VIRNECT Industrial Safety"
    >
      <Link to="/" className="flex items-center gap-4">
        <svg
            className="h-12 w-12 shrink-0 text-[#FF8418]"
            viewBox="0 0 48 48"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M8 1h32l-6 9H14ZM1 11h13l10 19 10-19h13L29 47H19Z" />
        </svg>
        <div>
            <div className="text-[29px] leading-none font-extrabold tracking-[-1px]">
            VIRNECT
            </div>
            <div className="mt-1.5 text-[14px] tracking-[.6px] text-[#AFBDCB]">
            INDUSTRIAL SAFETY
            </div>
        </div>
      </Link>
    </div>
  );
}

const inputClass =
  'h-[43px] w-full min-w-0 rounded-md border border-[#31566B] ' +
  'bg-[#0D202C]/65 px-5 text-[14px] text-[#E7EDF5] ' +
  'outline-none transition-colors ' +
  'placeholder:text-[#879DAC] ' +
  'focus:border-[#FF8418] ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const labelClass =
  'mb-1.5 block text-[14px] font-semibold text-[#E7EDF5]';

export default function SignupPage({
  onSignup,
  onCheckLoginId,
  sites = [],
  loginHref = '/login',
}) {
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    siteId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [idChecked, setIdChecked] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [idMessage, setIdMessage] = useState('');

  const isSiteManager = form.role === 'SITE_MANAGER';

  function updateField(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    setMessage('');

    if (field === 'loginId') {
      setIdChecked(false);
      setIdMessage('');
    }
  }

  function changeRole(role) {
    setForm(prev => ({
      ...prev,
      role,
      siteId: role === 'ADMIN' ? '' : prev.siteId,
    }));
    setMessage('');
  }

  async function handleCheckId() {
    const loginId = form.loginId.trim();

    if (!loginId) {
      setIdMessage('아이디를 입력해 주세요.');
      return;
    }

    if (!onCheckLoginId) {
      setIdMessage('중복 확인 API 연결');
      return;
    }

    setIsCheckingId(true);
    setIdChecked(false);
    setIdMessage('');

    try {
      const available = await onCheckLoginId(loginId);

      if (available === true) {
        setIdChecked(true);
        setIdMessage('사용 가능한 아이디입니다.');
      } else {
        setIdMessage('이미 사용 중인 아이디입니다.');
      }
    } catch {
      setIdMessage('중복 확인에 실패했습니다.');
    } finally {
      setIsCheckingId(false);
    }
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (isCheckingId) {
      setMessage('아이디 중복 확인 중입니다.');
      return;
    }

    if (!idChecked) {
      setMessage('아이디 중복 확인을 완료해 주세요.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (isSiteManager && !form.siteId) {
      setMessage('담당 현장을 선택해 주세요.');
      return;
    }

    if (!onSignup) {
      setMessage('회원가입 API 연결');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSignup({
        name: form.name.trim(),
        loginId: form.loginId.trim(),
        password: form.password,
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ''),
        role: form.role,
        siteId: isSiteManager ? form.siteId : null,
      });
    } catch {
      setMessage('회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-layout min-h-screen bg-[#081720] text-[#E7EDF5]">

      <section
        className="brand-panel relative isolate overflow-visible"
        aria-labelledby="brand-title"
      >
        <div className="brand-logo absolute z-20">
          <Brand />
        </div>

        <div className="brand-copy relative z-10">
          <h1
            id="brand-title"
            className="font-bold tracking-[-1.8px] leading-[1.3]"
          >
            <span className="block">더 안전한 산업현장을 위한</span>
            <span className="block text-[#FF8418]">
              스마트 안전관리 시스템
            </span>
          </h1>

          <p className="mt-5 text-[#B6C3D0] leading-[1.55] tracking-[-.4px]">
            AI 기반 위험 탐지부터 현장 모니터링까지,
            <br />
            하나의 플랫폼에서 관리하세요.
          </p>
        </div>

        <FactoryIllustration />
      </section>


      <section
        className="form-panel flex items-center justify-center rounded-xl"
        aria-label="회원가입"
      >
        <div className="auth-card w-full rounded-xl border border-[#173848]">
          <header>
            <h2 className="text-[34px] leading-tight font-bold tracking-[-1px]">
              회원가입
            </h2>
          </header>

          <form
            className="mt-6 space-y-[15px]"
            onSubmit={handleSubmit}
          >

            <div>
              <label className={labelClass} htmlFor="signup-name">
                이름
              </label>
              <input
                id="signup-name"
                className={inputClass}
                type="text"
                autoComplete="name"
                placeholder="이름을 입력하세요"
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="signup-id">
                아이디
              </label>

              <div className="flex gap-3">
                <input
                  id="signup-id"
                  className={`${inputClass} flex-1`}
                  type="text"
                  autoComplete="username"
                  placeholder="아이디를 입력하세요"
                  value={form.loginId}
                  onChange={e => updateField('loginId', e.target.value)}
                  required
                  disabled={isSubmitting || isCheckingId}
                />

                <button
                  type="button"
                  onClick={handleCheckId}
                  disabled={isCheckingId || isSubmitting}
                  className="h-[43px] shrink-0 cursor-pointer rounded-md border border-[#456176] bg-[#172D3C] px-4 text-[14px] font-semibold text-[#E7EDF5] transition-colors hover:bg-[#234052] disabled:cursor-wait disabled:opacity-60"
                >
                  {isCheckingId ? '확인 중' : '중복 확인'}
                </button>
              </div>

              {idMessage && (
                <p
                  className={`mt-1 text-[12px] ${
                    idChecked ? 'text-[#35C77A]' : 'text-[#FF8A8A]'
                  }`}
                  role="status"
                >
                  {idMessage}
                </p>
              )}
            </div>


            <div>
              <label className={labelClass} htmlFor="signup-password">
                비밀번호
              </label>

              <div className="relative">
                <input
                  id="signup-password"
                  className={`${inputClass} pr-12`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  required
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-[#94A9B9] hover:text-white"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  <Icon
                    name={showPassword ? 'eyeOff' : 'eye'}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>


            <div>
              <label className={labelClass} htmlFor="signup-confirm">
                비밀번호 확인
              </label>

              <div className="relative">
                <input
                  id="signup-confirm"
                  className={`${inputClass} pr-12`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={form.confirmPassword}
                  onChange={e =>
                    updateField('confirmPassword', e.target.value)
                  }
                  required
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-[#94A9B9] hover:text-white"
                  aria-label={
                    showConfirmPassword
                      ? '비밀번호 확인 숨기기'
                      : '비밀번호 확인 표시'
                  }
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                  <Icon
                    name={showConfirmPassword ? 'eyeOff' : 'eye'}
                    className="h-5 w-5"
                  />
                </button>
              </div>

              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="mt-1 text-[12px] text-[#FF8A8A]">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
            </div>


            <div>
              <label className={labelClass} htmlFor="signup-email">
                이메일
              </label>
              <input
                id="signup-email"
                className={inputClass}
                type="email"
                autoComplete="email"
                placeholder="example@company.com"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>


            <div>
              <label className={labelClass} htmlFor="signup-phone">
                전화번호
              </label>
              <input
                id="signup-phone"
                className={inputClass}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={e =>
                  updateField('phone', formatPhone(e.target.value))
                }
                required
                disabled={isSubmitting}
              />
            </div>


            <div className="flex items-center gap-5 pt-0.5">
              <span className="shrink-0 text-[14px] font-semibold">
                역할
              </span>

              <div
                className="flex h-[40px] min-w-0 flex-1 overflow-hidden rounded-md border border-[#173848]"
                role="group"
                aria-label="사용자 역할"
              >
                <button
                  type="button"
                  onClick={() => changeRole('ADMIN')}
                  disabled={isSubmitting}
                  aria-pressed={form.role === 'ADMIN'}
                  className={`flex-1 cursor-pointer text-[14px] font-semibold transition-colors ${
                    form.role === 'ADMIN'
                      ? 'border border-[#F28C38] bg-[#F28C38]/15 text-[#F28C38]'
                      : 'text-[#E7EDF5] hover:bg-[#142B39]'
                  }`}
                >
                  관리자
                </button>

                <button
                  type="button"
                  onClick={() => changeRole('SITE_MANAGER')}
                  disabled={isSubmitting}
                  aria-pressed={isSiteManager}
                  className={`flex-1 cursor-pointer text-[14px] font-semibold transition-colors ${
                    isSiteManager
                      ? 'rounded-md border border-[#F28C38] bg-[#F28C38]/15 text-[#F28C38]'
                      : 'text-[#E7EDF5] hover:bg-[#142B39]'
                  }`}
                >
                  현장 담당자
                </button>
              </div>
            </div>

     
            {isSiteManager && (
              <div>
                <label className={labelClass} htmlFor="signup-site">
                  담당 현장
                </label>

                <div className="relative">
                  <Icon
                    name="search"
                    className="pointer-events-none absolute top-1/2 left-4 h-[19px] w-[19px] -translate-y-1/2 text-[#AFBDCB]"
                  />

                  <select
                    id="signup-site"
                    className={`${inputClass} cursor-pointer appearance-none pr-11 pl-12 ${
                      form.siteId ? '' : 'text-[#879DAC]'
                    }`}
                    value={form.siteId}
                    onChange={e => updateField('siteId', e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" className="bg-[#0D202C]">
                      담당 현장을 선택하세요
                    </option>

                    {sites.map(site => (
                      <option
                        key={site.id}
                        value={site.id}
                        className="bg-[#0D202C] text-[#E7EDF5]"
                      >
                        {site.name}
                      </option>
                    ))}
                  </select>

                  <Icon
                    name="chevronDown"
                    className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#AFBDCB]"
                  />
                </div>

                <p className="mt-1 text-[12px] text-[#AFBDCB]">
                  소속된 현장을 선택해 주세요.
                </p>
              </div>
            )}

      
            <button
              type="submit"
              disabled={isSubmitting || isCheckingId}
              className="mt-1 h-[43px] w-full cursor-pointer rounded-md bg-[#E87817] text-[15px] font-bold text-[#081720] transition-colors hover:bg-[#FF952E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF8418] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? '가입 처리 중…' : '회원가입'}
            </button>

            {message && (
              <p
                className="text-center text-[13px] leading-relaxed text-[#FFAA74]"
                role="status"
              >
                {message}
              </p>
            )}
          </form>

  
          <div className="mt-3 text-center text-[14px] text-[#AFBDCB]">
            이미 계정이 있으신가요?
            <Link
              className="ml-2 font-semibold text-[#F28C38] underline underline-offset-4"
              to={loginHref}
            >
              로그인
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
