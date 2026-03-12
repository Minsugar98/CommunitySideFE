'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';
import { getAllProjects } from '../api/project';
import { ProjectItem } from '../api/types/project.type';
import styles from './sideproject.module.css';
import LeftSideBar from './components/leftSideBar';
import Card from './components/card';
import toast from 'react-hot-toast';
import Loading from '../components/loading/loading';
import { GetProjectsQuery } from '../api/types/project.type';
import { LayoutGrid, List } from 'lucide-react'; // 아이콘 라이브러리 (npm install lucide-react)

export default function SideProject() {
  const router = useRouter();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 뷰 모드 상태


  const fetchProjects = async (filters?: GetProjectsQuery) => {
    try {
      setIsLoading(true);
      const res = await getAllProjects(filters); 
  
      // 백엔드 응답이 { success: true, data: { projects: [...] } } 구조인지 확인!
      if (res.success && res.data) {
        // res.data.projects 가 배열인지 확인하세요.
        setProjects(res.data.projects || []); 
      } else {
        setProjects([]); // 실패 시 빈 배열 처리
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSearch = (filters: GetProjectsQuery) => {
    fetchProjects(filters); // 선택된 필터 객체를 들고 다시 조회
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>사이드 프로젝트 찾기</h1>
          <div className={styles.viewToggle}>
            <button 
              className={viewMode === 'grid' ? styles.activeTab : ''} 
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? styles.activeTab : ''} 
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        <button className={styles.createButton} onClick={() => isLoggedIn ? router.push('/register') : toast('로그인이 필요합니다.')}>
          프로젝트 생성
        </button>
      </div>

      <div className={styles.subContainer}>
        <LeftSideBar onSearch={handleFilterSearch}/>
        
        {/* viewMode에 따라 클래스 동적 부여 */}
        <div className={viewMode === 'grid' ? styles.gridWrapper : styles.listWrapper}>
          {isLoading ? (
            <Loading />
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} project={project} viewMode={viewMode} />
            ))
          ) : (
            <div className={styles.empty}>등록된 프로젝트가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}