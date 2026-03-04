import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  id: number | null;
  nickname: string | null;
  profileImage: string | null;
  isLoggedIn: boolean;
  // 1. 인터페이스에서도 profileImage를 받도록 수정 (선택사항 처리)
  setUserInfo: (
    id: number,
    nickname: string,
    profileImage?: string | null,
  ) => void;
  clearUserInfo: () => void;
}
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      nickname: null,
      isLoggedIn: false,
      profileImage: null,

      setUserInfo: (id, nickname, profileImage = null) => {
        // 데이터가 들어오는지 먼저 확인
        if (!id || !nickname) {
          console.error("setUserInfo 호출 오류: 필수 데이터 누락", { id, nickname });
          return;
        }

        set((state) => ({
          ...state, // 기존 상태 보존 (중요)
          id,
          nickname,
          profileImage: profileImage || null,
          isLoggedIn: true,
        }));
      },

      clearUserInfo: () =>
        set({
          id: null,
          nickname: null,
          profileImage: null,
          isLoggedIn: false,
        }),
    }),
    {
      name: 'user-storage',
      // skipHydration: true, // 만약 SSR 이슈가 너무 심하면 주석 해제 고려
    },
  ),
);