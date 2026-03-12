'use client';

import React, { useState } from 'react';
import styles from './applyModal.module.css';
import { X, Send } from 'lucide-react';
import { POSITION_MAP } from '../../../constants/project'; // 💡 상수 임포트
interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { position: string; message: string }) => void;
  positions: string[]; // ['Backend', 'Frontend'...] 형태의 영어 배열
}

export default function ApplyModal({ isOpen, onClose, onSubmit, positions }: ApplyModalProps) {
  const [position, setPosition] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return alert('지원하실 포지션을 선택해주세요.');
    if (!message.trim()) return alert('지원 메시지를 작성해주세요.');
    
    // 💡 여기서 전달되는 position 값은 영어(예: 'Backend')입니다.
    onSubmit({ position, message });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>🚀 프로젝트 지원하기</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.inputGroup}>
            <label>희망 포지션</label>
            <select 
              value={position} 
              onChange={(e) => setPosition(e.target.value)}
              className={styles.select}
            >
              <option value="">포지션을 선택하세요</option>
              {positions.map((p) => (
                <option key={p} value={p}>
                  {/* 💡 화면에 노출될 때만 한글로 변환 */}
                  {POSITION_MAP[p] || p}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>지원 메시지</label>
            <textarea 
              placeholder="리더에게 전달할 메시지를 적어주세요. (기술 스택, 협업 경험 등)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              rows={5}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.submitBtn}>
              <Send size={16} /> 지원서 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}