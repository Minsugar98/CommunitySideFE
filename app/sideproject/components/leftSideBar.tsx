'use client';
import styles from './leftSideBar.module.css';
import { useState } from 'react';
import { GetProjectsQuery } from '../../api/types/project.type';
import { ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'; // 아이콘 추가
import { POSITION_MAP, POSITION_KEYS, TECH_STACKS } from '../../../constants/project';
const TYPE_LABELS: Record<string, string> = {
  ONLINE: '온라인',
  OFFLINE: '오프라인',
  HYBRID: '온/오프라인'
};
const typeOptions = ['ONLINE', 'OFFLINE', 'HYBRID'];

interface LeftSideBarProps {
  onSearch: (filters: GetProjectsQuery) => void;
}export default function LeftSideBar({ onSearch }: LeftSideBarProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const [openSection, setOpenSection] = useState<string | null>('tech');

  const handleResetFilters = () => {
    setSelectedLanguages([]);
    setSelectedPositions([]);
    setSelectedType(undefined);
    onSearch({});
  };

  const handleSearchClick = () => {
    onSearch({
      techStack: selectedLanguages,
      position: selectedPositions,
      meetingType: selectedType
    });
  };

  const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  return (
    <aside className={styles.mainContainer}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>필터</h2>
        <button className={styles.resetButton} onClick={handleResetFilters}>
          <RotateCcw size={14} /> 초기화
        </button>
      </div>

      <div className={styles.filterSections}>
        {/* --- 기술 스택 --- */}
        <div className={styles.filterCategory}>
          <button 
            className={`${styles.categoryHeader} ${openSection === 'tech' ? styles.opened : ''}`}
            onClick={() => setOpenSection(openSection === 'tech' ? null : 'tech')}
          >
            기술스택 {openSection === 'tech' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <div className={`${styles.collapsible} ${openSection === 'tech' ? styles.show : ''}`}>
            <ul className={styles.dropdownList}>
              {/* 💡 상수 데이터 TECH_STACKS 사용 */}
              {TECH_STACKS.map((lang) => (
                <li
                  key={lang}
                  className={`${styles.dropdownItem} ${selectedLanguages.includes(lang) ? styles.selected : ''}`}
                  onClick={() => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
                >
                  {lang}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- 포지션 --- */}
        <div className={styles.filterCategory}>
          <button 
            className={`${styles.categoryHeader} ${openSection === 'pos' ? styles.opened : ''}`}
            onClick={() => setOpenSection(openSection === 'pos' ? null : 'pos')}
          >
            포지션 {openSection === 'pos' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <div className={`${styles.collapsible} ${openSection === 'pos' ? styles.show : ''}`}>
            <ul className={styles.dropdownList}>
              {/* 💡 POSITION_KEYS를 순회하며 POSITION_MAP으로 한글 출력 */}
              {POSITION_KEYS.map((key) => (
                <li
                  key={key}
                  className={`${styles.dropdownItem} ${selectedPositions.includes(key) ? styles.selected : ''}`}
                  onClick={() => toggleItem(key, selectedPositions, setSelectedPositions)}
                >
                  {POSITION_MAP[key]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- 진행 방식 --- */}
        <div className={styles.filterCategory}>
          <button 
            className={`${styles.categoryHeader} ${openSection === 'type' ? styles.opened : ''}`}
            onClick={() => setOpenSection(openSection === 'type' ? null : 'type')}
          >
            진행 방식 {openSection === 'type' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <div className={`${styles.collapsible} ${openSection === 'type' ? styles.show : ''}`}>
            <ul className={styles.dropdownList}>
              {typeOptions.map((type) => (
                <li
                  key={type}
                  className={`${styles.dropdownItem} ${selectedType === type ? styles.selected : ''}`}
                  onClick={() => setSelectedType(selectedType === type ? undefined : type)}
                >
                  {TYPE_LABELS[type]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- 선택된 항목 미리보기 --- */}
        {(selectedLanguages.length > 0 || selectedPositions.length > 0 || selectedType) && (
          <div className={styles.selectedTagsArea}>
            <p className={styles.tagTitle}>선택됨</p>
            <div className={styles.tagCloud}>
              {selectedLanguages.map(l => <span key={l} className={styles.activeTag}>#{l}</span>)}
              {/* 💡 선택된 포지션도 한글로 보여주기 */}
              {selectedPositions.map(p => <span key={p} className={styles.activeTag}>#{POSITION_MAP[p] || p}</span>)}
              {selectedType && <span className={styles.activeTag}>#{TYPE_LABELS[selectedType]}</span>}
            </div>
          </div>
        )}

        <button className={styles.actionButton} onClick={handleSearchClick}>
          <Search size={18} /> 프로젝트 검색
        </button>
      </div>
    </aside>
  );
}