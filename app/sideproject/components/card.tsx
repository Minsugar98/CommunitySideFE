'use client';
import Image from 'next/image';
import { ProjectItem } from '../../api/types/project.type';
import { useRouter } from 'next/navigation'; // 추가
import styles from './card.module.css';

// 한글 매핑 객체
const MEETING_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인'
};

interface CardProps {
  project: ProjectItem;
  viewMode: 'grid' | 'list';
}

export default function Card({ project, viewMode }: CardProps) {
  const router = useRouter();
  const isRecruiting = project.status;
  const positions = project.position || [];
  const techStacks = project.techStacks || [];

  const defaultProfile = project.leader.id % 2 === 0 ? '/profileImage2.svg' : '/profileImage1.svg';
  const displayImage = project.leader.profileImage || defaultProfile;

  const containerClass = viewMode === 'grid' ? styles.cardGrid : styles.cardList;

  

  const handleCardClick = () => {
    router.push(`/sideproject/${project.id}`);
  };

  return (
    <div className={containerClass} onClick={handleCardClick}>
      <div className={styles.topSection}>
        {/* 칩 영역을 감싸는 그룹 추가 */}
        <div className={styles.statusGroup}>
          <div className={`${styles.statusChip} ${isRecruiting ? styles.active : styles.closed}`}>
            {isRecruiting ? '모집 중' : '모집 완료'}
          </div>
          {/* 진행 방식 텍스트 추가 */}
          <span className={styles.meetingText}>
            • {MEETING_LABELS[project.meetingType] || project.meetingType}
          </span>
        </div>
        <span className={styles.dateText}>{project.endDate} 마감</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        
        <div className={styles.posGroup}>
          {positions.map((pos, index) => (
            <span key={index} className={styles.posTag}>{pos}</span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.techGroup}>
          {techStacks.slice(0, 3).map((tech, index) => (
            <span key={index} className={styles.techChip}>{tech}</span>
          ))}
        </div>
        
        <div className={styles.userInfo}>
          <span className={styles.userName}>{project.leader.nickname}</span>
          <div className={styles.avatar}>
            <Image
              src={displayImage}
              width={32}
              height={32}
              alt="profile"
              className={styles.profileImg}
            />
          </div>
        </div>
      </div>
    </div>
  );
}