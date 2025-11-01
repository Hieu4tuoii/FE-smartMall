export type SupplierResponse = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  modifiedAt: string;
};

export type SupplierRequest = {
  name: string;
  email: string;
  phoneNumber: string;
};
