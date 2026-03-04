export interface SignUpRequest {
  email: string;
  password: string;
}
export interface AssignedTask {
  id: number;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  description: string;
  dueDate: string;
  projectId: number;
}

export interface UserData {
  user: {
    // <--- 이 user 객체가 핵심입니다!
    id: number;
    email: string;
    nickname: string;
    profileImage: string | null;
    bio: string | null;
    career: string | null;
    position: string | null;
    urlLinks: string[];
    assignedTasks: AssignedTask[];
  };
}

export interface UpdateUserDto {
  nickname?: string;
  bio?: string;
  career?: number;
  position?: string;
  password?: string;
  profileImage?: string;
}
