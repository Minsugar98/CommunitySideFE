'use client';

import styles from './signUp.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { postSignUp } from '../api/user';
import { useUserStore } from '../store/useUserStore';
import { postLogin, getUserInfo } from '../api/auth';
import Loading from '../components/loading/loading'; // 💡 로딩 컴포넌트 추가

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 💡 인증 체크 상태

  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const userId = useUserStore((state) => state.id); // 💡 전역 상태의 유저 ID 가져오기

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // --- 💡 로그인 여부 체크 로직 추가 ---
  useEffect(() => {
    if (userId) {
      router.replace('/');
      toast.error('잘못된 접근 입니다.'); // 필요 시 주석 해제
    } else {
      setIsCheckingAuth(false); // 로그인 안 되어 있으면 로딩 해제
    }
  }, [userId, router]);

  // --- 💡 로딩 중 UI 반환 ---
  if (isCheckingAuth || userId) {
    return <Loading />;
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // --- 유효성 검사 로직 (동일) ---
  const validateEmail = (email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return '이메일을 입력해주세요.';
    if (!emailRegex.test(email)) return '올바른 이메일 형식이 아닙니다.';
    return '';
  };

  const validatePassword = (password: string): string => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
    if (!specialCharRegex.test(password))
      return '비밀번호는 특수문자를 포함해야 합니다.';
    return '';
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ): string => {
    if (!confirmPassword) return '비밀번호 확인을 입력해주세요.';
    if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  // --- 핸들러 로직 (동일) ---
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordError(validatePassword(val));
    setConfirmPasswordError(validateConfirmPassword(val, confirmPassword));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setConfirmPasswordError(validateConfirmPassword(password, val));
  };

  useEffect(() => {
    const emailValid = validateEmail(email) === '';
    const passwordValid = validatePassword(password) === '';
    const confirmPasswordValid =
      validateConfirmPassword(password, confirmPassword) === '';
    setIsFormValid(
      emailValid &&
        passwordValid &&
        confirmPasswordValid &&
        email !== '' &&
        password !== '',
    );
  }, [email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(password, confirmPassword);

    if (emailErr || passwordErr || confirmPasswordErr) {
      setEmailError(emailErr);
      setPasswordError(passwordErr);
      setConfirmPasswordError(confirmPasswordErr);
      toast.error('입력 정보를 확인해주세요.');
      return;
    }
    
    const processToast = toast.loading('계정 생성 및 로그인 중...');

    try {
      const signUpRes = await postSignUp({ email, password });

      if (signUpRes.success) {
        const loginRes = await postLogin({ email, password });

        if (loginRes.success) {
          const userRes = await getUserInfo();

          if (userRes.success && userRes.data) {
            setUserInfo(
              userRes.data.user.id,
              userRes.data.user.nickname,
              userRes.data.user.profileImage,
            );
            toast.success(
              `${userRes.data.user.nickname}님, 환영합니다!`,
              { id: processToast }
            );
            router.push('/');
          }
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || '처리 중 오류가 발생했습니다.';
      toast.error(msg, { id: processToast });
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Image src="/logo_bg.svg" alt="Logo" width={200} height={100} priority />
      <form className={styles.fromContainer} onSubmit={handleSubmit}>
        <p className={styles.fromText}>이메일</p>
        <input
          className={styles.fromInput}
          type="email"
          placeholder="이메일 입력해주세요"
          value={email}
          onChange={handleEmailChange}
          onBlur={() => setEmailError(validateEmail(email))}
        />
        {emailError && <p className={styles.errorMessage}>{emailError}</p>}

        <div className={styles.inputWrapper}>
          <p className={styles.fromText}>비밀번호</p>
          <div className={styles.relativeContainer}>
            <input
              className={styles.fromInput}
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호 입력해주세요."
              value={password}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className={styles.passIconBtn}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {passwordError && (
            <p className={styles.errorMessage}>{passwordError}</p>
          )}
        </div>

        <div className={styles.inputWrapper}>
          <p className={styles.fromText}>비밀번호 확인</p>
          <div className={styles.relativeContainer}>
            <input
              className={styles.fromInput}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호 다시 한번 입력해 주세요."
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() =>
                setConfirmPasswordError(
                  validateConfirmPassword(password, confirmPassword),
                )
              }
            />
            <button
              type="button"
              className={styles.passIconBtn}
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {confirmPasswordError && (
            <p className={styles.errorMessage}>{confirmPasswordError}</p>
          )}
        </div>

        <button
          type="submit"
          className={`${styles.signUpBtn} ${isFormValid ? styles.signUpBtnActive : styles.signUpBtnDisabled}`}
          disabled={!isFormValid}
        >
          회원가입
        </button>
      </form>

      <p>
        이미 회원이신가요?{' '}
        <Link className={styles.linkText} href="/login">
          로그인
        </Link>
      </p>
    </div>
  );
}