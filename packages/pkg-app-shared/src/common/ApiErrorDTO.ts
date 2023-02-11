export type ApiErrorType = 'UNAUTHORIZED' | 'ACCESS_DENIED' | 'ROUTE_HANDLER_NOT_FOUND' | 'INTERNAL_SERVER_ERROR'

export interface ApiErrorDTO {
  readonly type: ApiErrorType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly details?: any
  readonly debugInfo?: string
}
