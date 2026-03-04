'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './myprojects.module.css';

interface MyProjectsProps {
  activeProjects: any[];
  pendingProjects: any[];
}

export default function MyProjects({ activeProjects, pendingProjects }: MyProjectsProps) {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    router.push(`/project/${id}`);
  };

  return (
    <div className={styles.container}>
      {/* 1. 진행 중인 프로젝트 섹션 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>🔥 진행 중인 프로젝트</h3>
          <span className={styles.countBadge}>{activeProjects.length}</span>
        </div>
        
        {activeProjects.length > 0 ? (
          <div className={styles.grid}>
            {activeProjects.map((project) => (
              <div key={project.id} className={styles.projectCard} onClick={() => handleCardClick(project.id)}>
                <div className={styles.cardTop}>
                  <div className={styles.statusDot}></div>
                  <span className={styles.category}>진행중</span>
                </div>
                <h4 className={styles.projectTitle}>{project.title}</h4>
                <p className={styles.projectSummary}>{project.summary}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.leader}>@{project.leader?.nickname || '리더'}</span>
                  <button className={styles.miniBtn}>바로이동</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>📂</span>
            <p>참여 중인 프로젝트가 없습니다.</p>
            <button className={styles.createBtn} onClick={() => router.push('/sideproject')}>프로젝트 찾기</button>
          </div>
        )}
      </section>

      {/* 2. 신청 현황 섹션 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>⏳ 신청 현황</h3>
          <span className={styles.countBadge}>{pendingProjects.length}</span>
        </div>

        {pendingProjects.length > 0 ? (
          <div className={styles.applicationList}>
            {pendingProjects.map((app) => (
              <div key={app.id} className={styles.appItem}>
                <div className={styles.appInfo}>
                  <h4 className={styles.appTitle}>{app.title}</h4>
                  <p className={styles.appDate}>{new Date(app.createdAt).toLocaleDateString()} 신청</p>
                </div>
                <div className={styles.appStatus}>
                  <span className={styles.statusBadge}>승인 대기 중</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <p>신청 대기 중인 프로젝트가 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}