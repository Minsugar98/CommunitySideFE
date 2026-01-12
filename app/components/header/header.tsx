import styles from './header.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      <Image
        src="/logo.svg"
        width={116}
        height={44}
        alt="logo Image"
        className={styles.headerLogo}
      />
      <ul className={styles.headerList}>
        <li className={styles.headerLi}>
          <Link href="/sideProject">사이드 프로젝트</Link>
        </li>
        <li className={styles.headerLi}>
          <Link href="/outsourcingProject">외주 프로젝트</Link>
        </li>
        <li className={styles.headerLi}>
          <Link href="/aiChat">기획 AI</Link> {/* "/aichat"과 같은 페이지 */}
        </li>
      </ul>
      <button className={styles.headerSignupBtn}>회원가입</button>
    </div>
  );
}
