export enum ErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'INVALID_TOKEN',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  TOKEN_NOT_PAIR = 'TOKEN_NOT_PAIR',
  TOKEN_NOT_EXIST = 'TOKEN_NOT_EXIST',

  // OAuth
  INVALID_CODE = 'INVALID_CODE',
  EXCHANGE_FAILED = 'EXCHANGE_FAILED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',

  // Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Client Error
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type ErrorActionType = 'retry' | 'login' | 'contact' | 'refresh' | 'dismiss';

export interface ErrorMessage {
  message: string;
  actionLabel?: string;
  actionType?: ErrorActionType;
}

// ===========================
// Error Messages
// ===========================

/**
 * displayed to users
 */
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  // Authentication
  [ErrorCode.AUTH_REQUIRED]: {
    message: '로그인이 필요한 서비스에요. 로그인 화면으로 이동할까요?',
    actionLabel: '로그인하기',
    actionType: 'login',
  },
  [ErrorCode.UNAUTHORIZED]: {
    message: '접근 권한이 없어요. 다시 로그인하거나 권한을 확인해주세요.',
    actionLabel: '다시 로그인하기',
    actionType: 'login',
  },
  [ErrorCode.FORBIDDEN]: {
    message: '이용할 수 있는 권한이 없는 것 같아요. 고객센터에 문의해 주세요.',
    actionLabel: '문의하기',
    actionType: 'contact',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    message: '로그인 세션이 만료되었어요. 다시 로그인해 주세요.',
    actionLabel: '로그인하기',
    actionType: 'login',
  },
  [ErrorCode.TOKEN_INVALID]: {
    message: '인증 정보가 올바르지 않아요. 다시 로그인해 주세요.',
    actionLabel: '로그인하기',
    actionType: 'login',
  },
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: {
    message: '로그인 정보가 만료되어 연결이 끊어졌어요. 다시 로그인해 주세요.',
    actionLabel: '로그인하기',
    actionType: 'login',
  },
  [ErrorCode.TOKEN_NOT_PAIR]: {
    message: '인증 정보가 일치하지 않아요. 다시 로그인해 주세요.',
    actionLabel: '로그인하기',
    actionType: 'login',
  },
  [ErrorCode.TOKEN_NOT_EXIST]: {
    message: '인증 정보가 존재하지 않아요. 다시 로그인해 주세요.',
    actionLabel: '로그인하기',
    actionType: 'login',
  },

  // OAuth
  [ErrorCode.INVALID_CODE]: {
    message: '인증 코드가 일치하지 않아요. 코드를 다시 확인해주세요.',
    actionLabel: '다시 입력하기',
    actionType: 'dismiss',
  },
  [ErrorCode.EXCHANGE_FAILED]: {
    message: '인증 정보를 가져오는 데 실패했어요. 다시 시도해주세요.',
    actionLabel: '다시 시도',
    actionType: 'retry',
  },

  // Network
  [ErrorCode.NETWORK_ERROR]: {
    message: '인터넷 연결이 불안정해요. 네트워크 설정을 확인해 주세요.',
    actionLabel: '다시 시도',
    actionType: 'retry',
  },
  [ErrorCode.TIMEOUT]: {
    message: '응답 시간이 너무 길어지고 있어요. 잠시 후 다시 시도해 주세요.',
    actionLabel: '다시 시도',
    actionType: 'retry',
  },
  [ErrorCode.NOT_FOUND]: {
    message: '찾으시는 정보를 확인할 수 없어요. 주소가 올바른지 확인해 주세요.',
    actionLabel: '새로 고침',
    actionType: 'refresh',
  },

  // Server
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    message: '서버에 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
    actionLabel: '다시 시도',
    actionType: 'retry',
  },
  [ErrorCode.BAD_REQUEST]: {
    message: '요청하신 내용을 처리할 수 없어요. 입력한 내용을 다시 확인해 주세요.',
    actionLabel: '확인',
    actionType: 'dismiss',
  },

  // Client
  [ErrorCode.VALIDATION_ERROR]: {
    message: '입력하신 정보가 올바르지 않아요. 입력한 내용을 다시 확인해 주세요.',
    actionLabel: '다시 입력하기',
    actionType: 'dismiss',
  },
  [ErrorCode.UNKNOWN_ERROR]: {
    message: '알 수 없는 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
    actionLabel: '다시 시도',
    actionType: 'retry',
  },
};

// ===========================
// Application Error Class
// ===========================

export class AppError extends Error {
  public readonly actionLabel?: string;
  public readonly actionType?: ErrorActionType;

  constructor(
    public code: ErrorCode,
    errorMessage?: string,
    public statusCode?: number,
    public originalError?: unknown,
    public details?: Record<string, unknown>,
  ) {
    const errorConfig = ERROR_MESSAGES[code];

    super(errorMessage || errorConfig.message);

    this.name = 'AppError';
    this.actionLabel = errorConfig.actionLabel;
    this.actionType = errorConfig.actionType;

    Object.setPrototypeOf(this, AppError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  getUIConfig(): ErrorMessage {
    return {
      message: this.message,
      actionLabel: this.actionLabel,
      actionType: this.actionType,
    };
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// ===========================
// API Error Response
// ===========================

/**
 * Base error response structure from API
 */
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * HTTP status code to error message mapping (fallback for unknown server messages)
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '요청하신 내용을 처리할 수 없어요.',
  401: '로그인이 필요한 서비스에요.',
  403: '이용할 수 있는 권한이 없어요.',
  404: '찾으시는 정보를 확인할 수 없어요.',
  408: '응답 시간이 너무 길어지고 있어요.',
  409: '이미 존재하는 리소스에요.',
  422: '입력하신 정보가 올바르지 않아요.',
  429: '잠시 후 다시 시도해 주세요.',
  500: '서버에 문제가 발생했어요.',
  502: '서버 연결에 실패했어요.',
  503: '서비스가 일시적으로 이용 불가해요.',
  504: '서버 응답 시간이 초과됐어요.',
};

// ===========================
// Error Subclasses
// ===========================

export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.NETWORK_ERROR].message) {
    super(ErrorCode.NETWORK_ERROR, message, 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.UNAUTHORIZED].message,
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
  ) {
    super(code, message, 401);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class PermissionError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.FORBIDDEN].message) {
    super(ErrorCode.FORBIDDEN, message, 403);
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR].message,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, undefined, { errors });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ServerError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR].message) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// ===========================
// Server Error Mapping
// ===========================

/**
 * Backend error messages (used for mapping server responses to ErrorCode)
 */
export const SERVER_ERROR_MESSAGES = {
  ACCESS_TOKEN_EXPIRED: '토큰이 만료되었습니다',
  TOKEN_NOT_EXIST: '토큰 정보가 헤더에 존재하지 않습니다',
  TOKEN_NOT_PAIR: '액세스 토큰과 리프레쉬 토큰의 정보가 다릅니다.',
  REFRESH_TOKEN_EXPIRED: '리프레쉬 토큰이 만료되었습니다.',
  INVALID_TOKEN: '잘못된 인증 정보 입니다.',
  USER_NOT_ALLOWED: '자신의 채팅 방에 관련된 요청만 보낼 수 있습니다',
  USER_NOT_FOUND: '유저 정보를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '권한이 없습니다.',
  INVALID_UUID: '잘못 된 UUID 입니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

/**
 * Map HTTP status code to ErrorCode
 */
export function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.TIMEOUT;
    case 422:
      return ErrorCode.VALIDATION_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCode.INTERNAL_SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * Map backend response message to ErrorCode (exact match)
 */
function mapServerMessageToErrorCode(message: string): ErrorCode | null {
  switch (message) {
    case SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED:
      return ErrorCode.TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_EXIST:
      return ErrorCode.TOKEN_NOT_EXIST;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_PAIR:
      return ErrorCode.TOKEN_NOT_PAIR;
    case SERVER_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED:
      return ErrorCode.REFRESH_TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.INVALID_TOKEN:
      return ErrorCode.TOKEN_INVALID;
    case SERVER_ERROR_MESSAGES.USER_NOT_ALLOWED:
      return ErrorCode.FORBIDDEN;
    case SERVER_ERROR_MESSAGES.USER_NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case SERVER_ERROR_MESSAGES.BAD_REQUEST:
      return ErrorCode.VALIDATION_ERROR;
    case SERVER_ERROR_MESSAGES.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case SERVER_ERROR_MESSAGES.INVALID_UUID:
      return ErrorCode.VALIDATION_ERROR;
    case SERVER_ERROR_MESSAGES.UNKNOWN_ERROR:
      return ErrorCode.UNKNOWN_ERROR;
    default:
      return null;
  }
}

/**
 * Resolve ErrorCode from a server response.
 * Priority: message-based mapping → HTTP status code fallback
 */
export function parseServerError(response: { message?: string; code: number }): ErrorCode {
  if (response.message) {
    const code = mapServerMessageToErrorCode(response.message);
    if (code) return code;
  }
  return mapStatusToErrorCode(response.code);
}

// ===========================
// Type Guards
// ===========================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createAppError(response: { message?: string; code: number }): AppError {
  const errorCode = parseServerError(response);
  return new AppError(errorCode, undefined, response.code, response.message);
}
