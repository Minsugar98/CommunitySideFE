'use client'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './register.module.css';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/loading/loading';
import { createProject } from '../api/project';
// 💡 분리한 상수 임포트
import { POSITION_MAP, POSITION_KEYS, TECH_STACKS } from '../../constants/project';

interface FormData {
  title: string;
  summary: string;
  content: string;
  startDate: string;
  endDate: string;
  meetingType: string;
  recruitmentQuota: number;
  position: string[];
  techStacks: string[];
}

export default function Register() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    content: '',
    startDate: '',
    endDate: '',
    meetingType: 'ONLINE',
    recruitmentQuota: 1,
    position: [],
    techStacks: []
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (type: 'position' | 'techStacks', value: string) => {
    if (!value) return;
    setFormData(prev => {
      const list = prev[type];
      const newList = list.includes(value) 
        ? list.filter(item => item !== value) 
        : [...list, value];
      return { ...prev, [type]: newList };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    if (formData.position.length === 0) {
      toast.error('최소 한 개의 모집 포지션을 선택해주세요.');
      return;
    }
    if (formData.techStacks.length === 0) {
      toast.error('최소 한 개의 기술 스택을 선택해주세요.');
      return;
    }
  
    const loadingToast = toast.loading('프로젝트를 등록하고 있습니다...');
    try {
      setIsSubmitting(true);
      const response = await createProject({
        ...formData,
        recruitmentQuota: Number(formData.recruitmentQuota),
      });
  
      if (response.success) {
        toast.success('프로젝트가 성공적으로 등록되었습니다! 🚀', { id: loadingToast });
        router.push('/sideproject');
        router.refresh(); 
      } else {
        toast.error(response.message || '등록 중 오류가 발생했습니다.', { id: loadingToast });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '서버와의 통신에 실패했습니다.';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 💡 로딩 뷰 수정 (기존의 중복 return 제거)
  if (isLoading) {
    return <Loading />;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🚀 새 프로젝트 등록</h1>
        <p className={styles.subtitle}>멋진 아이디어를 함께 실현할 팀원을 모집해 보세요.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <label className={styles.label}>프로젝트 제목</label>
          <input name="title" className={styles.input} placeholder="예: 실제 유저가 쓰는 앱 개발 프로젝트" onChange={handleChange} required />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>한 줄 요약</label>
          <input name="summary" className={styles.input} placeholder="프로젝트를 한 줄로 짧게 소개해 주세요." onChange={handleChange} required />
        </div>

        <div className={styles.row}>
          <div className={styles.section}>
            <label className={styles.label}>시작 예정일</label>
            <input type="date" name="startDate" className={styles.input} onChange={handleChange} required />
          </div>
          <div className={styles.section}>
            <label className={styles.label}>종료 예정일</label>
            <input type="date" name="endDate" className={styles.input} onChange={handleChange} required />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.section}>
            <label className={styles.label}>진행 방식</label>
            <select name="meetingType" className={styles.select} onChange={handleChange}>
              <option value="ONLINE">온라인</option>
              <option value="OFFLINE">오프라인</option>
              <option value="HYBRID">혼합 (온/오프라인)</option>
            </select>
          </div>
          <div className={styles.section}>
            <label className={styles.label}>모집 인원 (최대 10명)</label>
            <input type="number" name="recruitmentQuota" className={styles.input} min="1" max="10" defaultValue="1" onChange={handleChange} />
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>모집 포지션 (중복 선택 가능)</label>
          <div className={styles.tagGroup}>
            {POSITION_KEYS.map(key => (
              <button 
                key={key} 
                type="button" 
                className={formData.position.includes(key) ? styles.tagActive : styles.tag}
                onClick={() => toggleSelect('position', key)}
              >
                {POSITION_MAP[key]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>기술 스택</label>
          <select className={styles.select} onChange={(e) => toggleSelect('techStacks', e.target.value)}>
            <option value="">기술 스택 추가...</option>
            {TECH_STACKS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className={styles.selectedStacks}>
            {formData.techStacks.map(s => (
              <span key={s} className={styles.stackBadge} onClick={() => toggleSelect('techStacks', s)}>
                {s} <span className={styles.closeIcon}>✕</span>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>상세 내용 (Markdown 지원)</label>
          <textarea name="content" className={styles.textarea} rows={12} placeholder="프로젝트 기획 배경, 팀원 혜택 등을 상세히 적어주세요." onChange={handleChange} required />
        </div>

        {formData.content && (
          <div className={styles.previewSection}>
            <label className={styles.label}>📝 실시간 미리보기</label>
            <div className={styles.previewBox}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
            </div>
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? '등록 중...' : '프로젝트 등록하기'}
        </button>
      </form>
    </div>
  );
}