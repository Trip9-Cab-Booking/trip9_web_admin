// export type DownloadData = {
//     _id: number;
//     lastName: string | null;
//     firstName: string | null;
//     address?: string | null;
//     status?: string | null;
//     driverId?: string | null;
//     userId?: string | null;
//     gender?:string | null;
//     phone?: string | null;
//   };


export type ExportContext =
  | "users"
  | "drivers"
  | "getAlltransactions";

  export type UserExportData = {
  firstName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
  status?: string;
  _id?: string;
};

export type DriverExportData = UserExportData & {
  address?: string;
};

export type TransactionExportData = {
  id: string;
  type: string;
  userName: string;
  driverName?: string;
  amount: number;
  mode: string;
  status: string;
  date: string;
};
