import axios, {AxiosResponse} from 'axios';
import {axiosInstance, ApiResponse, SignUpUserProps} from './axios';

const signUp = async (user: SignUpUserProps): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
      '/api/users/sign-up',
      user,
    );
    console.log('결과 상태 조회 : ', response.data.result.code);
    if (response.data.result.code === 200) {
      console.log('회원가입 성공: ', response.data.body);
      return response.data;
    } else {
      console.log('회원가입 실패: ', user);
      return response.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        throw new Error(
          '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
      throw new Error(
        error.response?.data?.message ||
          '회원가입 처리 중 오류가 발생했습니다.',
      );
    }
    throw error;
  }
};

export {signUp};
