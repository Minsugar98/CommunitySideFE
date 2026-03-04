'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const { isLoggedIn, nickname, id } = useUserStore();

  useEffect(() => {
    setIsMounted(true);
    
    // Zustand 하이드레이션 완료 감지
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    // 마운트와 하이드레이션이 모두 끝난 '확정' 상태에서만 체크
    if (isMounted && isHydrated) {
      if (!isLoggedIn) {
        toast.error('로그인이 필요한 페이지입니다.');
        router.replace('/login');
      }
    }
  }, [isLoggedIn, isMounted, isHydrated, router]);

  return {
    // 하이드레이션 중이면 isLoading을 true로 반환
    isLoading: !isMounted || !isHydrated,
    isLoggedIn,
    user: { id, nickname }
  };
};