import axios from 'axios';

// 1. Axios 인스턴스 생성 (공통 설정)
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // 환경변수 또는 기본값
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃 (AI 응답 시간 고려)
});

// 2. 타입 정의 (프론트/백엔드 통신 규격)
export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatRequest {
  message: string;
  history?: ChatHistoryItem[]; // 선택적 파라미터
}

interface ChatResponse {
  success: boolean;
  reply: string;
}

// 3. API 함수 정의
export const chatApi = {
  /**
   * Gemini 채팅 메시지 전송
   * Method: POST
   * Endpoint: /gemini/chat
   */
  sendMessage: async ({
    message,
    history = [],
  }: ChatRequest): Promise<ChatResponse> => {
    try {
      // axios.post(url, body, config) 형태
      const response = await apiClient.post<ChatResponse>('/gemini/chat', {
        message,
        history,
      });

      return response.data;
    } catch (error) {
      // 에러 핸들링 (필요시 커스텀 에러 로직 추가)
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || '서버 통신 중 오류가 발생했습니다.'
        );
      }
      throw error;
    }
  },

  // (예시) 나중에 GET 요청이 필요할 때 확장성을 고려한 구조
  // getStatus: async (params: { id: string }) => {
  //   const response = await apiClient.get('/gemini/status', { params }); // params가 쿼리 스트링으로 변환됨 (?id=...)
  //   return response.data;
  // }
};
