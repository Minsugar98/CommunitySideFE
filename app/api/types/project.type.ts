// 프로젝트 생성 요청 데이터 타입
export interface ProjectCreateRequest {
  title: string;
  summary: string;
  content: string;
  startDate: string;
  endDate: string;
  meetingType: 'ONLINE' | 'OFFLINE' | 'HYBRID'; // 구체적인 리터럴 타입 권장
  recruitmentQuota: number;
  position: string[];
  techStacks: string[];
}

// 프로젝트 상세 정보 응답 타입 (나중에 상세 페이지에서 사용)
export interface ProjectDetail extends ProjectCreateRequest {
  id: number;
  leaderId: number;
  status: boolean;
  createdAt: string;
  // 필요 시 leader: UserData['user'] 추가 가능
}
export interface Meta {
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}

// 1. 신청 중인 프로젝트 응답 구조
export interface PendingApplicationsResponse {
  applications: any[]; // 신청 데이터 구조에 맞게 추후 수정 가능
  meta: Meta;
}

// 2. 참여 중인 프로젝트 응답 구조
export interface ActiveProjectsResponse {
  projects: any[];
  meta: Meta;
}
export interface GetProjectsQuery {
  page?: number;
  limit?: number;
  status?: boolean;
  meetingType? : string;
  position?: string[];
  techStack?: string[]; // 백엔드 DTO와 이름 맞춤
}

// 개별 프로젝트 아이템 타입 (백엔드 응답 기준)
export interface ProjectItem {
  id: number;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  meetingType: string;
  recruitmentQuota: number;
  position: string[];
  techStacks: string[]; // 백엔드 필드명 확인 필요 (techStack vs techStacks)
  status: boolean;
  content:string;
  leader: {
    nickname: string;
    profileImage: string | null;
    id:number;
    bio?:string;
  };
  projectApplications?: {
    id: number;
    status: string; // 'APPROVED' 등
    user: {
      id: number;
      nickname: string;
      email: string;
    };
  }[];
  createdAt: string;
}

// 전체 조회 응답 타입
export interface ProjectsResponse {
  projects: ProjectItem[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    hasMore: boolean;
  };
}




export interface TaskItem {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedToId: number;
  startDate: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'; // 예시 상태값
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    email: string;
    id:number;
  };
}
export interface CreateTaskDto {
  title: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  assignedToId?: number;
}


export interface EditProjectDto {
  title?: string;
  summary?: string;
  content?: string;
  position?: string[];      // 모집 포지션 배열
  techStacks?: string[];    // 기술 스택 배열
  status?: boolean;         // 모집 중 여부 (true: 모집중, false: 마감)
  startDate?: string;
  endDate?: string;
}
