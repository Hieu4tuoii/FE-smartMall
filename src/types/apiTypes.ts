/**
 * Interface chung cho response từ API 
 * @template T - Kiểu dữ liệu của data
 */

/**
 * Interface cho response có phân trang 
 * @template T - Kiểu dữ liệu của items
 */
export interface PageResponse<T = any> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  items: T[];
}

/**
 * Interface cho các tham số query phân trang
 */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}


