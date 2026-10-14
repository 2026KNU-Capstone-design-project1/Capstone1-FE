import { useState } from 'react';

const initialForm = {
  name: '', loginId: '', password: '', confirmPassword: '',
  email: '', phone: '', role: 'ADMIN', siteId: '',
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function useSignupForm({ onCheckLoginId, onSignup }) {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [message, setMessage] = useState('');
  const [idCheck, setIdCheck] = useState({ loginId: '', available: false, message: '' });
  const isSiteManager = form.role === 'SITE_MANAGER';

  function updateField(field, value) {
    setForm(previous => ({ ...previous, [field]: field === 'phone' ? formatPhone(value) : value }));
    setMessage('');
    if (field === 'loginId') setIdCheck({ loginId: '', available: false, message: '' });
  }

  function changeRole(role) {
    setForm(previous => ({ ...previous, role, siteId: role === 'ADMIN' ? '' : previous.siteId }));
    setMessage('');
  }

  async function checkLoginId() {
    const loginId = form.loginId.trim();
    if (!loginId) {
      setIdCheck({ loginId: '', available: false, message: '아이디를 입력해 주세요.' });
      return;
    }
    if (loginId.length > 255) {
      setIdCheck({ loginId: '', available: false, message: '아이디는 255자 이하로 입력해 주세요.' });
      return;
    }

    setIsCheckingId(true);
    setIdCheck({ loginId: '', available: false, message: '' });
    try {
      const result = await onCheckLoginId(loginId);
      if (typeof result?.available !== 'boolean') throw new Error('중복 확인 응답 형식이 올바르지 않습니다.');
      setIdCheck({
        loginId,
        available: result.available,
        message: result.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.',
      });
    } catch (error) {
      setIdCheck({ loginId: '', available: false, message: error?.message || '아이디 중복 확인에 실패했습니다. 다시 시도해 주세요.' });
    } finally {
      setIsCheckingId(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (form.password !== form.confirmPassword) return setMessage('비밀번호가 일치하지 않습니다.');
    if (idCheck.loginId !== form.loginId.trim() || !idCheck.available) return setMessage('사용 가능한 아이디인지 중복 확인해 주세요.');
    if (isSiteManager && !form.siteId) return setMessage('담당 현장을 선택해 주세요.');

    setIsSubmitting(true);
    try {
      await onSignup({
        name: form.name.trim(), loginId: form.loginId.trim(), password: form.password,
        email: form.email.trim(), phone: form.phone.replace(/\D/g, ''),
        role: form.role, siteId: isSiteManager ? form.siteId : null,
      });
      setMessage('회원가입이 완료되었습니다. 로그인해 주세요.');
    } catch (error) {
      setMessage(error?.status === 409 ? '이미 사용 중인 아이디입니다.' : '회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, idCheck, isCheckingId, isSiteManager, isSubmitting, message, changeRole, checkLoginId, submit, updateField };
}
