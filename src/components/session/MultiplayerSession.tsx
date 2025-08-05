import React, { useState, useEffect, useRef } from 'react';
import { User, GameSession, ChatMessage, DiceRoll } from '../../types';
import { WebRTCManager } from '../../utils/webrtc';
import { 
  Users, 
  Copy, 
  Share2, 
  MessageCircle, 
  Dice1, 
  Settings,
  UserPlus,
  UserCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import './MultiplayerSession.css';

interface MultiplayerSessionProps {
  currentUser: User;
  session: GameSession;
  onUpdateSession: (session: GameSession) => void;
}

interface Player {
  id: string;
  username: string;
  isGM: boolean;
  isOnline: boolean;
  lastSeen: Date;
}

const MultiplayerSession: React.FC<MultiplayerSessionProps> = ({
  currentUser,
  session,
  onUpdateSession
}) => {
  const [webrtc, setWebrtc] = useState<WebRTCManager | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [diceRolls, setDiceRolls] = useState<DiceRoll[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'hosting' | 'connected'>('disconnected');
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [showInvitation, setShowInvitation] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isGM, setIsGM] = useState(false);

  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 检查是否为GM
    setIsGM(session.gmId === currentUser.id);
    
    // 初始化WebRTC
    const rtc = new WebRTCManager();
    setWebrtc(rtc);

    // 设置消息处理
    rtc.onMessage((data) => {
      handleIncomingMessage(data);
    });

    // 如果是GM，创建邀请
    if (isGM) {
      createInvitation();
    }

    return () => {
      rtc.disconnect();
    };
  }, [isGM]);

  // 创建邀请
  const createInvitation = async () => {
    if (!webrtc) return;
    
    try {
      const invitation = await webrtc.createInvitation();
      const data = JSON.parse(invitation);
      setInvitationCode(data.invitationCode);
      setConnectionStatus('hosting');
    } catch (error) {
      console.error('创建邀请失败:', error);
    }
  };

  // 加入会话
  const joinSession = async () => {
    if (!joinCode.trim()) return;
    
    try {
      await webrtc?.joinSession(joinCode);
      setConnectionStatus('connected');
      setJoinCode('');
    } catch (error) {
      console.error('加入会话失败:', error);
      alert('加入会话失败，请检查邀请码是否正确');
    }
  };

  // 处理接收到的消息
  const handleIncomingMessage = (data: {
    type: string;
    message?: ChatMessage;
    roll?: DiceRoll;
    player?: Player;
    playerId?: string;
    action?: any;
  }) => {
    switch (data.type) {
      case 'chat':
        if (data.message) {
          setChatMessages(prev => [...prev, data.message!]);
        }
        break;
      case 'dice':
        if (data.roll) {
          setDiceRolls(prev => [...prev, data.roll!]);
        }
        break;
      case 'player_join':
        if (data.player) {
          setPlayers(prev => [...prev, data.player!]);
        }
        break;
      case 'player_leave':
        if (data.playerId) {
          setPlayers(prev => prev.filter(p => p.id !== data.playerId));
        }
        break;
      case 'gm_action':
        if (isGM && data.action) {
          // GM专用操作
          handleGMAction(data.action);
        }
        break;
    }
  };

  // 发送聊天消息
  const sendChatMessage = () => {
    if (!chatInputRef.current?.value.trim() || !webrtc) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      type: 'text',
      content: chatInputRef.current.value,
      timestamp: new Date()
    };

    webrtc.sendMessage({
      type: 'chat',
      message
    });

    setChatMessages(prev => [...prev, message]);
    chatInputRef.current.value = '';
  };

  // 发送骰子结果
  const sendDiceRoll = (roll: DiceRoll) => {
    if (!webrtc) return;

    webrtc.sendMessage({
      type: 'dice',
      roll
    });

    setDiceRolls(prev => [...prev, roll]);
  };

  // GM操作处理
  const handleGMAction = (action: any) => {
    switch (action.type) {
      case 'reveal_map':
        // 显示地图
        break;
      case 'control_weather':
        // 控制天气
        break;
      case 'spawn_npc':
        // 生成NPC
        break;
    }
  };

  // 复制邀请码
  const copyInvitationCode = () => {
    navigator.clipboard.writeText(invitationCode);
    alert('邀请码已复制到剪贴板！');
  };

  // 分享邀请链接
  const shareInvitation = () => {
    const shareData = {
      title: `加入跑团会话: ${session.name}`,
      text: `邀请码: ${invitationCode}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyInvitationCode();
    }
  };

  return (
    <div className="multiplayer-session">
      <header className="session-header">
        <div className="session-info">
          <h1>{session.name}</h1>
          <p>{session.description}</p>
        </div>
        
        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>
              {connectionStatus === 'connected' ? '已连接' :
               connectionStatus === 'hosting' ? '等待加入' : '未连接'}
            </span>
          </div>
          
          {isGM && (
            <button onClick={() => setShowInvitation(true)} className="invite-btn">
              <UserPlus size={16} />
              邀请玩家
            </button>
          )}
        </div>
      </header>

      <div className="session-content">
        <aside className="players-sidebar">
          <div className="players-header">
            <h3>玩家列表</h3>
            <span className="player-count">{players.length + 1}</span>
          </div>
          
          <div className="players-list">
            {players.map(player => (
              <div key={player.id} className={`player-item ${player.isOnline ? 'online' : 'offline'}`}>
                <div className="player-avatar">
                  {player.username.charAt(0)}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.username}</span>
                  {player.isGM && <span className="gm-badge">GM</span>}
                </div>
                <div className="player-status">
                  {player.isOnline ? <UserCheck size={12} /> : <WifiOff size={12} />}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="session-main">
          <div className="chat-section">
            <div className="chat-messages">
              {chatMessages.map(message => (
                <div key={message.id} className={`message ${message.userId === currentUser.id ? 'own' : 'other'}`}>
                  <div className="message-header">
                    <span className="message-username">{message.username}</span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="输入消息..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              />
              <button onClick={sendChatMessage}>
                <MessageCircle size={16} />
              </button>
            </div>
          </div>

          <div className="dice-section">
            <h3>骰子记录</h3>
            <div className="dice-rolls">
              {diceRolls.map(roll => (
                <div key={roll.id} className="dice-roll">
                  <span className="roll-user">{roll.username}</span>
                  <span className="roll-notation">{roll.notation}</span>
                  <span className="roll-result">= {roll.result}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* 邀请模态框 */}
      {showInvitation && (
        <div className="invitation-modal">
          <div className="modal-content">
            <h3>邀请玩家加入</h3>
            <div className="invitation-code">
              <span>邀请码: {invitationCode}</span>
              <button onClick={copyInvitationCode}>
                <Copy size={16} />
                复制
              </button>
            </div>
            <button onClick={shareInvitation} className="share-btn">
              <Share2 size={16} />
              分享邀请
            </button>
            <button onClick={() => setShowInvitation(false)} className="close-btn">
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 加入会话模态框 */}
      {!isGM && connectionStatus === 'disconnected' && (
        <div className="join-modal">
          <div className="modal-content">
            <h3>加入会话</h3>
            <div className="join-form">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="输入邀请码"
              />
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

export default MultiplayerSession; 