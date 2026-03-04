import styles from './footer.module.css';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoContainer}>
            {/* 실제 로고 이미지 경로로 변경해주세요. 예: /images/your-logo.svg */}
            <Image
              src="/logo.svg"
              alt="CommunitySideFE Logo"
              width={120}
              height={40}
            />
          </div>
          <p className={styles.companyDescription}>
            커뮤니티 사이드 프로젝트를 위한 공간입니다. 함께 성장해요!
          </p>
          <div className={styles.socialLinks}>
            {/* <a href="#" aria-label="Facebook" className={styles.socialIcon}>
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={20}
                height={20}
              />
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialIcon}>
              <Image
                src="/icons/twitter.svg"
                alt="Twitter"
                width={20}
                height={20}
              />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={20}
                height={20}
              />
            </a> */}
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>빠른 링크</h3>
          <ul className={styles.linkList}>
            <li>
              <a href="/sideproject" className={styles.linkItem}>
                프로젝트 찾기
              </a>
            </li>
            {/* <li>
              <a href="#" className={styles.linkItem}>
                팀원 찾기
              </a>
            </li>
            <li>
              <a href="#" className={styles.linkItem}>
                커뮤니티
              </a>
            </li> */}
            <li>
              <a href="#" className={styles.linkItem}>
                문의하기
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          {/* <h3 className={styles.sectionTitle}>회사</h3>
          <ul className={styles.linkList}>
            <li>
              <a href="#" className={styles.linkItem}>
                회사 소개
              </a>
            </li>
            <li>
              <a href="#" className={styles.linkItem}>
                개인정보처리방침
              </a>
            </li>
            <li>
              <a href="#" className={styles.linkItem}>
                이용약관
              </a>
            </li>
          </ul> */}
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} CommunitySideFE. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
