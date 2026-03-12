'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateUserInfo } from '../../api/user';
import styles from './profileEdit.module.css';
import { UpdateUserDto } from '../../api/types/user.type';

interface ProfileEditProps {
  user: any;
}

export default function ProfileEdit({ user }: ProfileEditProps) {
  // 1. 상태는 입력을 위해 빈 문자열('')로 초기화하는 것이 React input 관리상 안전합니다.
  const [formData, setFormData] = useState({
    nickname: user.nickname || '',
    bio: user.bio || '',
    career: user.career?.toString() || '',
    position: user.position || '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('새 비밀번호가 일치하지 않습니다.');
    }

    const loadingToast = toast.loading('정보 수정 중...');

    try {
      // 💡 1. 백엔드 DTO와 100% 일치하는 깨끗한 객체 만들기
      const finalData: UpdateUserDto = {};

      // 값이 있을 때만 (비어있지 않을 때만) 필드를 추가합니다.
      if (formData.nickname?.trim()) finalData.nickname = formData.nickname;
      if (formData.bio?.trim()) finalData.bio = formData.bio;
      if (formData.position?.trim()) finalData.position = formData.position;

      // career가 빈 문자열이 아니면 숫자로 변환
      if (formData.career !== '' && formData.career !== undefined) {
        finalData.career = Number(formData.career);
      }

      // 비밀번호는 실제로 쳤을 때만 추가
      if (formData.password && formData.password.trim() !== '') {
        finalData.password = formData.password;
      }

      // 💡 포스트맨에서 보냈던 것처럼 urlLinks도 추가 (현재 폼에 있다면)
      // finalData.urlLinks = ["https://github.com/Minsugar98"];

      const res = await updateUserInfo(finalData);

      if (res.success) {
        toast.success('프로필이 성공적으로 수정되었습니다!', {
          id: loadingToast,
        });

        // 닉네임이 바뀌었다면 전역 상태(Zustand 등)를 업데이트하거나 리프레시
        // window.location.reload(); // 가장 확실한 방법
      }
    } catch (err: any) {
      // 백엔드 에러 메시지를 더 구체적으로 찍어보기
      const errorData = err.response?.data;
      console.error('❌ 백엔드 에러 원인:', errorData);

      const msg = Array.isArray(errorData?.message)
        ? errorData.message[0]
        : errorData?.message || '수정 실패: 입력 형식을 확인해주세요.';

      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className={styles.tabContent}>
      <h3 className={styles.tabTitle}>프로필 수정</h3>

      {/* 이메일 (읽기 전용) */}
      <div className={styles.inputGroup}>
        <label>이메일</label>
        <input
          className={styles.inputDisabled}
          value={user.email || ''}
          disabled
        />
      </div>

      {/* 닉네임 */}
      <div className={styles.inputGroup}>
        <label>닉네임</label>
        <input
          name="nickname"
          className={styles.input}
          value={formData.nickname}
          onChange={handleChange}
        />
      </div>

      {/* 한 줄 소개 */}
      <div className={styles.inputGroup}>
        <label>한 줄 소개</label>
        <input
          name="bio"
          className={styles.input}
          placeholder="나를 한 줄로 표현해 보세요."
          value={formData.bio}
          onChange={handleChange}
        />
      </div>

      {/* 경력 */}
      <div className={styles.inputGroup}>
        <label>경력 (연차)</label>
        <input
          name="career"
          type="number"
          className={styles.input}
          placeholder="숫자만 입력 (예: 1)"
          value={formData.career}
          onChange={handleChange}
        />
      </div>

      {/* 포지션 */}
      <div className={styles.inputGroup}>
        <label>포지션</label>
        <input
          name="position"
          className={styles.input}
          placeholder="예: Backend, Frontend"
          value={formData.position}
          onChange={handleChange}
        />
      </div>

      {/* 비밀번호 섹션 */}
      <div className={styles.passwordSection}>
        <p className={styles.subInfo}>비밀번호 변경 시에만 입력하세요.</p>
        <div className={styles.inputGroup}>
          <input
            name="password"
            type="password"
            className={styles.input}
            placeholder="새 비밀번호"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            name="confirmPassword"
            type="password"
            className={styles.input}
            placeholder="새 비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>

      <button className={styles.saveBtn} onClick={handleSave}>
        수정 완료
      </button>
    </div>
  );
}
