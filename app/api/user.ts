import { apiClient } from './api';
import { BaseResponse } from './types/common.type';
import { SignUpRequest, UserData, UpdateUserDto } from './types/user.type';

export const postSignUp = async (
  data: SignUpRequest,
): Promise<BaseResponse> => {
  const response = await apiClient.post<BaseResponse>('/user/signup', data, {
    headers: { skipAuth: 'true' }, // 인증 토큰이 필요 없는 요청
  });
  return response.data;
};

// 수정 가능한 모든 필드를 정의합니다.

export const updateUserInfo = async (
  data: UpdateUserDto,
): Promise<BaseResponse> => {
  const response = await apiClient.patch<BaseResponse>('/user/edit', data);
  return response.data;
};

/** 내 프로젝트 조회 */
export const getMyProjects = async () => {
  const response = await apiClient.get<BaseResponse<any[]>>('/user/projects');
  return response.data;
};

/** 내 일정 조회 */
export const getMySchedules = async () => {
  const response = await apiClient.get<BaseResponse<any[]>>('/user/schedules');
  return response.data;
};
