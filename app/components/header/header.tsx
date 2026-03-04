'use client';

import styles from './header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useUserStore } from '../../store/useUserStore';
import { useEffect, useState } from 'react';

export default function Header() {
  const { id, nickname, profileImage, isLoggedIn } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const defaultProfile =
    id && id % 2 === 0 ? '/profileImage2.svg' : '/profileImage1.svg';
  const displayImage = profileImage || defaultProfile;

  // 하이드레이션 오류 방지 (클라이언트 마운트 후 렌더링)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div className={styles.headerContainer} />;

  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftSection}>
        <Link href="/">
          <Image
            src="/logo_bg.svg"
            width={116}
            height={44}
            alt="logo Image"
            className={styles.headerLogo}
          />
        </Link>

        <ul className={styles.headerList}>
          <li className={styles.headerLi}>
            <Link href="/sideproject">사이드 프로젝트</Link>
          </li>
          {/* <li className={styles.headerLi}>
            <Link href="/outsourcingProject">외주 프로젝트</Link>
          </li>
          <li className={styles.headerLi}>
            <Link href="/aiChat">기획 AI</Link>
          </li> */}
        </ul>
      </div>

      <div className={styles.rightSection}>
        {isLoggedIn ? (
          <Link href="/mypage" className={styles.profileWrapper}>
            <div className={styles.profileCircle}>
              <Image
                src={displayImage}
                width={32}
                height={32}
                alt="profile"
                className={styles.profileImg}
              />
            </div>
            <span className={styles.nicknameText}>{nickname}님</span>
          </Link>
        ) : (
          <Link href="/login">
            <button className={styles.headerSignupBtn}>로그인</button>
          </Link>
        )}
      </div>
    </div>
  );
}
