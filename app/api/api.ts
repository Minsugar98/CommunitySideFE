import axios from 'axios';

// 2. 사용 예시
// 토큰이 필요한 요청 (기본값)
// export const getMyProfile = () => apiClient.get('/users/me');

// 토큰이 필요 없는 요청 (skipAuth 추가)
// export const login = (data) => apiClient.post('/auth/login', data, {
//   headers: { skipAuth: true }
// });
// apiClient.ts
export const apiClient = axios.create({
  baseURL: 'http://49.50.134.252:3001/',
  withCredentials: true, // 💡 이게 있어야 브라우저가 쿠키(access_token)를 실어 보냅니다!
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // 💡 쿠키 방식을 사용하므로 localStorage에서 토큰을 꺼내 헤더에 넣는 로직을 제거합니다.
    // withCredentials: true 설정 덕분에 access_token 쿠키가 자동으로 포함됩니다.

    if (config.headers?.skipAuth) {
      delete config.headers.skipAuth;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 3. 응답(Response) 인터셉터 (옵션: 에러 공통 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 에러 발생 시 (로그인 만료 등)
    if (error.response?.status === 401) {
      // 로그아웃 처리나 로그인 페이지 이동 로직
      console.log('인증이 만료되었습니다.');
    }
    return Promise.reject(error);
  },
);
