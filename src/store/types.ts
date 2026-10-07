export type Page<T> = {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
};

export type ListQuery = {
  page?: number;
  limit?: number;
  keyword?: string;
};
