'use client';

import React from 'react';
import styles from './memberList.module.css';
import { UserMinus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { patchProjectApplication, patchProjectMemberPosition } from '../../api/project'; // 💡 API 임포트

interface MemberListProps {
  project: any;
  isLeader: boolean;
}

export default function MemberList({ project, isLeader }: MemberListProps) {
  const members = project?.projectApplications || [];
  const projectPositions = project?.position || [];

  // 💡 강퇴 처리 함수
  const handleKickMember = async (userId: number) => {
    if (!confirm('정말로 이 팀원을 강퇴하시겠습니까?')) return;

    try {
      // 💡 기존 엔드포인트를 활용하여 'REJECTED' 상태로 변경 (또는 백엔드 협의 후 'KICKED')
      const res = await patchProjectApplication(Number(project.id), userId, 'REJECTED');

      if (res.success) {
        toast.success('팀원을 성공적으로 추방했습니다.');
        // 💡 페이지를 새로고침하거나 부모로부터 받은 setProject 등을 통해 상태를 업데이트해야 합니다.
        window.location.reload(); 
      } else {
        toast.error(res.message || '추방 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handleChangePosition = async (userId: number, newPosition: string) => {
    try {
      // API 호출 (백엔드에 position 변경 API가 준비되어 있다고 가정)
      const res = await patchProjectMemberPosition(Number(project.id), userId, newPosition);

      if (res.success) {
        toast.success(`역할을 ${newPosition}(으)로 성공적으로 변경했습니다.`);
        // 데이터 새로고침을 위해 페이지 리로드 또는 상태 업데이트
        window.location.reload(); 
      } else {
        toast.error(res.message || '역할 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      toast.error('서버 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>팀원 현황 ({members.length + 1}명)</h3>
        <p className={styles.desc}>팀원들에게 역할을 부여하고 관리할 수 있습니다.</p>
      </div>

      <div className={styles.memberGrid}>
        {/* 리더 카드 */}
        <div className={`${styles.memberCard} ${styles.leaderCard}`}>
          <div className={styles.avatar}>
            {project?.leader?.nickname ? project.leader.nickname[0] : 'L'}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{project?.leader?.nickname}</span>
            <span className={styles.roleBadge}>Leader</span>
          </div>
          <div className={styles.actions}>
            <ShieldCheck className={styles.leaderIcon} size={22} />
          </div>
        </div>

        {/* 팀원 리스트 */}
        {members.map((app: any) => (
          <div key={app.user.id} className={styles.memberCard}>
            <div className={styles.avatar}>
              {app.user.nickname ? app.user.nickname[0] : 'M'}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{app.user.nickname}</span>
              <span className={styles.position}>{app.position || 'Team Member'}</span>
            </div>
            
            {isLeader && (
              <div className={styles.adminActions}>
                <select 
                  className={styles.roleSelect}
                  onChange={(e) => handleChangePosition(app.user.id, e.target.value)}
                  defaultValue={app.position || ""}
                >
                  <option value="" disabled>역할 선택</option>
                  {projectPositions.map((pos: string) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <button 
                  className={styles.kickBtn} 
                  onClick={() => handleKickMember(app.user.id)}
                  title="강퇴하기"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}