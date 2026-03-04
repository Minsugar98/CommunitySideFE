'use client';

import React from 'react';
import styles from './applicantList.module.css';
import { UserCheck, UserX, User } from 'lucide-react';

interface Applicant {
  id: number;
  nickname: string;
  position: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function ApplicantList({ projectId }: { projectId: number }) {
  // TODO: 실제 API 연동 (useEffect로 데이터 Fetch)
  const applicants: Applicant[] = [
    { id: 1, nickname: '코딩왕', position: 'Frontend', status: 'PENDING' },
    { id: 2, nickname: '백엔드마스터', position: 'Backend', status: 'PENDING' },
    { id: 3, nickname: '디자인요정', position: 'Designer', status: 'PENDING' },
  ];

  const handleStatus = async (userId: number, status: 'ACCEPTED' | 'REJECTED') => {
    // 💡 API 호출 예시: await patchStatus(projectId, userId, status)
    const action = status === 'ACCEPTED' ? '승인' : '거절';
    if (confirm(`${userId}번 신청자를 ${action}하시겠습니까?`)) {
      alert(`${action} 처리가 완료되었습니다.`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📩 신규 신청자 <span className={styles.count}>{applicants.length}</span></h3>
      </div>

      <div className={styles.list}>
        {applicants.length > 0 ? (
          applicants.map((user) => (
            <div key={user.id} className={styles.item}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  <User size={16} />
                </div>
                <div className={styles.details}>
                  <span className={styles.nickname}>{user.nickname}</span>
                  <span className={styles.positionTag}>{user.position}</span>
                </div>
              </div>
              
              <div className={styles.actions}>
                <button 
                  className={styles.rejectBtn} 
                  onClick={() => handleStatus(user.id, 'REJECTED')}
                  title="거절"
                >
                  <UserX size={18} />
                </button>
                <button 
                  className={styles.approveBtn} 
                  onClick={() => handleStatus(user.id, 'ACCEPTED')}
                  title="승인"
                >
                  <UserCheck size={18} /> 승인
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>신청자가 없습니다.</div>
        )}
      </div>
    </div>
  );
}