import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, GameSession, GameSystem } from '../../types';
import { ArrowLeft, Plus, X, Users, MessageCircle, Dice1, Map, Settings, Copy, Share2, LogIn } from 'lucide-react';
import { RoomCodeManager } from '../../utils/roomCode';
import './SessionRoom.css';

interface SessionRoomProps {
  currentUser: User;
  sessions: GameSession[];
  onUpdateSessions: (sessions: GameSession[]) => void;
}

const SessionRoom: React.FC<SessionRoomProps> = ({
  currentUser,
  sessions,
  onUpdateSessions,
}) => {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    gameSystem: {
      id: 'dnd5e',
      name: 'D&D 5e',
      version: '5.0',
      description: 'Dungeons & Dragons 5th Edition',
      diceNotation: 'd20',
      attributes: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
      skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Stealth', 'Survival']
    },
    maxPlayers: 6,
    isPublic: false
  });
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // 根据URL参数设置选中的会话
  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setSelectedSession(session);
      }
    }
  }, [sessionId, sessions]);

  // 获取现有房间码
  const existingRoomCodes = sessions.map(s => s.roomCode).filter(Boolean);

  // 创建新会话
  const createSession = () => {
    if (!newSession.name.trim()) return;

    const roomCode = RoomCodeManager.generateUniqueRoomCode('S', existingRoomCodes);

    const session: GameSession = {
      id: Date.now().toString(),
      name: newSession.name,
      description: newSession.description,
      gameSystem: newSession.gameSystem,
      gmId: currentUser.id,
      maxPlayers: newSession.maxPlayers,
      isPublic: newSession.isPublic,
      roomCode: roomCode,
      players: [{
        id: currentUser.id,
        userId: currentUser.id,
        username: currentUser.username,
        isGM: true,
        isOnline: true,
        joinedAt: new Date()
      }],
      status: 'preparing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [...sessions, session];
    onUpdateSessions(updatedSessions);
    setSelectedSession(session);
    setShowCreateForm(false);
    resetForm();
  };

  // 加入会话
  const joinSession = () => {
    if (!joinCode.trim()) {
      setJoinError('请输入房间码');
      return;
    }

    const parsedCode = RoomCodeManager.parseRoomCode(joinCode.trim());
    if (!parsedCode || parsedCode.type !== 'session') {
      setJoinError('无效的房间码格式');
      return;
    }

    const session = sessions.find(s => s.roomCode === joinCode.trim());
    if (!session) {
      setJoinError('房间不存在');
      return;
    }

    if (session.players.length >= session.maxPlayers) {
      setJoinError('房间已满');
      return;
    }

    // 检查是否已经在房间中
    const isAlreadyInRoom = session.players.some(p => p.userId === currentUser.id);
    if (isAlreadyInRoom) {
      setSelectedSession(session);
      setShowJoinForm(false);
      setJoinCode('');
      setJoinError('');
      return;
    }

    // 添加玩家到房间
    const updatedSession = {
      ...session,
      players: [...session.players, {
        id: currentUser.id,
        userId: currentUser.id,
        username: currentUser.username,
        isGM: false,
        isOnline: true,
        joinedAt: new Date()
      }],
      updatedAt: new Date()
    };

    const updatedSessions = sessions.map(s => 
      s.id === session.id ? updatedSession : s
    );
    onUpdateSessions(updatedSessions);
    setSelectedSession(updatedSession);
    setShowJoinForm(false);
    setJoinCode('');
    setJoinError('');
  };

  // 复制房间码
  const copyRoomCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    alert('房间码已复制到剪贴板！');
  };

  // 分享房间
  const shareRoom = (session: GameSession) => {
    const shareData = {
      title: `加入跑团会话: ${session.name}`,
      text: `房间码: ${session.roomCode}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyRoomCode(session.roomCode || '');
    }
  };

  // 重置表单
  const resetForm = () => {
    setNewSession({
      name: '',
      description: '',
      gameSystem: {
        id: 'dnd5e',
        name: 'D&D 5e',
        version: '5.0',
        description: 'Dungeons & Dragons 5th Edition',
        diceNotation: 'd20',
        attributes: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
        skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Stealth', 'Survival']
      },
      maxPlayers: 6,
      isPublic: false
    });
  };

  return (
    <div className="session-room">
      <header className="session-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          返回主页
        </Link>
        <h1>🎮 会话管理</h1>
        <div className="header-actions">
          <button 
            className="join-btn"
            onClick={() => setShowJoinForm(true)}
          >
            <LogIn size={20} />
            加入会话
          </button>
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            创建会话
          </button>
        </div>
      </header>

      <main className="session-main">
        {!selectedSession ? (
          <div className="sessions-list">
            <h2>我的会话</h2>
            {sessions.length > 0 ? (
              <div className="sessions-grid">
                {sessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <div className="session-icon">
                        {session.name.charAt(0)}
                      </div>
                      <div className="session-info">
                        <h3>{session.name}</h3>
                        <p>{session.description || '无描述'}</p>
                        <div className="session-meta">
                          <span className="room-code">房间码: {session.roomCode}</span>
                          <span className="player-count">
                            {session.players.length}/{session.maxPlayers} 人
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="session-actions">
                      <button 
                        onClick={() => copyRoomCode(session.roomCode || '')}
                        className="copy-btn"
                        title="复制房间码"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => shareRoom(session)}
                        className="share-btn"
                        title="分享房间"
                      >
                        <Share2 size={16} />
                      </button>
                      <button 
                        onClick={() => setSelectedSession(session)}
                        className="join-session-btn"
                      >
                        进入
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>还没有创建会话</p>
                <button onClick={() => setShowCreateForm(true)} className="create-btn">
                  <Plus size={16} />
                  创建第一个会话
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="session-detail">
            <div className="session-detail-header">
              <button 
                onClick={() => setSelectedSession(null)}
                className="back-btn"
              >
                <ArrowLeft size={20} />
                返回列表
              </button>
              <h2>{selectedSession.name}</h2>
              <div className="room-code-display">
                <span>房间码: {selectedSession.roomCode}</span>
                <button 
                  onClick={() => copyRoomCode(selectedSession.roomCode || '')}
                  className="copy-btn"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="session-content">
              <div className="players-panel">
                <h3>玩家列表</h3>
                <div className="players-list">
                  {selectedSession.players.map(player => (
                    <div key={player.id} className="player-item">
                      <div className="player-avatar">
                        {player.username.charAt(0)}
                      </div>
                      <div className="player-info">
                        <span className="player-name">{player.username}</span>
                        {player.isGM && <span className="gm-badge">GM</span>}
                      </div>
                      <div className="player-status">
                        {player.isOnline ? '在线' : '离线'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="session-tools">
                <button className="tool-btn">
                  <MessageCircle size={20} />
                  聊天
                </button>
                <button className="tool-btn">
                  <Dice1 size={20} />
                  骰子
                </button>
                <button className="tool-btn">
                  <Map size={20} />
                  地图
                </button>
                <button className="tool-btn">
                  <Settings size={20} />
                  设置
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 创建会话表单 */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>创建新会话</h3>
              <button 
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>会话名称</label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({...newSession, name: e.target.value})}
                  placeholder="输入会话名称"
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                  placeholder="输入会话描述"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>最大玩家数</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={newSession.maxPlayers}
                  onChange={(e) => setNewSession({...newSession, maxPlayers: parseInt(e.target.value) || 6})}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={newSession.isPublic}
                      onChange={(e) => setNewSession({...newSession, isPublic: e.target.checked})}
                    />
                    <span className="checkbox-text">
                      <span className="checkbox-title">公开会话</span>
                      <span className="checkbox-description">是否公开 - 公开的会话其他用户可以搜索和加入</span>
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={createSession} className="create-btn">
                创建会话
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 加入会话表单 */}
      {showJoinForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>加入会话</h3>
              <button 
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinCode('');
                  setJoinError('');
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>房间码</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value);
                    setJoinError('');
                  }}
                  placeholder="输入6位数字房间码"
                  maxLength={7}
                />
                {joinError && <div className="error-message">{joinError}</div>}
              </div>
              <div className="room-code-help">
                <p>💡 房间码格式: S123456 (S表示会话)</p>
                <p>💡 战役房间码格式: C123456 (C表示战役)</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={joinSession} className="join-btn">
                加入会话
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionRoom; 