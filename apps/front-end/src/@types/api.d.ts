export interface ClearDatabaseResponse {
  success: boolean;
  errorMessage?: string;
  data?: {
    count: number;
  };
}
