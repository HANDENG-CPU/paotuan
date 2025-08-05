import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { saveCurrentUser, saveUsers, loadUsers, loadCurrentUser } from '../../utils/rpgStorage';
import { User as UserIcon, Sword, Shield, BookOpen, LogIn, UserPlus } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    // 加载最近登录的用户
    const users = loadUsers();
    setRecentUsers(users.slice(-5)); // 显示最近5个用户
    
    // 尝试自动登录
    const currentUser = loadCurrentUser();
    if (currentUser) {
      onLogin(currentUser);
    }
  }, [onLogin]);

  const handleLogin = () => {
    if (!username.trim()) {
      alert('请输入用户名');
      return;
    }

    const users = loadUsers();
    let user = users.find(u => u.username === username);

    if (!user) {
      if (!isCreating) {
        alert('用户不存在，请勾选"创建新用户"');
        return;
      }
      
      // 创建新用户
      user = {
        id: uuidv4(),
        username: username.trim(),
        createdAt: new Date(),
      };
      
      users.push(user);
      saveUsers(users);
    }

    saveCurrentUser(user);
    onLogin(user);
  };

  const handleQuickLogin = (user: User) => {
    setUsername(user.username);
    setIsCreating(false);
    saveCurrentUser(user);
    onLogin(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('rpg_current_user');
    window.location.reload();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <Sword size={48} />
            <h1>轮回者大街</h1>
          </div>
          <p className="subtitle">你的桌面角色扮演游戏伙伴</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <UserIcon size={20} />
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入你的用户名"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isCreating}
                onChange={(e) => setIsCreating(e.target.checked)}
              />
              创建新用户
            </label>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            {isCreating ? (
              <>
                <UserPlus size={20} />
                创建并登录
              </>
            ) : (
              <>
                <LogIn size={20} />
                登录
              </>
            )}
          </button>
        </div>

        {recentUsers.length > 0 && (
          <div className="recent-users">
            <h3>最近登录的用户</h3>
            <div className="user-list">
              {recentUsers.map(user => (
                <button
                  key={user.id}
                  className="user-item"
                  onClick={() => handleQuickLogin(user)}
                >
                  <UserIcon size={16} />
                  {user.username}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="features">
          <div className="feature">
            <Shield size={24} />
            <span>角色管理</span>
          </div>
          <div className="feature">
            <BookOpen size={24} />
            <span>战役管理</span>
          </div>
          <div className="feature">
            <Sword size={24} />
            <span>在线跑团</span>
          </div>
        </div>

        <div className="storage-info">
          <p>💡 提示：数据存储在浏览器本地，清除浏览器数据会丢失信息</p>
          <button className="clear-data-btn" onClick={handleLogout}>
            清除登录状态
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 