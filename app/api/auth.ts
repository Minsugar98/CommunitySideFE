import { apiClient } from './api';
import { LoginReq, SignUpReq } from './types/auth.type';
import { BaseResponse } from './types/common.type';
import { UserData } from './types/user.type';

/**
 * 로그인 API (데이터 없이 메시지만 오는 경우)
 * BaseResponse에 제네릭을 넘기지 않으면 기본값인 undefined가 사용됩니다.
 */
export const postLogin = async (data: LoginReq): Promise<BaseResponse> => {
  const response = await apiClient.post<BaseResponse>('/auth/login', data, {
    headers: { skipAuth: 'true' },
  });
  return response.data;
};

export const postLogout = async (): Promise<BaseResponse> => {
  // 쿠키 기반 인증이므로 credentials 설정이 포함된 apiClient를 사용합니다.
  const response = await apiClient.post<BaseResponse>('/auth/logout');
  return response.data;
};

/**
 * 유저 정보 조회 API (데이터가 포함되어 오는 경우)
 * BaseResponse<UserData> 형태로 선언하여 data 필드의 타입을 지정합니다.
 */
export const getUserInfo = async (): Promise<BaseResponse<UserData>> => {
  const response = await apiClient.get<BaseResponse<UserData>>('/user/me');
  return response.data;
};
