// 统一错误处理机制
export interface AppError {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  private static errors: AppError[] = [];
  private static listeners: ((errors: AppError[]) => void)[] = [];

  // 添加错误
  static addError(error: Omit<AppError, 'id' | 'timestamp'>): void {
    const newError: AppError = {
      ...error,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    this.errors.push(newError);
    this.notifyListeners();
    
    // 控制台输出
    console.error(`[${newError.type.toUpperCase()}] ${newError.title}:`, newError.message, newError.details);
  }

  // 添加错误（简化版）
  static error(title: string, message: string, details?: any): void {
    this.addError({
      type: 'error',
      title,
      message,
      details
    });
  }

  // 添加警告
  static warning(title: string, message: string, details?: any): void {
    this.addError({
      type: 'warning',
      title,
      message,
      details
    });
  }

  // 添加信息
  static info(title: string, message: string, details?: any): void {
    this.addError({
      type: 'info',
      title,
      message,
      details
    });
  }

  // 获取所有错误
  static getErrors(): AppError[] {
    return [...this.errors];
  }

  // 清除错误
  static clearError(errorId: string): void {
    this.errors = this.errors.filter(error => error.id !== errorId);
    this.notifyListeners();
  }

  // 清除所有错误
  static clearAllErrors(): void {
    this.errors = [];
    this.notifyListeners();
  }

  // 添加监听器
  static addListener(listener: (errors: AppError[]) => void): void {
    this.listeners.push(listener);
  }

  // 移除监听器
  static removeListener(listener: (errors: AppError[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知监听器
  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.errors));
  }

  // 处理异步错误
  static async handleAsync<T>(
    promise: Promise<T>,
    errorTitle: string = '操作失败'
  ): Promise<T | null> {
    try {
      return await promise;
    } catch (error) {
      this.error(errorTitle, error instanceof Error ? error.message : '未知错误', error);
      return null;
    }
  }

  // 处理本地存储错误
  static handleStorageError(operation: string, error: any): void {
    this.error(
      '存储操作失败',
      `无法${operation}数据`,
      { operation, error: error?.message || error }
    );
  }

  // 处理网络错误
  static handleNetworkError(error: any): void {
    this.error(
      '网络错误',
      '无法连接到服务器，请检查网络连接',
      error
    );
  }

  // 处理验证错误
  static handleValidationError(field: string, message: string): void {
    this.warning(
      '输入验证失败',
      `${field}: ${message}`,
      { field, message }
    );
  }

  // 处理权限错误
  static handlePermissionError(resource: string): void {
    this.error(
      '权限不足',
      `您没有权限访问或修改 ${resource}`,
      { resource }
    );
  }
}

// 错误类型常量
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  INVALID_INPUT: 'INVALID_INPUT',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
} as const;

// 错误消息模板
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ERROR_CODES.STORAGE_ERROR]: '数据存储失败，请检查浏览器存储权限',
  [ERROR_CODES.VALIDATION_ERROR]: '输入数据验证失败，请检查输入内容',
  [ERROR_CODES.PERMISSION_ERROR]: '权限不足，无法执行此操作',
  [ERROR_CODES.NOT_FOUND]: '请求的资源不存在',
  [ERROR_CODES.ALREADY_EXISTS]: '资源已存在，无法重复创建',
  [ERROR_CODES.INVALID_INPUT]: '输入数据格式不正确',
  [ERROR_CODES.TIMEOUT]: '操作超时，请稍后重试',
  [ERROR_CODES.UNKNOWN]: '发生未知错误，请稍后重试'
} as const; 