import { Link, useNavigate } from 'react-router-dom';
import SignupForm from './features/auth/signup/SignupForm';
import AuthLayout from './layouts/AuthLayout';

export default function SignupPage({
  onCheckLoginId,
  onSignup,
  loginHref = '/login',
}) {
  const navigate = useNavigate();

  function handleSignupSuccess() {
    navigate(loginHref, { replace: true, state: { signupComplete: true } });
  }

  return (
    <AuthLayout ariaLabel="회원가입">
      <header>
        <h2 className="text-[34px] leading-tight font-bold tracking-[-1px]">회원가입</h2>
      </header>
      <SignupForm onCheckLoginId={onCheckLoginId} onSignup={onSignup} onSuccess={handleSignupSuccess} />
      <div className="mt-3 text-center text-[14px] text-auth-muted">
        이미 계정이 있으신가요?
        <Link className="ml-2 font-semibold text-app-accent underline underline-offset-4" to={loginHref}>로그인</Link>
      </div>
    </AuthLayout>
  );
}
