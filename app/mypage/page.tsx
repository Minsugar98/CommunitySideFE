'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-hot-toast';
import styles from './mypage.module.css';
import { postLogout, getUserInfo } from '../api/auth';
import { getActiveProjects, getPendingApplications } from '../api/project'; // API 추가
import ProfileEdit from './components/profileEdit';
import MyProjects from './components/myProjects';
import MySchedules from './components/mySchedules';
import Loading from '../components/loading/loading'; // 로딩 컴포넌트 추가

import { UserData } from '../api/types/user.type';

type TabType = 'projects' | 'schedules' | 'profile';

export default function MyPage() {
  const router = useRouter();
  const { nickname, clearUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [userData, setUserData] = useState<UserData['user'] | null>(null);
  
  // 프로젝트 데이터를 담을 상태 (진행중 / 신청중 분리)
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        // 유저 정보와 프로젝트 정보들을 한 번에 병렬로 호출
        const [userRes, activeRes, pendingRes] = await Promise.all([
          getUserInfo(),
          getActiveProjects(),
          getPendingApplications()
        ]);

        if (userRes.success) setUserData(userRes.data?.user || null);
        
        // 데이터 구조에 맞춰서 (res.data.projects / res.data.applications) 저장
        if (activeRes.success) setActiveProjects(activeRes.data?.projects || []);
        if (pendingRes.success) setPendingProjects(pendingRes.data?.applications || []);
        
      } catch (err) {
        console.error('데이터 로딩 에러:', err);
        toast.error('정보를 불러오는 중 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleLogout = async () => {
    const loadingToast = toast.loading('로그아웃 중...');
    try {
      const res = await postLogout();
      if (res.success) {
        clearUserInfo();
        toast.success('로그아웃 되었습니다.', { id: loadingToast });
        await router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      clearUserInfo();
      toast.error('세션을 종료합니다.', { id: loadingToast });
      router.push('/');
    }
  };

  // 로딩 중일 때 깔끔하게 로고 화면 보여주기
  if (isLoading) return <Loading />;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.profileSection}>
          <div className={styles.avatarLarge} />
          <h2 className={styles.nickname}>{nickname}님</h2>
          <p className={styles.email}>{userData?.email || '반갑습니다!'}</p>
        </div>

        <nav className={styles.navMenu}>
          <button
            className={activeTab === 'projects' ? styles.active : ''}
            onClick={() => setActiveTab('projects')}
          >
            내 프로젝트
          </button>
          <button
            className={activeTab === 'schedules' ? styles.active : ''}
            onClick={() => setActiveTab('schedules')}
          >
            내 일정
          </button>
          <button
            className={activeTab === 'profile' ? styles.active : ''}
            onClick={() => setActiveTab('profile')}
          >
            프로필 수정
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </aside>

      <main className={styles.content}>
        {activeTab === 'projects' && (
          <MyProjects 
            activeProjects={activeProjects} 
            pendingProjects={pendingProjects} 
          />
        )}
        {activeTab === 'schedules' && (
          <MySchedules tasks={userData?.assignedTasks || []} />
        )}
        {activeTab === 'profile' && <ProfileEdit user={userData} />}
      </main>
    </div>
  );
}