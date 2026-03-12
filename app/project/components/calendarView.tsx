'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { useState, useMemo, useCallback } from 'react';
import styles from './calendarView.module.css';
import Modal from './modal';

import { createProjectTask, updateProjectTask } from '../../api/project';
import toast from 'react-hot-toast';

export default function CalendarView({ project, events, setEvents }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState<'month' | 'sprint'>('month');

  // 💡 수정을 위해 선택된 일정 상태 추가
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const calendarEvents = useMemo(() => {
    return events.map((e: any) => ({
      ...e,
      start: e.start || e.startDate,
      end: e.end || e.dueDate,
      backgroundColor: e.status === 'DONE' ? '#dcfce7' : '#e6f7ff',
      borderColor: e.status === 'DONE' ? '#16a34a' : '#83c2e4',
      textColor: e.status === 'DONE' ? '#16a34a' : '#0284c7',
      display: 'block',
      assignedToId: e.assignedToId ?? e.assignedTo?.id,
    }));
  }, [events]);

  const allMembers = useMemo(() => {
    return [
      {
        id: project.leader.id,
        nickname: project.leader.nickname,
        role: 'Leader',
      },
      ...(project.projectApplications?.map((a: any) => ({
        id: a.user.id,
        nickname: a.user.nickname,
        role: 'Member',
      })) || []),
    ];
  }, [project]);

  // 1️⃣ 날짜 클릭 시 (새 일정 등록)
  const handleDateSelect = useCallback((info: any) => {
    setModalMode('create');
    setSelectedTask(null); // 신규 생성이므로 데이터 비움
    setSelectedDate({ start: info.startStr, end: info.endStr });
    setIsModalOpen(true);
  }, []);

  // 2️⃣ 일정 클릭 시 (일정 수정 모드)
  const handleEventClick = useCallback((info: any) => {
    setModalMode('edit');

    // 💡 FullCalendar의 event 객체에서 id와 extendedProps(원본 데이터)를 가져옵니다.
    const eventId = info.event.id;
    const originalData = info.event.extendedProps;
    const eventTitle = info.event.title;

    setSelectedTask({
      ...originalData,
      id: eventId, // 💡 여기서 확실하게 id를 심어줍니다.
      title: eventTitle,
    });

    setIsModalOpen(true);
  }, []);

  // 3️⃣ 신규 일정 저장
  const handleSaveSchedule = async (taskData: any) => {
    try {
      const { status, ...createData } = taskData;
      const res = await createProjectTask(project.id, createData);
      if (res.success) {
        setEvents((prev: any) => [
          ...prev,
          { ...res.data, id: String(res.data.id) },
        ]);
        setIsModalOpen(false);
        toast.success('일정이 등록되었습니다.');
      }
    } catch (err) {
      toast.error('등록 실패');
    }
  };

  // 4️⃣ 기존 일정 수정 (handleUpdateTask)
  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask?.id) {
      toast.error('수정할 일정의 ID를 찾을 수 없습니다.');
      return;
    }

    try {
      // 💡 selectedTask.id를 사용하여 API 호출
      const res = await updateProjectTask(
        project.id,
        Number(selectedTask.id),
        taskData,
      );

      if (res.success) {
        setEvents((prev: any) =>
          prev.map((e: any) =>
            Number(e.id) === Number(selectedTask.id)
              ? { ...res.data, id: String(res.data.id) }
              : e,
          ),
        );
        setIsModalOpen(false);
        setSelectedTask(null);
        toast.success('일정이 수정되었습니다! ✨');
      }
    } catch (err) {
      console.error(err);
      toast.error('수정 실패');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topControls}>
        <div className={styles.viewToggle}>
          <button
            className={viewMode === 'month' ? styles.activeTab : ''}
            onClick={() => setViewMode('month')}
          >
            월별 보기
          </button>
          <button
            className={viewMode === 'sprint' ? styles.activeTab : ''}
            onClick={() => setViewMode('sprint')}
          >
            주간 스프린트
          </button>
        </div>
        <h2 className={styles.currentMonthTitle}>
          {viewMode === 'month' ? '월 일정' : '주간 스프린트'}
        </h2>
      </div>

      <div
        className={
          viewMode === 'month' ? styles.calendarWrapper : styles.timelineBoard
        }
      >
        {viewMode === 'month' ? (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={koLocale}
            events={calendarEvents}
            height="750px"
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick} // 💡 이벤트 클릭 핸들러 추가
            eventClassNames={styles.customEvent}
          />
        ) : (
          allMembers.map((member, index) => (
            <div key={member.id} className={styles.memberRow}>
              <div className={styles.memberProfile}>
                <div className={styles.avatar}>{member.nickname[0]}</div>
                <div className={styles.memberInfo}>
                  <span className={styles.name}>{member.nickname}</span>
                  <span className={styles.role}>{member.role}</span>
                </div>
              </div>
              <div className={styles.memberCalendar}>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridWeek"
                  headerToolbar={false}
                  locale={koLocale}
                  height="auto"
                  events={calendarEvents.filter(
                    (e: any) => Number(e.assignedToId) === Number(member.id),
                  )}
                  dayHeaders={index === 0}
                  selectable={true}
                  select={handleDateSelect}
                  eventClick={handleEventClick} // 💡 여기도 추가
                  dayMaxEvents={false}
                  eventClassNames={styles.customEvent}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          mode={modalMode} // 'create' 또는 'edit'
          project={project}
          dateRange={selectedDate}
          initialData={selectedTask} // 💡 수정 시 기존 데이터 전달
          onSave={
            modalMode === 'create' ? handleSaveSchedule : handleUpdateTask
          } // 💡 모드에 따른 핸들러 분기
        />
      )}
    </div>
  );
}
