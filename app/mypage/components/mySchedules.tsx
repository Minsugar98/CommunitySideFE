'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './mySchedules.module.css';
import { Calendar, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  description: string;
  dueDate: string;
  projectId: number;
}

interface MySchedulesProps {
  tasks: Task[];
}

const STATUS_MAP = {
  TODO: { label: '할 일', icon: <Circle size={14} />, className: styles.todo },
  IN_PROGRESS: { label: '진행 중', icon: <Clock size={14} />, className: styles.progress },
  DONE: { label: '완료', icon: <CheckCircle2 size={14} />, className: styles.done },
};

export default function MySchedules({ tasks }: MySchedulesProps) {
  const router = useRouter();

  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <Calendar size={40} className={styles.emptyIcon} />
        <p>현재 할당된 업무가 없습니다.</p>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <h3 className={styles.tabTitle}>내 일정 확인 ({tasks.length})</h3>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.taskCard}>
            <div className={styles.taskInfo}>
              <div className={styles.header}>
                <span className={`${styles.statusBadge} ${STATUS_MAP[task.status].className}`}>
                  {STATUS_MAP[task.status].icon}
                  {STATUS_MAP[task.status].label}
                </span>
                <span className={styles.date}>
                  {new Date(task.dueDate).toLocaleDateString()}까지
                </span>
              </div>
              <h4 className={styles.title}>{task.title}</h4>
              <p className={styles.description}>{task.description}</p>
            </div>
            
            <button 
              className={styles.moveBtn}
              onClick={() => router.push(`/project/${task.projectId}`)}
            >
              프로젝트 이동 <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}