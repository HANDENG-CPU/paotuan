const API_BASE_URL = 'http://localhost:3001/api';

// 通用API请求函数
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 认证相关API
export const authAPI = {
  // 用户注册
  register: async (username: string, password: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // 保存token
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    
    return response;
  },

  // 用户登录
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // 保存token
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    
    return response;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    return await apiRequest('/auth/me');
  },

  // 登出
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  },

  // 检查是否已登录
  isLoggedIn: () => {
    return !!localStorage.getItem('auth_token');
  },

  // 获取当前用户（从localStorage）
  getCurrentUserFromStorage: () => {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// 会话相关API
export const sessionAPI = {
  // 获取所有会话
  getSessions: async () => {
    return await apiRequest('/sessions');
  },

  // 创建会话
  createSession: async (name: string, description: string, gameSystem: string) => {
    return await apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({ name, description, gameSystem }),
    });
  },

  // 加入会话
  joinSession: async (sessionId: string) => {
    return await apiRequest(`/sessions/${sessionId}/join`, {
      method: 'POST',
    });
  },

  // 获取会话消息
  getMessages: async (sessionId: string) => {
    return await apiRequest(`/sessions/${sessionId}/messages`);
  },

  // 发送消息
  sendMessage: async (sessionId: string, message: string, messageType: string = 'user') => {
    return await apiRequest(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, messageType }),
    });
  },
};

// 错误处理
export const handleAPIError = (error: any) => {
  if (error.message.includes('401') || error.message.includes('403')) {
    // 认证失败，清除本地存储并重定向到登录页
    authAPI.logout();
    window.location.reload();
    return '登录已过期，请重新登录';
  }
  
  return error.message || '操作失败，请重试';
}; 