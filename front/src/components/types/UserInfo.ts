export interface UserItemProps {
  id: number;
  password: string;
  birthDate: string;
  phoneNumber: string;
  joinedDate: string;
  username: string;
  authorities: any;
  enabled: boolean;
  accountNonLocked: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  fcmToken: string;
}
