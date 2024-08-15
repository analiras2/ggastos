export interface IBalanceData {
  expected: number;
  current: number;
}

export enum HeaderType {
  SIMPLE,
  MONTH,
  DETAILS,
}

export type TSimpleHeader = {
  type: HeaderType.SIMPLE;
  title: string;
};

export type TMonthHeader = {
  type: HeaderType.MONTH;
  balance: IBalanceData;
};

export type TDetailsHeader = {
  type: HeaderType.DETAILS;
  balance: IBalanceData;
  title: string;
  categoryColor: string;
  onBack: () => void;
};

export type THeader = TSimpleHeader | TMonthHeader | TDetailsHeader;
