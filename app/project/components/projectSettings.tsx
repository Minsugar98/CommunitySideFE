'use client';

import React, { useEffect, useState } from 'react';
import styles from './projectSettings.module.css';
import { Save, UserCheck, Layout, FileText, Calendar, ToggleLeft, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProjectApplicants, patchProjectApplication, editProject } from '../../api/project';

interface ProjectSettingsProps {
  project: any;
}

export default function ProjectSettings({ project }: ProjectSettingsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: project?.title || '',
    summary: project?.summary || '',
    content: project?.content || '',
    status: project?.status ?? true,
    startDate: project?.startDate?.split('T')[0] || '',
    endDate: project?.endDate?.split('T')[0] || '',
  });

  useEffect(() => {
    setIsMounted(true);
    const fetchApps = async () => {
      try {
        const res = await getProjectApplicants(Number(project.id));
        if (res.success) {
          const pending = res.data.filter((app: any) => app.Status === 'PENDING');
          setApplicants(pending);
        }
      } catch (err) { console.error(err); }
    };
    fetchApps();
  }, [project.id]);

  if (!isMounted) return null;

  const handleAppStatus = async (userId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await patchProjectApplication(Number(project.id), userId, status);
      if (res.success) {
        toast.success(status === 'ACCEPTED' ? '승인되었습니다.' : '거절되었습니다.');
        setApplicants(prev => prev.filter(a => a.user?.id !== userId));
      }
    } catch (err) { toast.error('처리에 실패했습니다.'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await editProject(Number(project.id), formData);
      if (res.success) {
        toast.success('프로젝트 정보가 저장되었습니다.');
        window.location.reload();
      }
    } catch (err) { toast.error('수정에 실패했습니다.'); }
  };

  return (
    <div className={styles.container}>
      {/* 지원자 관리 섹션 */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <UserCheck className={styles.headerIcon} size={22} />
          <div>
            <h3 className={styles.cardTitle}>신규 지원자 현황</h3>
            <p className={styles.cardSubtitle}>대기 중인 지원자를 승인하거나 거절할 수 있습니다.</p>
          </div>
        </div>
        <div className={styles.applicantList}>
          {applicants.length > 0 ? (
            applicants.map((app) => (
              <div key={app.user?.id} className={styles.appCard}>
                <div className={styles.appInfo}>
                  <span className={styles.appName}>{app.user?.nickname}</span>
                  <span className={styles.appMsg}>{app.message || '지원 메시지가 없습니다.'}</span>
                </div>
                <div className={styles.appActions}>
                  <button className={styles.approveBtn} onClick={() => handleAppStatus(app.user.id, 'ACCEPTED')}>승인</button>
                  <button className={styles.rejectBtn} onClick={() => handleAppStatus(app.user.id, 'REJECTED')}>거절</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>현재 대기 중인 지원자가 없습니다.</div>
          )}
        </div>
      </section>

      {/* 프로젝트 수정 섹션 */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <Save className={styles.headerIcon} size={22} />
          <div>
            <h3 className={styles.cardTitle}>프로젝트 상세 설정</h3>
            <p className={styles.cardSubtitle}>프로젝트의 기본 정보와 모집 상태를 관리합니다.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label><Layout size={16} /> 프로젝트 제목</label>
              <input 
                placeholder="프로젝트 명을 입력하세요"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label><Hash size={16} /> 한 줄 요약</label>
              <input 
                placeholder="프로젝트를 짧게 소개해 주세요"
                value={formData.summary} 
                onChange={e => setFormData({...formData, summary: e.target.value})} 
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label><FileText size={16} /> 상세 내용</label>
              <textarea 
                placeholder="상세한 프로젝트 설명을 작성해 주세요 (Markdown 지원)"
                rows={10}
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label><Calendar size={16} /> 시작 예정일</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>

            <div className={styles.inputGroup}>
              <label><Calendar size={16} /> 종료 예정일</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>

          <div className={styles.formFooter}>
            <div className={styles.statusBox}>
              <div className={styles.statusLabel}>
                <ToggleLeft size={16} />
                <span>모집 상태 설정</span>
              </div>
              <button 
                type="button"
                className={formData.status ? styles.activeStatus : styles.inactiveStatus}
                onClick={() => setFormData({...formData, status: !formData.status})}
              >
                {formData.status ? '현재 팀원 모집 중' : '모집 마감'}
              </button>
            </div>
            <button type="submit" className={styles.submitBtn}>
              설정 저장하기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}