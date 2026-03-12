'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getProjectDetail, createApplicationProject } from '../../api/project';
import { ProjectItem } from '../../api/types/project.type';
import Loading from '../../components/loading/loading';
import styles from './projectDetail.module.css';
import { Calendar, Users, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../../store/useUserStore';
import ApplyModal from '../components/applyModal'; // 💡 임포트 확인
import { POSITION_MAP } from '../../../constants/project';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 💡 모달 제어 상태
  const [mounted, setMounted] = useState(false);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  useEffect(() => {
    setMounted(true);
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await getProjectDetail(Number(id));
        
        if (res.success && res.data) {
          const projectData = {
            ...res.data,
            techStacks: res.data.techStacks.flatMap(stack => 
              typeof stack === 'string' && stack.includes(',') 
                ? stack.split(',').map(s => s.trim()) 
                : stack
            )
          };
          setProject(projectData);
        }
      } catch (err) {
        console.error("상세 페이지 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (!mounted) return null;
  if (isLoading) return <Loading />;
  if (!project || !project.leader) {
    return <div className={styles.error}>프로젝트 정보를 불러올 수 없습니다.</div>;
  }

  // 💡 1. 지원하기 버튼 클릭 시 (모달 열기)
  const handleApplyClick = () => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요한 서비스입니다.');
      router.push('/login');
      return;
    }
    setIsModalOpen(true);
  };

  // 💡 2. 모달에서 최종 지원하기 클릭 시 (API 전송)
  const handleModalSubmit = async (data: { position: string; message: string }) => {
    const processToast = toast.loading('지원서를 제출하고 있습니다...');
    try {
      const res = await createApplicationProject(Number(id), data);
  
      if (res.success) {
        toast.success('프로젝트 참여 신청이 완료되었습니다! 🎉', { id: processToast });
        setIsModalOpen(false); // 성공 시 모달 닫기
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '지원 중 오류가 발생했습니다.';
      toast.error(errorMsg, { id: processToast });
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={20} /> 뒤로가기
      </button>

      <div className={styles.layout}>
        <main className={styles.mainContent}>
          <header className={styles.header}>
            <div className={`${styles.statusBadge} ${project.status ? styles.active : styles.closed}`}>
              {project.status ? '모집 중' : '모집 완료'}
            </div>
            <h1 className={styles.title}>{project.title}</h1>
            <div className={styles.leaderInfo}>
              <div className={styles.avatar}>
                <Image 
                  src={project.leader?.profileImage || '/profileImage1.svg'} 
                  alt="leader" 
                  width={40} height={40} className={styles.profileImg}
                />
              </div>
              <div className={styles.leaderTexts}>
                <span className={styles.nickname}>{project.leader?.nickname}</span>
                <span className={styles.createdAt}>
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </header>

          <section className={styles.markdownArea}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.content || '내용이 없습니다.'}
            </ReactMarkdown>
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.stickyBox}>
            <h3 className={styles.sidebarTitle}>모집 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><Calendar size={18} /><span>{project.startDate} ~ {project.endDate}</span></div>
              <div className={styles.infoItem}><MapPin size={18} /><span>{project.meetingType === 'ONLINE' ? '온라인' : '오프라인'}</span></div>
              <div className={styles.infoItem}><Users size={18} /><span>모집 인원: {project.recruitmentQuota || 0}명</span></div>
            </div>

            <div className={styles.tagSection}>
              <p className={styles.tagLabel}>모집 포지션</p>
              <div className={styles.tags}>
              {project.position?.map(p => (
                <span key={p} className={styles.posTag}>
                  {/* 💡 화면에 보여줄 때만 한글 매핑 적용! */}
                  {POSITION_MAP[p] || p}
                </span>
              ))}
              </div>
            </div>

            <div className={styles.tagSection}>
              <p className={styles.tagLabel}>기술 스택</p>
              <div className={styles.tags}>
                {project.techStacks?.map((t, idx) => (
                  <span key={idx} className={styles.techTag}>#{t}</span>
                ))}
              </div>
            </div>

            {/* 💡 onClick을 handleApplyClick으로 변경 */}
            <button className={styles.applyBtn} disabled={!project.status} onClick={handleApplyClick}>
              {project.status ? '프로젝트 지원하기' : '모집 완료'}
            </button>
          </div>
        </aside>
      </div>

      {/* 💡 분리된 모달 컴포넌트 연결 */}
      <ApplyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        positions={project.position || []}
      />
    </div>
  );
}