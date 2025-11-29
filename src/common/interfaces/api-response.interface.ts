export interface ResponseHeader {
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  header: ResponseHeader;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T = any> {
  items: T[];
  meta: PaginationMeta;
}
