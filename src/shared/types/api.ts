export type EntityId = number;

export type ISODateString = string;

export type ISODateTimeString = string;

export type ApiResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  number: number;
  size: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginationQuery = {
  page?: number;
  size?: number;
};

export type SearchQuery = {
  search?: string;
};

export type ApiListQuery = PaginationQuery & SearchQuery;

export type EmptyApiResponse = ApiResponse<null>;
