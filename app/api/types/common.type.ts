export interface BaseResponse<T = undefined> {
  success: boolean;
  statusCode: number;
  message?: string;
  timeStamp: string;
  // data는 선택적 속성으로 두어, 로그인 성공처럼 데이터가 없는 경우도 대응합니다.
  data?: T;
}
