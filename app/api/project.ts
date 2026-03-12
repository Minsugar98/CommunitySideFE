import { apiClient } from './api';
import { BaseResponse } from './types/common.type';
import {
  EditProjectDto,
  CreateTaskDto,
  TaskItem,
  ProjectCreateRequest,
  PendingApplicationsResponse,
  ActiveProjectsResponse,
  GetProjectsQuery,
  ProjectsResponse,
  ProjectItem,
  CreatePostRequest,
  GetPostsParams,
} from './types/project.type';
import qs from 'qs';
// 공통 페이징 메타 타입
interface Meta {
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}

export const getProjectDetail = async (
  id: number,
): Promise<BaseResponse<ProjectItem>> => {
  // 백엔드 엔드포인트 규격 /project/1, /project/2 등에 맞춰 요청
  const response = await apiClient.get<BaseResponse<ProjectItem>>(
    `/project/${id}`,
  );
  return response.data;
};

export const getAllProjects = async (
  query?: GetProjectsQuery,
): Promise<BaseResponse<ProjectsResponse>> => {
  const response = await apiClient.get<BaseResponse<ProjectsResponse>>(
    '/project',
    {
      params: query,
      // 이 설정이 있으면 배열을 ?pos=A&pos=B 형태로 예쁘게 바꿔줍니다.
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      },
    },
  );
  return response.data;
};

export const createProject = async (
  data: ProjectCreateRequest,
): Promise<BaseResponse<any>> => {
  // .post<응답타입>(URL, 요청데이터)
  const response = await apiClient.post<BaseResponse<any>>(
    '/project/create',
    data,
  );
  return response.data;
};

// 1. 신청 중인 프로젝트 조회
export const getPendingApplications = async () => {
  const response = await apiClient.get<
    BaseResponse<PendingApplicationsResponse>
  >('/project/my/applications/pending');
  return response.data;
};

export const getActiveProjects = async () => {
  const response = await apiClient.get<BaseResponse<ActiveProjectsResponse>>(
    '/project/my/projects/active',
  );
  return response.data;
};

export const createApplicationProject = async (
  projectId: number,
  data: { message: string; position: string },
) => {
  // 💡 두 번째 인자로 data 객체를 넘겨줍니다.
  const response = await apiClient.post(`/project/${projectId}/join`, data);
  return response.data;
};

export const getProjectDashboardDetail = async (projectId: number) => {
  const response = await apiClient.get<BaseResponse<ProjectItem>>(
    `/project/${projectId}`,
  );
  return response.data;
};

export const getProjectTasks = async (
  projectId: number,
  year: string,
  month: string,
) => {
  const response = await apiClient.get<BaseResponse<TaskItem[]>>(
    `/project/${projectId}/tasks`, // Path Variable
    {
      params: { year, month }, // 💡 이 부분이 자동으로 ?year=2026&month=02 를 생성합니다.
    },
  );
  return response.data;
};

export const createProjectTask = async (
  projectId: number,
  taskData: CreateTaskDto,
) => {
  const response = await apiClient.post<BaseResponse<any>>(
    `/project/${projectId}/tasks`,
    taskData,
  );
  return response.data;
};

export const getMyProjectTasks = async (projectId: number) => {
  const response = await apiClient.get<BaseResponse<any[]>>(
    `/project/${projectId}/tasks/me`,
  );
  return response.data;
};

export const updateProjectTask = async (
  projectId: number,
  taskId: number,
  taskData: any,
) => {
  const response = await apiClient.patch<BaseResponse<any>>(
    `/project/${projectId}/tasks/${taskId}`,
    taskData,
  );
  return response.data;
};

export const patchProjectApplication = async (
  projectId: number,
  userId: number,
  status: string,
) => {
  const response = await apiClient.patch(`/project/${projectId}/application`, {
    userId,
    status,
  });
  return response.data;
};

export const patchProjectMemberPosition = async (
  projectId: number,
  userId: number,
  position: string,
) => {
  const response = await apiClient.patch(`/project/${projectId}/application`, {
    userId,
    position, // 💡 백엔드 DTO에 position 필드가 추가되어 있어야 합니다.
  });
  return response.data;
};

export const getProjectApplicants = async (projectId: number) => {
  const response = await apiClient.get(
    `/project/${projectId}/projectapplication`,
  );
  return response.data;
};

export const editProject = async (projectId: number, editData: any) => {
  const response = await apiClient.patch(
    `/project/${projectId}/edit`,
    editData,
  );
  return response.data;
};

export const getChatMessages = async (projectId: number, page: number = 1) => {
  const response = await apiClient.get(`/projects/${projectId}/chat/messages`, {
    params: { page },
  });
  return response.data; // { success, data, meta } 구조 반환
};

export const createProjectPost = async (
  projectId: number,
  data: CreatePostRequest,
) => {
  const response = await apiClient.post(`/project/post/${projectId}`, data);
  return response.data; // 성공 시 백엔드에서 보낸 응답 반환
};

export const getProjectPosts = async (
  projectId: number,
  params: GetPostsParams,
) => {
  const response = await apiClient.get(`/project/post/${projectId}`, {
    params,
  });
  return response.data; // { success: true, data: { posts: [...], meta: {...} }, ... }
};

export const getPostDetail = async (projectId: number, postId: number) => {
  const response = await apiClient.get(`/project/post/${projectId}/${postId}`);
  return response.data;
};

/**
 * 댓글 등록 API
 */
export const createComment = async (
  projectId: number,
  postId: number,
  data: { content: string },
) => {
  const response = await apiClient.post(
    `/project/${projectId}/posts/${postId}/comments`,
    data,
  );
  return response.data;
};

export const updateProjectPost = async (
  projectId: number,
  postId: number,
  data: { title: string; content: string },
) => {
  const response = await apiClient.patch(
    `/project/post/${projectId}/${postId}`,
    data,
  );
  return response.data;
};

/** 게시글 삭제 */
export const deleteProjectPost = async (projectId: number, postId: number) => {
  const response = await apiClient.delete(
    `/project/post/${projectId}/${postId}`,
  );
  return response.data;
};

/** 댓글 삭제 */
export const deleteComment = async (
  projectId: number,
  postId: number,
  commentId: number,
) => {
  const response = await apiClient.delete(
    `/project/${projectId}/posts/${postId}/comments/${commentId}`,
  );
  return response.data;
};
