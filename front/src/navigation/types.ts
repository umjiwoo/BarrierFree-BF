import {
  // AccountItemProps,
  HistoryItemProps,
  TestAccountItemProps,
} from '../components/types/CheckAccount';

export type RootStackParamList = {
  HomeScreen: undefined;
  Main: undefined;
  DefaultButton: undefined;
  // CheckAccount: {
  //   selectedAccount: AccountItemProps;
  // };
  CheckHistory: undefined;
  // CheckHistory: {
  //   history: HistoryItemProps;
  // };
  CheckHistoryDetail: {
    history: HistoryItemProps;
  };
  SendMain: undefined;
  SendFavoriteAccount: undefined;
  SendSuccess: undefined;
  ReceivingAccountScreen: {
    selectedAccount: TestAccountItemProps;
  };
  RemittanceConfirm: {
    money: number;
    selectedAccount: TestAccountItemProps;
  };
  RemittanceInformation: {
    money: number;
    selectedAccount: TestAccountItemProps;
  };
  SendInputPage: {
    type: 'directMyAccount' | 'directOtherAccount' | 'money' | 'password';
    selectedAccount?: TestAccountItemProps;
    money?: number;
  };
  ThreeBtn: undefined;
  Payment: undefined;
  PaymentConfirm: {
    accountNumber: string;
    amount: number;
    sessionId: string;
  };
};
