import React from 'react';
import { Link } from 'react-router-dom';
import { User, GameSession, Character, Campaign } from '../../types';
import { 
  Play, 
  BookOpen, 
  Users, 
  Square, 
  Plus, 
  Map, 
  FileText, 
  Gift,
  User as UserIcon
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  currentUser: User;
  sessions: GameSession[];
  characters: Character[];
  campaigns: Campaign[];
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  sessions,
  characters,
  campaigns
}) => {
  const ongoingSessions = sessions.filter(s => s.status === 'active');
  const totalSessions = sessions.length;
  const totalCharacters = characters.length;
  const totalCampaigns = campaigns.length;

  const recentSessions = sessions.slice(-3);
  const userCharacters = characters.filter(c => c.id.includes(currentUser.id));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-greeting">
          <div className="user-info">
            <UserIcon size={24} />
            <div>
              <h1>欢迎回来, {currentUser.username}!</h1>
              <p>准备好开始你的冒险了吗?</p>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* 统计卡片 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Play size={24} />
            </div>
            <div className="stat-number">{ongoingSessions.length}</div>
            <div className="stat-label">进行中的会话</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-number">{totalCampaigns}</div>
            <div className="stat-label">战役</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-number">{totalCharacters}</div>
            <div className="stat-label">角色</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Square size={24} />
            </div>
            <div className="stat-number">{totalSessions}</div>
            <div className="stat-label">总会话</div>
          </div>
        </div>

        {/* 快速开始 */}
        <section className="quick-start">
          <h2 className="section-title">
            <Plus size={24} />
            快速开始
          </h2>
          
          <div className="quick-start-grid">
            <Link to="/sessions" className="quick-start-btn">
              <div className="quick-start-icon">
                <Plus size={20} />
              </div>
              <span>创建新会话</span>
            </Link>
            
            <Link to="/characters" className="quick-start-btn">
              <div className="quick-start-icon">
                <Users size={20} />
              </div>
              <span>管理角色</span>
            </Link>
            
            <Link to="/campaigns" className="quick-start-btn">
              <div className="quick-start-icon">
                <BookOpen size={20} />
              </div>
              <span>管理战役</span>
            </Link>
            
            <Link to="/maps" className="quick-start-btn">
              <div className="quick-start-icon">
                <Map size={20} />
              </div>
              <span>地图编辑器</span>
            </Link>
            
            <Link to="/rules" className="quick-start-btn">
              <div className="quick-start-icon">
                <FileText size={20} />
              </div>
              <span>规则书</span>
            </Link>
            
            <Link to="/gacha" className="quick-start-btn">
              <div className="quick-start-icon">
                <Gift size={20} />
              </div>
              <span>抽卡系统</span>
            </Link>
          </div>
        </section>

        {/* 最近的会话 */}
        <section className="recent-section">
          <div className="section-header">
            <h3>最近的会话</h3>
            <Link to="/sessions" className="view-all-btn">
              查看全部
            </Link>
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="sessions-grid">
              {recentSessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-icon">
                      {session.name.charAt(0)}
                    </div>
                    <div className="session-info">
                      <h4>{session.name}</h4>
                      <div className="session-status">
                        {session.description || '无描述'}
                      </div>
                    </div>
                  </div>
                  <div className="session-actions">
                    <Link to={`/session/${session.id}`} className="join-btn">
                      加入
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>还没有创建会话</p>
              <Link to="/session" className="create-btn">
                <Plus size={16} />
                创建会话
              </Link>
            </div>
          )}
        </section>

        {/* 你的角色 */}
        <section className="recent-section">
          <div className="section-header">
            <h3>你的角色</h3>
            <Link to="/characters" className="view-all-btn">
              查看全部
            </Link>
          </div>
          
          {userCharacters.length > 0 ? (
            <div className="sessions-grid">
              {userCharacters.slice(0, 3).map(character => (
                <div key={character.id} className="session-card">
                  <div className="session-header">
                    <div className="session-icon">
                      {character.name.charAt(0)}
                    </div>
                    <div className="session-info">
                      <h4>{character.name}</h4>
                      <div className="session-status">
                        {character.race} {character.class} - 等级 {character.level}
                      </div>
                    </div>
                  </div>
                  <div className="session-actions">
                    <Link to={`/characters/${character.id}`} className="join-btn">
                      查看
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>还没有创建角色</p>
              <Link to="/characters" className="create-btn">
                <Plus size={16} />
                创建角色
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 