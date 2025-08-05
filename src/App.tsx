import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, GameSession, Character, Campaign, Map, GameRule, GachaEvent, GachaRecord } from './types';
import { loadUsers, saveUsers, loadSessions, saveSessions, loadCharacters, saveCharacters, loadCampaigns, saveCampaigns, loadMaps, saveMaps, loadRules, saveRules, loadGachaEvents, saveGachaEvents, loadGachaRecords, saveGachaRecords } from './utils/rpgStorage';
import { loadCurrentUser, saveCurrentUser } from './utils/rpgStorage';
import { ErrorHandler, AppError } from './utils/errorHandler';
import { LoadingManager, LoadingState } from './utils/loadingManager';

// 组件导入
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import SessionRoom from './components/session/SessionRoom';
import CharacterManager from './components/character/CharacterManager';
import CampaignManager from './components/campaign/CampaignManager';
import MapEditor from './components/map/MapEditor';
import RuleBook from './components/rules/RuleBook';
import GachaSystem from './components/gacha/GachaSystem';
import ErrorDisplay from './components/common/ErrorDisplay';
import LoadingOverlay from './components/common/LoadingOverlay';

import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [rules, setRules] = useState<GameRule[]>([]);
  const [gachaEvents, setGachaEvents] = useState<GachaEvent[]>([]);
  const [gachaRecords, setGachaRecords] = useState<GachaRecord[]>([]);
  
  // 错误和加载状态
  const [errors, setErrors] = useState<AppError[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  // 初始化错误和加载状态监听器
  useEffect(() => {
    const handleErrors = (newErrors: AppError[]) => {
      setErrors(newErrors);
    };

    const handleLoadingStates = (newLoadingStates: LoadingState[]) => {
      setLoadingStates(newLoadingStates);
    };

    ErrorHandler.addListener(handleErrors);
    LoadingManager.addListener(handleLoadingStates);

    return () => {
      ErrorHandler.removeListener(handleErrors);
      LoadingManager.removeListener(handleLoadingStates);
    };
  }, []);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      LoadingManager.startLoading('data_loading', '正在加载数据...');
      
      try {
        const savedUsers = loadUsers();
        const savedSessions = loadSessions();
        const savedCharacters = loadCharacters();
        const savedCampaigns = loadCampaigns();
        const savedMaps = loadMaps();
        const savedRules = loadRules();
        const savedGachaEvents = loadGachaEvents();
        const savedGachaRecords = loadGachaRecords();
        const savedCurrentUser = loadCurrentUser();

        setUsers(savedUsers);
        setSessions(savedSessions);
        setCharacters(savedCharacters);
        setCampaigns(savedCampaigns);
        setMaps(savedMaps);
        setRules(savedRules);
        setGachaEvents(savedGachaEvents);
        setGachaRecords(savedGachaRecords);
        
        if (savedCurrentUser) {
          setCurrentUser(savedCurrentUser);
        }
        
        LoadingManager.stopLoading('data_loading');
      } catch (error) {
        LoadingManager.stopLoading('data_loading');
        ErrorHandler.error('数据加载失败', '无法加载应用数据', error);
      }
    };

    initializeData();
  }, []);

  // 保存数据
  useEffect(() => {
    if (users.length > 0) {
      try {
        saveUsers(users);
      } catch (error) {
        ErrorHandler.handleStorageError('保存用户数据', error);
      }
    }
  }, [users]);

  useEffect(() => {
    if (sessions.length > 0) {
      try {
        saveSessions(sessions);
      } catch (error) {
        ErrorHandler.handleStorageError('保存会话数据', error);
      }
    }
  }, [sessions]);

  useEffect(() => {
    if (characters.length > 0) {
      try {
        saveCharacters(characters);
      } catch (error) {
        ErrorHandler.handleStorageError('保存角色数据', error);
      }
    }
  }, [characters]);

  useEffect(() => {
    if (campaigns.length > 0) {
      try {
        saveCampaigns(campaigns);
      } catch (error) {
        ErrorHandler.handleStorageError('保存战役数据', error);
      }
    }
  }, [campaigns]);

  useEffect(() => {
    if (maps.length > 0) {
      try {
        saveMaps(maps);
      } catch (error) {
        ErrorHandler.handleStorageError('保存地图数据', error);
      }
    }
  }, [maps]);

  useEffect(() => {
    if (rules.length > 0) {
      try {
        saveRules(rules);
      } catch (error) {
        ErrorHandler.handleStorageError('保存规则数据', error);
      }
    }
  }, [rules]);

  useEffect(() => {
    if (gachaEvents.length > 0) {
      try {
        saveGachaEvents(gachaEvents);
      } catch (error) {
        ErrorHandler.handleStorageError('保存抽卡事件数据', error);
      }
    }
  }, [gachaEvents]);

  useEffect(() => {
    if (gachaRecords.length > 0) {
      try {
        saveGachaRecords(gachaRecords);
      } catch (error) {
        ErrorHandler.handleStorageError('保存抽卡记录数据', error);
      }
    }
  }, [gachaRecords]);

  useEffect(() => {
    if (currentUser) {
      try {
        saveCurrentUser(currentUser);
      } catch (error) {
        ErrorHandler.handleStorageError('保存当前用户数据', error);
      }
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    LoadingManager.startLoading('user_login', '正在登录...');
    
    try {
      setCurrentUser(user);
      
      // 如果用户不存在，添加到用户列表
      if (!users.find(u => u.id === user.id)) {
        setUsers(prev => [...prev, user]);
      }
      
      LoadingManager.stopLoading('user_login');
    } catch (error) {
      LoadingManager.stopLoading('user_login');
      ErrorHandler.error('登录失败', '无法完成登录操作', error);
    }
  };

  const handleLogout = () => {
    LoadingManager.startLoading('user_logout', '正在退出...');
    
    try {
      setCurrentUser(null);
      LoadingManager.stopLoading('user_logout');
    } catch (error) {
      LoadingManager.stopLoading('user_logout');
      ErrorHandler.error('退出失败', '无法完成退出操作', error);
    }
  };

  const handleClearError = (errorId: string) => {
    ErrorHandler.clearError(errorId);
  };

  const handleClearAllErrors = () => {
    ErrorHandler.clearAllErrors();
  };

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ErrorDisplay 
          errors={errors}
          onClearError={handleClearError}
          onClearAll={handleClearAllErrors}
        />
        <LoadingOverlay loadingStates={loadingStates} />
      </>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="app-title">
            <h1>🎲 轮回者大街</h1>
          </div>
          <nav className="app-nav">
            <div className="user-info">
              <span>欢迎, {currentUser.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                退出
              </button>
            </div>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  currentUser={currentUser}
                  sessions={sessions}
                  characters={characters}
                  campaigns={campaigns}
                />
              } 
            />
            
            <Route 
              path="/sessions" 
              element={
                <SessionRoom 
                  currentUser={currentUser}
                  sessions={sessions}
                  onUpdateSessions={setSessions}
                />
              } 
            />
            
            <Route 
              path="/characters" 
              element={
                <CharacterManager 
                  currentUser={currentUser}
                  characters={characters}
                  onUpdateCharacters={setCharacters}
                />
              } 
            />
            
            <Route 
              path="/campaigns" 
              element={
                <CampaignManager 
                  currentUser={currentUser}
                  campaigns={campaigns}
                  characters={characters}
                  onUpdateCampaigns={setCampaigns}
                  onUpdateCharacters={setCharacters}
                />
              } 
            />
            
            <Route 
              path="/maps" 
              element={
                <MapEditor 
                  currentUser={currentUser}
                  maps={maps}
                  onUpdateMaps={setMaps}
                />
              } 
            />
            
            <Route 
              path="/rules" 
              element={
                <RuleBook 
                  currentUser={currentUser}
                  rules={rules}
                  onUpdateRules={setRules}
                />
              } 
            />
            
            <Route 
              path="/gacha" 
              element={
                <GachaSystem 
                  currentUser={currentUser}
                  events={gachaEvents}
                  records={gachaRecords}
                  onUpdateEvents={setGachaEvents}
                  onUpdateRecords={setGachaRecords}
                />
              } 
            />
            
            {/* 详情页面路由 */}
            <Route 
              path="/session/:sessionId" 
              element={
                <SessionRoom 
                  currentUser={currentUser}
                  sessions={sessions}
                  onUpdateSessions={setSessions}
                />
              } 
            />
            
            <Route 
              path="/campaign/:campaignId" 
              element={
                <CampaignManager 
                  currentUser={currentUser}
                  campaigns={campaigns}
                  characters={characters}
                  onUpdateCampaigns={setCampaigns}
                  onUpdateCharacters={setCharacters}
                />
              } 
            />
            
            <Route 
              path="/map/:mapId" 
              element={
                <MapEditor 
                  currentUser={currentUser}
                  maps={maps}
                  onUpdateMaps={setMaps}
                />
              } 
            />
            
            <Route 
              path="/rule/:ruleId" 
              element={
                <RuleBook 
                  currentUser={currentUser}
                  rules={rules}
                  onUpdateRules={setRules}
                />
              } 
            />
            
            <Route 
              path="/gacha/:eventId" 
              element={
                <GachaSystem 
                  currentUser={currentUser}
                  events={gachaEvents}
                  records={gachaRecords}
                  onUpdateEvents={setGachaEvents}
                  onUpdateRecords={setGachaRecords}
                />
              } 
            />
            
            {/* 默认重定向到主页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* 全局错误显示 */}
        <ErrorDisplay 
          errors={errors}
          onClearError={handleClearError}
          onClearAll={handleClearAllErrors}
        />
        
        {/* 全局加载覆盖层 */}
        <LoadingOverlay loadingStates={loadingStates} />
      </div>
    </Router>
  );
}

export default App; 