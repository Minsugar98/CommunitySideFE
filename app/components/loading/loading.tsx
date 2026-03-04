import styles from './loading.module.css';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className={styles.container }>
      <div className={styles.content}>
      <Image
        src="/logo.svg"
        alt="CommunitySideFE Logo"
        width={150}
        height={150}
        priority
      />
        <div className={styles.logo}>
          <span className={styles.logoText}>가치 로딩해요</span>
        </div>
        
        {/* 로딩 바 애니메이션 */}
        <div className={styles.loaderBar}></div>
        
        <p className={styles.text}>잠시만 기다려 주세요...</p>
      </div>
    </div>
  );
}