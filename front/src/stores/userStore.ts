import {create} from 'zustand';
import {UserItemProps} from '../components/types/UserInfo';

interface UserState {
  user: UserItemProps;
  setUser: (user: UserItemProps) => void;
}

export const useUserStore = create<UserState>(set => ({
  user: {} as UserItemProps,
  setUser: user => set({user}),
}));
