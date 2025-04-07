import {
  // AccountItemProps,
  HistoryItemProps,
  TestAccountItemProps,
  GoodsItemProps,
} from '../components/types/CheckAccount';

export type RootStackParamList = {
  HomeScreen: undefined;
  CreateAccountScreen: undefined;
  CreateAccountGoodsDetail: {
    goods: GoodsItemProps;
  };
  CreateAccountCheck: {
    goods: GoodsItemProps;
  };
  CreateAccountSuccess: {
    goods: GoodsItemProps;
  };
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
  SendRecentAccount: undefined;
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
    goods?: GoodsItemProps;
  };
  ThreeBtn: undefined;
};
