import {
  AccountItemProps,
  HistoryItemProps,
} from '../components/types/CheckAccount';

export type RootStackParamList = {
  HomeScreen: undefined;
  Main: undefined;
  CameraTest: undefined;
  CheckAccount: {
    selectedAccount: AccountItemProps;
  };
  CheckHistory: {
    selectedAccount: AccountItemProps;
    history: HistoryItemProps;
  };
  CheckHistoryDetail: {
    history: HistoryItemProps;
  };
  SendFromWhere: {accountNumber?: string};
  SendToWho: undefined;
  SendSuccess: undefined;
  ReceivingAccountScreen: undefined;
  RemittanceConfirm: undefined;
  RemittanceInformation: undefined;
  SendInputPage: {
    type?: 'directMyAccount' | 'directOtherAccount' | 'money' | 'password';
  };
  ThreeBtn: undefined;
  ObjectDetection: undefined;
};
