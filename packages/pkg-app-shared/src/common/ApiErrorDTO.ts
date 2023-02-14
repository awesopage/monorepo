export type ApiErrorType = 'UNAUTHORIZED' | 'ACCESS_DENIED' | 'ROUTE_HANDLER_NOT_FOUND' | 'INTERNAL_SERVER_ERROR'

export type ApiErrorDTO = Readonly<{
  type: ApiErrorType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
  debugInfo?: string
}>
