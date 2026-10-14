import AppIcon from '../../../components/AppIcon';
import PasswordField, { signupInputClass, signupLabelClass } from './PasswordField';
import useSignupForm from './useSignupForm';

const roles = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'SITE_MANAGER', label: '현장 담당자' },
];

export default function SignupForm({ onCheckLoginId, onSignup, sites }) {
  const signup = useSignupForm({ onCheckLoginId, onSignup });
  const { form, idCheck, isCheckingId, isSiteManager, isSubmitting } = signup;
  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword
    ? '비밀번호가 일치하지 않습니다.'
    : '';

  return (
    <form className="mt-6 space-y-[15px]" onSubmit={signup.submit}>
      <div>
        <label className={signupLabelClass} htmlFor="signup-name">이름</label>
        <input
          id="signup-name"
          className={signupInputClass}
          type="text"
          autoComplete="name"
          placeholder="이름을 입력하세요"
          value={form.name}
          onChange={event => signup.updateField('name', event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className={signupLabelClass} htmlFor="signup-id">아이디</label>
        <div className="flex gap-3">
          <input
            id="signup-id"
            className={`${signupInputClass} flex-1`}
            type="text"
            autoComplete="username"
            placeholder="아이디를 입력하세요"
            value={form.loginId}
            onChange={event => signup.updateField('loginId', event.target.value)}
            maxLength={255}
            required
            disabled={isSubmitting || isCheckingId}
          />
          <button
            type="button"
            onClick={signup.checkLoginId}
            disabled={isSubmitting || isCheckingId}
            className="h-[43px] shrink-0 rounded-md border border-auth-button-border bg-auth-button px-4 text-[14px] font-semibold text-app-text transition-colors hover:bg-auth-button-hover disabled:cursor-wait disabled:opacity-60"
          >
            {isCheckingId ? '확인 중…' : '중복 확인'}
          </button>
        </div>
        {idCheck.message && (
          <p
            className={`mt-1 text-[12px] ${idCheck.loginId && idCheck.available ? 'text-auth-success' : 'text-auth-error'}`}
            role="status"
          >
            {idCheck.message}
          </p>
        )}
      </div>

      <PasswordField
        id="signup-password"
        label="비밀번호"
        value={form.password}
        onChange={value => signup.updateField('password', value)}
        placeholder="비밀번호를 입력하세요"
        disabled={isSubmitting}
      />

      <PasswordField
        id="signup-confirm"
        label="비밀번호 확인"
        value={form.confirmPassword}
        onChange={value => signup.updateField('confirmPassword', value)}
        placeholder="비밀번호를 다시 입력하세요"
        disabled={isSubmitting}
        error={passwordMismatch}
      />

      <div>
        <label className={signupLabelClass} htmlFor="signup-email">이메일</label>
        <input
          id="signup-email"
          className={signupInputClass}
          type="email"
          autoComplete="email"
          placeholder="example@company.com"
          value={form.email}
          onChange={event => signup.updateField('email', event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className={signupLabelClass} htmlFor="signup-phone">전화번호</label>
        <input
          id="signup-phone"
          className={signupInputClass}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={form.phone}
          onChange={event => signup.updateField('phone', event.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center gap-5 pt-0.5">
        <span className="shrink-0 text-[14px] font-semibold">역할</span>
        <div
          className="flex h-[40px] min-w-0 flex-1 overflow-hidden rounded-md border border-app-border-soft"
          role="group"
          aria-label="사용자 역할"
        >
          {roles.map(item => {
            const selected = form.role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => signup.changeRole(item.value)}
                disabled={isSubmitting}
                aria-pressed={selected}
                className={`flex-1 text-[14px] font-semibold transition-colors ${selected ? 'rounded-md border border-app-accent bg-app-accent/15 text-app-accent' : 'text-app-text hover:bg-app-hover'}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {isSiteManager && (
        <div>
          <label className={signupLabelClass} htmlFor="signup-site">담당 현장</label>
          <div className="relative">
            <AppIcon
              name="search"
              className="pointer-events-none absolute top-1/2 left-4 h-[19px] w-[19px] -translate-y-1/2 text-auth-muted"
            />
            <select
              id="signup-site"
              className={`${signupInputClass} appearance-none pr-11 pl-12 ${form.siteId ? '' : 'text-auth-placeholder'}`}
              value={form.siteId}
              onChange={event => signup.updateField('siteId', event.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="" className="bg-auth-input-solid">담당 현장을 선택하세요</option>
              {sites.map(site => (
                <option key={site.id} value={site.id} className="bg-auth-input-solid text-app-text">
                  {site.name}
                </option>
              ))}
            </select>
            <AppIcon
              name="chevronDown"
              className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-auth-muted"
            />
          </div>
          <p className="mt-1 text-[12px] text-auth-muted">소속된 현장을 선택해 주세요.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-[43px] w-full rounded-md bg-auth-submit text-[15px] font-bold text-auth-submit-text transition-colors hover:bg-auth-submit-hover disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? '가입 처리 중…' : '회원가입'}
      </button>

      {signup.message && (
        <p className="text-center text-[13px] leading-relaxed text-auth-message" role="status">
          {signup.message}
        </p>
      )}
    </form>
  );
}
