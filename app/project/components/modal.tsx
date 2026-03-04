'use client';

import { useState, useEffect } from 'react';
import styles from './modal.module.css';
import { X, Calendar as CalendarIcon, UserPlus, Check, ChevronDown } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange?: { start: string; end: string };
  onSave: (data: any) => void;
  project: any;
  initialData?: any;
  mode?: 'create' | 'edit';
}

export default function Modal({ 
  isOpen, onClose, dateRange, onSave, project, initialData, mode = 'create' 
}: ScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO'); // 💡 상태 관리 추가
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setStatus(initialData.status || 'TODO'); // 기존 상태 반영
        setSelectedMemberId(initialData.assignedToId || null);
      } else {
        setTitle('');
        setDescription('');
        setStatus('TODO');
        setSelectedMemberId(null);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen || !project) return null;

  const allMembers = [
    { id: project.leader.id, nickname: project.leader.nickname, role: 'Leader' },
    ...(project.projectApplications?.map((app: any) => ({
      id: app.user.id, nickname: app.user.nickname, role: 'Member'
    })) || [])
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: any = {
      title,
      description,
      status, // 💡 수정된 상태 포함
      assignedToId: selectedMemberId ? Number(selectedMemberId) : null,
    };

    if (mode === 'create' && dateRange) {
      taskData.startDate = `${dateRange.start}T00:00:00.000Z`;
      taskData.dueDate = dateRange.end.includes('T') ? dateRange.end : `${dateRange.end}T23:59:59.000Z`;
    }

    onSave(taskData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}><CalendarIcon size={20} /></div>
            <h2>{mode === 'create' ? '새 일정 등록' : '일정 정보 수정'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} type="button"><X size={22} /></button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 💡 수정 모드일 때만 상태 변경 UI 노출 */}
          {mode === 'edit' && (
            <div className={styles.inputSection}>
              <label className={styles.label}>진행 상태</label>
              <div className={styles.statusGroup}>
                {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.statusBtn} ${status === s ? styles.statusActive : ''} ${styles[s]}`}
                    onClick={() => setStatus(s)}
                  >
                    {s === 'TODO' ? '할 일' : s === 'IN_PROGRESS' ? '진행 중' : '완료'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.inputSection}>
            <label className={styles.label}>일정 제목</label>
            <input type="text" className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="제목을 입력하세요" />
          </div>

          <div className={styles.inputSection}>
            <label className={styles.label}>상세 내용</label>
            <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명을 입력하세요" />
          </div>

          {mode === 'create' && dateRange && (
            <div className={styles.dateDisplay}>
              <div className={styles.dateLabel}>선택된 기간</div>
              <div className={styles.dateValue}>{dateRange.start} ~ {dateRange.end}</div>
            </div>
          )}

          <div className={styles.inputSection}>
            <label className={styles.label}>담당자 지정</label>
            <div className={styles.memberGrid}>
              {allMembers.map((member) => (
                <button
                  key={member.id} type="button"
                  className={`${styles.memberCard} ${selectedMemberId === member.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.nickname}</span>
                    <span className={styles.memberRole}>{member.role}</span>
                  </div>
                  {selectedMemberId === member.id ? <Check size={18} className={styles.checkIcon} /> : <UserPlus size={18} className={styles.plusIcon} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.submitBtn}>
              {mode === 'create' ? '일정 생성하기' : '수정 완료하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}