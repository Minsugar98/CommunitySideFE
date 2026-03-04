'use client';

import { useEffect } from 'react';
import { getUserInfo } from '../../api/auth';
import { useUserStore } from '../../store/useUserStore';

export default function AuthInitializer() {
  const { setUserInfo, clearUserInfo } = useUserStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getUserInfo();
        if (res.success && res.data) {
          setUserInfo(res.data.id, res.data.nickname);
        } else {
          clearUserInfo();
        }
      } catch (error) {
        // 쿠키가 없거나 만료된 경우
        clearUserInfo();
      }
    };

    initAuth();
  }, [setUserInfo, clearUserInfo]);

  return null; // 화면에 아무것도 그리지 않음
}
