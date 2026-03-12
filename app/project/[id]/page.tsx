'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '../../store/useUserStore';
import CalendarView from '../components/calendarView';
import LeftSideBar from '../components/leftSideBar';
import styles from './project.module.css';
import { ProjectItem } from '../../api/types/project.type';
import { getProjectDashboardDetail, getProjectTasks } from '../../api/project';
import Dashboard from '../components/dashboard';
import Loading from '../../components/loading/loading';
import MemberList from '../components/memberList';
import ProjectSettings from '../components/projectSettings';
import toast from 'react-hot-toast';
import ProjectChat from '../components/projectChat';
import ProjectBoard from '../components/projectBoard';

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { id: userId, isLoggedIn } = useUserStore();

  const [project, setProject] = useState<ProjectItem | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 새로고침 시 하이드레이션(인증 상태 복구)을 기다리기 위한 상태
  const [isMounted, setIsMounted] = useState(false);

  // 리더 여부 계산
  const isLeader = project?.leader.id === userId;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 1️⃣ 마운트가 완료될 때까지 대기 (새로고침 시 스토어 복구 시간 확보)
    if (!isMounted) return;

    const fetchData = async () => {
      if (!projectId) return;

      setIsLoading(true);

      const now = new Date();
      const currentYear = String(now.getFullYear());
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

      try {
        const [projectRes, tasksRes] = await Promise.all([
          getProjectDashboardDetail(Number(projectId)),
          getProjectTasks(Number(projectId), currentYear, currentMonth),
        ]);

        // 2️⃣ 데이터 로드 후 권한 검증
        if (projectRes.success && projectRes.data) {
          const projectData = projectRes.data;

          // 💡 isLoggedIn이 아직 false라면 잠시 대기하거나 API 응답 결과로 판단
          // 리더이거나 수락된 팀원 목록에 포함되어 있는지 확인
          const checkIsMember =
            projectData.leader.id === userId ||
            projectData.projectApplications?.some(
              (app: any) => app.user.id === userId,
            );

          // 만약 로그인 정보가 복구되었는데도 멤버가 아니라면 차단
          if (isLoggedIn && !checkIsMember) {
            toast.error('해당 프로젝트의 멤버가 아닙니다.');
            router.replace('/sideproject');
            return;
          }

          setProject(projectData);
        } else {
          // 💡 비로그인 상태에서 접근 시 401/403 에러가 나면 여기서 캐치됨
          toast.error('접근 권한이 없거나 정보를 찾을 수 없습니다.');
          router.replace('/sideproject');
          return;
        }

        if (tasksRes.success && tasksRes.data) {
          const formattedEvents = tasksRes.data.map((task: any) => ({
            id: String(task.id),
            title: task.title,
            start: task.startDate,
            end: task.dueDate,
            status: task.status,
            description: task.description,
            updatedAt: task.updatedAt,
            createdAt: task.createdAt,
            assignedTo: task.assignedTo.email,
            assignedToId: task.assignedTo.id,
          }));
          setEvents(formattedEvents);
        }
      } catch (err: any) {
        console.error('데이터 로딩 에러:', err);
        // 401 Unauthorized 시 로그인 페이지로
        if (err.response?.status === 401) {
          toast.error('로그인이 필요합니다.');
          router.replace('/login');
        } else {
          router.replace('/sideproject');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, isMounted, isLoggedIn, userId, router]);

  const renderContent = () => {
    if (!project) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className={styles.fullCard}>
            <Dashboard project={project} events={events} />
          </div>
        );
      case 'calendar':
        return (
          <div className={styles.fullCard}>
            <CalendarView
              project={project}
              events={events}
              setEvents={setEvents}
            />
          </div>
        );
      case 'chat':
        return (
          <div className={styles.fullCard}>
            <ProjectChat projectId={projectId} />
          </div>
        );
      case 'board':
        return (
          <div className={styles.fullCard}>
            <ProjectBoard projectId={projectId} />
          </div>
        );
      case 'members':
        return (
          <div className={styles.fullCard}>
            <MemberList project={project} isLeader={isLeader} />
          </div>
        );
      case 'settings':
        return (
          <div className={styles.fullCard}>
            {project && <ProjectSettings project={project} />}
          </div>
        );
      default:
        return null;
    }
  };

  // 💡 마운트 전이거나 로딩 중일 때 로딩 화면 표시
  if (!isMounted || isLoading) {
    return (
      <div className={styles.loadingFullPage}>
        <Loading />
        <p>프로젝트 정보를 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebarSection}>
        <LeftSideBar
          projectId={projectId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          project={project}
          events={events}
          isLeader={isLeader}
        />
      </aside>

      <main className={styles.mainContainer}>
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={styles.projectBadge}>Project</span>
            <h1 className={styles.title}>{project?.title}</h1>
          </div>
        </header>

        <section className={styles.tabContent}>{renderContent()}</section>
      </main>
    </div>
  );
}
