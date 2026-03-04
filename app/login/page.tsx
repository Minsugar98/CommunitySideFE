'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from './login.module.css';
import { postLogin, getUserInfo } from '../api/auth';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-hot-toast';
import Loading from '../components/loading/loading'; // 💡 만들어두신 로딩 컴포넌트 임포트

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 💡 인증 체크 상태

  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const userId = useUserStore((state) => state.id);

  useEffect(() => {
    // 유저 정보 유무에 따른 리다이렉트 처리
    if (userId) {
      router.push('/');
    } else {
      setIsCheckingAuth(false);
    }
  }, [userId, router]);

  // 💡 로딩 중일 때 만들어두신 Loading 컴포넌트 반환
  if (isCheckingAuth || userId) {
    return <Loading />;
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const loadingToast = toast.loading('로그인 중...');
    try {
      const loginRes = await postLogin({ email, password });

      if (loginRes.success) {
        const userRes = await getUserInfo();
        if (userRes.success && userRes.data) {
          setUserInfo(
            userRes.data.user.id,
            userRes.data.user.nickname,
            userRes.data.user.profileImage,
          );

          toast.success(`${userRes.data.user.nickname}님, 반갑습니다!`, {
            id: loadingToast,
          });
          router.push('/');
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.message || '로그인에 실패했습니다.';
      toast.error(message, { id: loadingToast });
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Image
        src="/logo_bg.svg"
        alt="CommunitySideFE Logo"
        width={200}
        height={100}
        priority
      />

      <h2 className={styles.title}>로그인</h2>

      <form className={styles.formContainer} onSubmit={handleLogin}>
        <div className={styles.inputWrapper}>
          <p className={styles.labelText}>이메일</p>
          <input
            className={styles.inputField}
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputWrapper}>
          <p className={styles.labelText}>비밀번호</p>
          <div className={styles.relativeContainer}>
            <input
              className={styles.inputField}
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.passIconBtn}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.loginBtn}>
          로그인
        </button>
      </form>

      <div className={styles.helperLinks}>
        <Link href="/find-password" className={styles.linkText}>
          비밀번호를 잊으셨나요?
        </Link>
        <span className={styles.divider}>|</span>
        <Link href="/signup" className={styles.linkText}>
          회원가입
        </Link>
      </div>
    </div>
  );
}