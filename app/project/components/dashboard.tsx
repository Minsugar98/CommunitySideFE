'use client';

import { useMemo, useEffect, useState } from 'react';
import styles from './dashbaord.module.css';
import {
  Clock,
  Activity,
  Calendar as CalendarIcon,
  Edit3,
  Loader2,
} from 'lucide-react';
import { getMyProjectTasks, updateProjectTask } from '../../api/project';
import Modal from './modal'; // 통합 모달 임포트
import toast from 'react-hot-toast';

interface DashboardMainProps {
  project: any;
  events: any[];
}

export default function Dashboard({
  project,
  events = [],
}: DashboardMainProps) {
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 💡 1. 내 일정 불러오기 (API 호출)
  useEffect(() => {
    const fetchMyTasks = async () => {
      // 💡 projectId가 string일 수 있으니 Number로 확실히 변환
      const pId = Number(project?.id);
      if (!pId) return;

      try {
        setLoading(true);

        const res = await getMyProjectTasks(pId);

        if (res.success && Array.isArray(res.data)) {
          setMyTasks(res.data);
        } else {
          setMyTasks([]);
        }
      } catch (err) {
        console.error('내 일정 로드 실패 상세:', err);
        setMyTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [project?.id]); // 💡 project.id가 바뀌면 다시 호출

  // 💡 2. 전체 진행률 계산 (events가 undefined일 경우를 대비해 기본값 [] 설정)
  const progress = useMemo(() => {
    const safeEvents = events || []; // 타입 에러 방지
    if (safeEvents.length === 0) return 0;

    const completed = safeEvents.filter((e) => {
      const status = e.status || e.extendedProps?.status;
      return status === 'DONE' || status === 'COMPLETED';
    }).length;

    return Math.round((completed / safeEvents.length) * 100);
  }, [events]);

  // 💡 3. 최근 활동 피드
  const recentActivities = useMemo(() => {
    const safeEvents = events || [];
    return [...safeEvents]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [events]);

  // 💡 4. 수정 핸들러
  const handleUpdateTask = async (updatedData: any) => {
    try {
      const res = await updateProjectTask(
        project.id,
        selectedTask.id,
        updatedData,
      );
      if (res.success) {
        // 내 로컬 상태 업데이트
        setMyTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTask.id ? { ...t, ...updatedData } : t,
          ),
        );
        setIsModalOpen(false);
        toast.success('일정이 수정되었습니다! ✨');
      }
    } catch (err) {
      toast.error('수정 중 오류가 발생했습니다.');
    }
  };

  // D-Day 계산 로직
  const getDDay = (dueDate: string) => {
    if (!dueDate) return '-';
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 0
      ? '오늘 마감'
      : days > 0
        ? `${days}일 남음`
        : `${Math.abs(days)}일 지남`;
  };

  return (
    <div className={styles.container}>
      <section className={styles.overviewSection}>
        <div className={styles.projectCard}>
          <div className={styles.projectHeader}>
            <span className={styles.badge}>{project?.meetingType}</span>
            <h2 className={styles.projectTitle}>
              {project?.title || '프로젝트 정보 없음'}
            </h2>
            <p className={styles.projectSummary}>{project?.summary}</p>
          </div>
          <div className={styles.progressBox}>
            <div className={styles.progressInfo}>
              <span>전체 진행률</span>
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
      </section>

      <div className={styles.contentGrid}>
        {/* 좌측: 내 일정 리스트 */}
        <section className={styles.todaySection}>
          <h3 className={styles.sectionTitle}>
            <CalendarIcon size={18} /> 나의 프로젝트 일정
          </h3>
          <div className={styles.taskList}>
            {loading ? (
              <div className={styles.loadingBox}>
                <Loader2 className={styles.spinner} />
              </div>
            ) : myTasks.length > 0 ? (
              myTasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <span
                      className={`${styles.statusBadge} ${styles[task.status]}`}
                    >
                      {task.status === 'DONE'
                        ? '완료'
                        : task.status === 'IN_PROGRESS'
                          ? '진행중'
                          : '할일'}
                    </span>
                    <span
                      className={
                        task.status === 'DONE'
                          ? styles.taskTextDone
                          : styles.taskText
                      }
                    >
                      {task.title}
                    </span>
                    <span className={styles.dDay}>{getDDay(task.dueDate)}</span>
                  </div>
                  <button
                    className={styles.editBtn}
                    onClick={() => {
                      setSelectedTask(task);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>나에게 할당된 일정이 없습니다.</p>
            )}
          </div>
        </section>

        {/* 우측: 활동 기록 */}
        <section className={styles.activitySection}>
          <h3 className={styles.sectionTitle}>
            <Activity size={18} /> 최근 활동 기록
          </h3>
          <div className={styles.feedList}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className={styles.feedItem}>
                  <div className={styles.feedIcon}>
                    <Clock size={14} />
                  </div>
                  <div className={styles.feedContent}>
                    <p className={styles.feedText}>
                      <strong>{activity.title}</strong> 업데이트
                    </p>
                    <span className={styles.feedTime}>
                      {new Date(
                        activity.updatedAt || activity.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>최근 활동이 없습니다.</p>
            )}
          </div>
        </section>
      </div>

      {/* 💡 통합 모달: mode="edit" */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode="edit"
          project={project}
          initialData={selectedTask}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
}
