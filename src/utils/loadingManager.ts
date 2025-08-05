// 加载状态管理
export interface LoadingState {
  id: string;
  isLoading: boolean;
  message?: string;
  progress?: number;
  timestamp: Date;
}

export class LoadingManager {
  private static loadingStates: Map<string, LoadingState> = new Map();
  private static listeners: ((states: LoadingState[]) => void)[] = [];

  // 开始加载
  static startLoading(id: string, message?: string): void {
    const state: LoadingState = {
      id,
      isLoading: true,
      message,
      timestamp: new Date()
    };
    
    this.loadingStates.set(id, state);
    this.notifyListeners();
  }

  // 更新加载进度
  static updateProgress(id: string, progress: number, message?: string): void {
    const state = this.loadingStates.get(id);
    if (state) {
      state.progress = progress;
      if (message) state.message = message;
      this.notifyListeners();
    }
  }

  // 结束加载
  static stopLoading(id: string): void {
    this.loadingStates.delete(id);
    this.notifyListeners();
  }

  // 获取加载状态
  static getLoadingState(id: string): LoadingState | undefined {
    return this.loadingStates.get(id);
  }

  // 获取所有加载状态
  static getAllLoadingStates(): LoadingState[] {
    return Array.from(this.loadingStates.values());
  }

  // 检查是否有任何加载状态
  static hasAnyLoading(): boolean {
    return this.loadingStates.size > 0;
  }

  // 添加监听器
  static addListener(listener: (states: LoadingState[]) => void): void {
    this.listeners.push(listener);
  }

  // 移除监听器
  static removeListener(listener: (states: LoadingState[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知监听器
  private static notifyListeners(): void {
    const states = this.getAllLoadingStates();
    this.listeners.forEach(listener => listener(states));
  }

  // 处理异步操作
  static async withLoading<T>(
    id: string,
    operation: Promise<T>,
    message?: string
  ): Promise<T> {
    this.startLoading(id, message);
    
    try {
      const result = await operation;
      this.stopLoading(id);
      return result;
    } catch (error) {
      this.stopLoading(id);
      throw error;
    }
  }

  // 处理带进度的异步操作
  static async withProgress<T>(
    id: string,
    operation: (updateProgress: (progress: number, message?: string) => void) => Promise<T>,
    initialMessage?: string
  ): Promise<T> {
    this.startLoading(id, initialMessage);
    
    try {
      const updateProgress = (progress: number, message?: string) => {
        this.updateProgress(id, progress, message);
      };
      
      const result = await operation(updateProgress);
      this.stopLoading(id);
      return result;
    } catch (error) {
      this.stopLoading(id);
      throw error;
    }
  }
}

// 预定义的加载ID
export const LOADING_IDS = {
  // 数据加载
  DATA_LOADING: 'data_loading',
  DATA_SAVING: 'data_saving',
  
  // 文件操作
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  
  // 网络请求
  API_REQUEST: 'api_request',
  
  // 用户操作
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // 会话操作
  SESSION_CREATE: 'session_create',
  SESSION_JOIN: 'session_join',
  
  // 战役操作
  CAMPAIGN_CREATE: 'campaign_create',
  CAMPAIGN_JOIN: 'campaign_join',
  
  // 角色操作
  CHARACTER_CREATE: 'character_create',
  CHARACTER_UPDATE: 'character_update',
  
  // 地图操作
  MAP_CREATE: 'map_create',
  MAP_UPDATE: 'map_update',
  
  // 规则操作
  RULE_CREATE: 'rule_create',
  RULE_UPDATE: 'rule_update',
  
  // 抽卡操作
  GACHA_DRAW: 'gacha_draw',
  GACHA_CREATE: 'gacha_create'
} as const; 