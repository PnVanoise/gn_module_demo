export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  pages: number;
  total: number;
  prev_num: number | null;
  next_num: number | null;
}
