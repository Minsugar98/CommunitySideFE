'use client';

import React, { useMemo } from 'react';
import styles from './leftSideBar.module.css';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Settings,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeftSideBarProps {
  projectId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  project: any; // 💡 프로젝트 정보 추가
  events: any[]; // 💡 진행률 계산을 위한 전체 일정 추가
  isLeader: boolean; // 💡 Props 추가
}

export default function LeftSideBar({
  projectId,
  activeTab,
  setActiveTab,
  project,
  events,
  isLeader,
}: LeftSideBarProps) {
  const router = useRouter();

  // 💡 실시간 진행률 계산 (대시보드와 로직 통일)
  const progress = useMemo(() => {
    if (!events || events.length === 0) return 0;
    const completed = events.filter(
      (e) => (e.status || e.extendedProps?.status) === 'DONE',
    ).length;
    return Math.round((completed / events.length) * 100);
  }, [events]);

  const filteredMenuItems = useMemo(() => {
    const items = [
      {
        id: 'dashboard',
        label: '대시보드',
        icon: <LayoutDashboard size={20} />,
      },
      { id: 'calendar', label: '일정 관리', icon: <Calendar size={20} /> },
      { id: 'chat', label: '팀 채팅', icon: <MessageSquare size={20} /> },
      { id: 'board', label: '게시판', icon: <MessageSquare size={20} /> },
      { id: 'members', label: '팀원 현황', icon: <Users size={20} /> },
      { id: 'settings', label: '설정', icon: <Settings size={20} /> },
    ];

    // 리더가 아니면 settings 메뉴 제거
    if (!isLeader) {
      return items.filter((item) => item.id !== 'settings');
    }
    return items;
  }, [isLeader]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => router.push('/sideproject')}
        >
          <ChevronLeft size={18} /> 목록으로
        </button>
        <div className={styles.projectInfo}>
          {/* 💡 프로젝트 제목의 첫 글자를 로고처럼 활용 */}
          <div className={styles.projectLogo}>
            {project?.title ? project.title.substring(0, 1) : 'P'}
          </div>
          {/* 💡 제목이 길면 CSS로 처리 */}
          <span className={styles.projectName}>
            {project?.title || '로딩 중...'}
          </span>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {filteredMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className={styles.menuItem}>
                <button
                  className={`${styles.menuBtn} ${isActive ? styles.menuBtnActive : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <div className={styles.statusCard}>
          <div className={styles.statusInfo}>
            <span>프로젝트 진행률</span>
            <span className={styles.percent}>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
