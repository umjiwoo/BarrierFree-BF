import axios, {AxiosResponse} from 'axios';
import {axiosInstance, ApiResponse, SignUpUserProps} from './axios';
import {Alert} from 'react-native';

const signUpUser = async (user: SignUpUserProps): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
      '/api/users/sign-up',
      user,
    );
    if (response.data.result.code === 200) {
      return response.data;
    } else {
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

const checkId = async (phoneNumber: string): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.get(
      '/api/users/check-id',
      {params: {userLoginId: phoneNumber}},
    );
    if (response.data.result.code === 200) {
      return response.data;
    } else {
      if (response.data.result.code === 1001) {
        Alert.alert('이미 존재하는 회원입니다다.');
        return response.data;
      }
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
          '아이디 중복 검사 처리 중 오류가 발생했습니다.',
      );
    }
    throw error;
  }
};

const loginUser = async (user: {
  phoneNumber: string;
  password: string;
}): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
      '/api/users/login?isAutoLogin=false',
      user,
      {
        params: {
          isAutoLogin: false,
        },
      },
    );
    if (response.data.result.code === 200) {
      return response.data;
    } else {
      if (response.data.result.code === 1004) {
        Alert.alert('아이디가 일치하지 않습니다.');
        return response.data;
      } else if (response.data.result.code === 1005) {
        Alert.alert('비밀번호가 일치하지 않습니다.');
        return response.data;
      }
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logoutUser = async (): Promise<ApiResponse> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
      '/api/users/logout',
    );
    if (response.data.result.code === 200) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

const sendFcmToken = async ({
  fcmToken,
  userId,
}: {
  fcmToken: string;
  userId: number;
}): Promise<any> => {
  try {
    const response: AxiosResponse<ApiResponse> = await axiosInstance.post(
      '/api/fcm/save-token',
      {
        fcmToken,
        userId,
      },
    );
    if (response.data.result.code === 200) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

export {signUpUser, checkId, loginUser, logoutUser, sendFcmToken};
