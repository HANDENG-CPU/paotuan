import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Campaign, Character, NPC, PlotPoint, NPCFile, GameSystem } from '../../types';
import { ArrowLeft, Plus, X, Trash2, Upload, File, Image, FileText, Music, Eye, Users, Calendar, BookOpen, Settings, MessageSquare, Download, LogIn, Copy, Share2 } from 'lucide-react';
import './CampaignManager.css';
import { RoomCodeManager } from '../../utils/roomCode';

interface CampaignManagerProps {
  currentUser: User;
  campaigns: Campaign[];
  characters: Character[];
  onUpdateCampaigns: (campaigns: Campaign[]) => void;
  onUpdateCharacters: (characters: Character[]) => void;
}

interface CampaignForm {
  name: string;
  description: string;
  gameSystem: GameSystem;
  maxPlayers: number;
  isPublic: boolean;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({
  currentUser,
  campaigns,
  characters,
  onUpdateCampaigns,
  onUpdateCharacters,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'npcs' | 'plot' | 'notes' | 'sessions'>('overview');
  const [showNPCForm, setShowNPCForm] = useState(false);
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  
  const [newCampaign, setNewCampaign] = useState<CampaignForm>({
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

  // 获取现有房间码
  const existingRoomCodes = campaigns.map(c => c.roomCode).filter(Boolean);

  // 创建新战役
  const createCampaign = () => {
    if (!newCampaign.name.trim()) return;

    const roomCode = RoomCodeManager.generateUniqueRoomCode('C', existingRoomCodes);

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      description: newCampaign.description,
      gameSystem: newCampaign.gameSystem,
      gmId: currentUser.id,
      maxPlayers: newCampaign.maxPlayers,
      isPublic: newCampaign.isPublic,
      roomCode: roomCode,
      sessions: [],
      characters: [],
      notes: [],
      npcs: [],
      plotPoints: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCampaigns = [...campaigns, campaign];
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(campaign);
    setShowCreateForm(false);
    resetCampaignForm();
  };

  // 加入战役
  const joinCampaign = () => {
    if (!joinCode.trim()) {
      setJoinError('请输入房间码');
      return;
    }

    const parsedCode = RoomCodeManager.parseRoomCode(joinCode.trim());
    if (!parsedCode || parsedCode.type !== 'campaign') {
      setJoinError('无效的房间码格式');
      return;
    }

    const campaign = campaigns.find(c => c.roomCode === joinCode.trim());
    if (!campaign) {
      setJoinError('战役不存在');
      return;
    }

    if (campaign.characters.length >= campaign.maxPlayers) {
      setJoinError('战役已满');
      return;
    }

    // 检查是否已经在战役中
    const isAlreadyInCampaign = campaign.characters.some(c => c.id.includes(currentUser.id));
    if (isAlreadyInCampaign) {
      setSelectedCampaign(campaign);
      setShowJoinForm(false);
      setJoinCode('');
      setJoinError('');
      return;
    }

    // 添加到战役
    const updatedCampaign = {
      ...campaign,
      characters: [...campaign.characters],
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => 
      c.id === campaign.id ? updatedCampaign : c
    );
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
    setShowJoinForm(false);
    setJoinCode('');
    setJoinError('');
  };

  // 复制房间码
  const copyRoomCode = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    alert('房间码已复制到剪贴板！');
  };

  // 分享战役
  const shareCampaign = (campaign: Campaign) => {
    const shareData = {
      title: `加入战役: ${campaign.name}`,
      text: `房间码: ${campaign.roomCode}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyRoomCode(campaign.roomCode || '');
    }
  };

  const [newNPC, setNewNPC] = useState({
    name: '',
    description: '',
    role: '',
    location: '',
    isAlive: true,
    files: [] as NPCFile[]
  });

  const [newPlotPoint, setNewPlotPoint] = useState({
    title: '',
    description: '',
    chapter: 1,
    isCompleted: false
  });

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });

  // 添加NPC
  const addNPC = () => {
    if (!selectedCampaign || !newNPC.name.trim()) return;

    const npc: NPC = {
      id: Date.now().toString(),
      name: newNPC.name,
      description: newNPC.description,
      role: newNPC.role,
      location: newNPC.location,
      isAlive: newNPC.isAlive,
      files: newNPC.files
    };

    const updatedCampaign = {
      ...selectedCampaign,
      npcs: [...(selectedCampaign.npcs || []), npc],
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
    setShowNPCForm(false);
    resetNPCForm();
  };

  // 添加剧情点
  const addPlotPoint = () => {
    if (!selectedCampaign || !newPlotPoint.title.trim()) return;

    const plotPoint: PlotPoint = {
      id: Date.now().toString(),
      title: newPlotPoint.title,
      description: newPlotPoint.description,
      chapter: newPlotPoint.chapter,
      isCompleted: newPlotPoint.isCompleted
    };

    const updatedCampaign = {
      ...selectedCampaign,
      plotPoints: [...(selectedCampaign.plotPoints || []), plotPoint],
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
    setShowPlotForm(false);
    resetPlotForm();
  };

  // 添加笔记
  const addNote = () => {
    if (!selectedCampaign || !newNote.title.trim()) return;

    const note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      tags: newNote.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCampaign = {
      ...selectedCampaign,
      notes: [...(selectedCampaign.notes || []), note],
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
    setShowNoteForm(false);
    resetNoteForm();
  };

  // 删除战役
  const deleteCampaign = (campaignId: string) => {
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    onUpdateCampaigns(updatedCampaigns);
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign(null);
    }
  };

  // 删除NPC
  const deleteNPC = (npcId: string) => {
    if (!selectedCampaign) return;

    const updatedCampaign = {
      ...selectedCampaign,
      npcs: (selectedCampaign.npcs || []).filter(n => n.id !== npcId),
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
  };

  // 删除剧情点
  const deletePlotPoint = (plotId: string) => {
    if (!selectedCampaign) return;

    const updatedCampaign = {
      ...selectedCampaign,
      plotPoints: (selectedCampaign.plotPoints || []).filter(p => p.id !== plotId),
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
  };

  // 删除笔记
  const deleteNote = (noteId: string) => {
    if (!selectedCampaign) return;

    const updatedCampaign = {
      ...selectedCampaign,
      notes: (selectedCampaign.notes || []).filter(n => n.id !== noteId),
      updatedAt: new Date()
    };

    const updatedCampaigns = campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c);
    onUpdateCampaigns(updatedCampaigns);
    setSelectedCampaign(updatedCampaign);
  };

  const resetCampaignForm = () => {
    setNewCampaign({
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

  const resetNPCForm = () => {
    setNewNPC({
      name: '',
      description: '',
      role: '',
      location: '',
      isAlive: true,
      files: []
    });
  };

  const resetPlotForm = () => {
    setNewPlotPoint({
      title: '',
      description: '',
      chapter: 1,
      isCompleted: false
    });
  };

  const resetNoteForm = () => {
    setNewNote({
      title: '',
      content: '',
      category: 'general',
      tags: []
    });
  };

  // 文件上传处理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const fileType = getFileType(file.type);
        
        const npcFile: NPCFile = {
          id: fileId,
          name: file.name,
          type: fileType,
          url: e.target?.result as string,
          size: file.size,
          uploadedAt: new Date()
        };

        setNewNPC(prev => ({
          ...prev,
          files: [...prev.files, npcFile]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // 获取文件类型
  const getFileType = (mimeType: string): 'image' | 'document' | 'audio' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };

  // 删除文件
  const removeFile = (fileId: string) => {
    setNewNPC(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
  };

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={16} />;
      case 'document': return <FileText size={16} />;
      case 'audio': return <Music size={16} />;
      default: return <File size={16} />;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 文件预览处理
  const [previewFile, setPreviewFile] = useState<NPCFile | null>(null);

  const openFilePreview = (file: NPCFile) => {
    setPreviewFile(file);
  };

  const closeFilePreview = () => {
    setPreviewFile(null);
  };

  // 下载文件
  const downloadFile = (file: NPCFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 如果没有选择战役，显示战役列表
  if (!selectedCampaign) {
    return (
      <div className="campaign-manager">
        <header className="campaign-header">
          <Link to="/" className="back-btn">
            <ArrowLeft size={20} />
            返回主页
          </Link>
          <h1>📚 战役管理</h1>
          <div className="header-actions">
          <button 
              className="join-btn"
              onClick={() => setShowJoinForm(true)}
            >
              <LogIn size={20} />
              加入战役
            </button>
            <button 
              className="create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            创建战役
          </button>
          </div>
        </header>
        
        <main className="campaign-main">
          {!selectedCampaign ? (
            <div className="campaigns-list">
              <h2>我的战役</h2>
              {campaigns.length > 0 ? (
                <div className="campaigns-grid">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-card">
                      <div className="campaign-header">
                        <div className="campaign-icon">
                          {campaign.name.charAt(0)}
                        </div>
                        <div className="campaign-info">
                          <h3>{campaign.name}</h3>
                          <p>{campaign.description || '无描述'}</p>
                          <div className="campaign-meta">
                            <span className="room-code">房间码: {campaign.roomCode}</span>
                            <span className="player-count">
                              {campaign.characters.length}/{campaign.maxPlayers} 人
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="campaign-actions">
                        <button 
                          onClick={() => copyRoomCode(campaign.roomCode || '')}
                          className="copy-btn"
                          title="复制房间码"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          onClick={() => shareCampaign(campaign)}
                          className="share-btn"
                          title="分享战役"
                        >
                          <Share2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedCampaign(campaign)}
                          className="join-campaign-btn"
                        >
                          进入
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>还没有创建战役</p>
                  <button onClick={() => setShowCreateForm(true)} className="create-btn">
                    <Plus size={16} />
                    创建第一个战役
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="campaign-detail">
              <div className="campaign-detail-header">
                <button 
                  onClick={() => setSelectedCampaign(null)}
                  className="back-btn"
                >
                  <ArrowLeft size={20} />
                  返回列表
                </button>
                <h2>{selectedCampaign?.name || '战役详情'}</h2>
                <div className="room-code-display">
                  <span>房间码: {selectedCampaign?.roomCode || '未设置'}</span>
                  <button 
                    onClick={() => copyRoomCode(selectedCampaign?.roomCode || '')}
                    className="copy-btn"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="campaign-content">
                {/* 原有的战役内容 */}
              </div>
            </div>
          )}
        </main>

        {/* 创建战役表单 */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>创建新战役</h3>
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    resetCampaignForm();
                  }}
                  className="close-btn"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>战役名称</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    placeholder="输入战役名称"
                  />
                </div>
                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="输入战役描述"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>游戏系统</label>
                  <select
                    value={newCampaign.gameSystem.id}
                    onChange={(e) => setNewCampaign({...newCampaign, gameSystem: {
                      ...newCampaign.gameSystem,
                      id: e.target.value
                    }})}
                  >
                    <option value="dnd5e">D&D 5e</option>
                    <option value="pathfinder2e">Pathfinder 2e</option>
                    <option value="callofcthulhu">Call of Cthulhu</option>
                    <option value="starfinder">Starfinder</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>最大玩家数</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={newCampaign.maxPlayers}
                    onChange={(e) => setNewCampaign({...newCampaign, maxPlayers: parseInt(e.target.value) || 6})}
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={newCampaign.isPublic}
                      onChange={(e) => setNewCampaign({...newCampaign, isPublic: e.target.checked})}
                    />
                      <span className="checkbox-text">
                        <span className="checkbox-title">公开战役</span>
                        <span className="checkbox-description">是否公开 - 公开的战役其他用户可以搜索和加入</span>
                      </span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={createCampaign} className="create-btn">
                  创建战役
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 加入战役表单 */}
        {showJoinForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>加入战役</h3>
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
                  <p>💡 房间码格式: C123456 (C表示战役)</p>
                  <p>�� 会话房间码格式: S123456 (S表示会话)</p>
                      </div>
                        </div>
              <div className="modal-footer">
                <button onClick={joinCampaign} className="join-btn">
                  加入战役
                </button>
                        </div>
                        </div>
                </div>
              )}
      </div>
    );
  }

  // 战役详情界面
  return (
    <div className="campaign-manager">
      <header className="campaign-header">
        <div className="campaign-title">
          <Link to="/campaigns" className="back-btn">
            <ArrowLeft size={20} />
            返回列表
          </Link>
          <div>
            <h1>{selectedCampaign.name}</h1>
            <p>{selectedCampaign.description}</p>
          </div>
        </div>
        <div className="campaign-controls">
          <button className="settings-btn">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="campaign-workspace">
        <aside className="campaign-sidebar">
          <div className="sidebar-section">
            <h3>战役信息</h3>
            <div className="campaign-info">
              <p><strong>游戏系统:</strong> {selectedCampaign.gameSystem.name}</p>
              <p><strong>最大玩家:</strong> {selectedCampaign.maxPlayers}</p>
              <p><strong>创建时间:</strong> {selectedCampaign.createdAt.toLocaleDateString()}</p>
              <p><strong>最后更新:</strong> {selectedCampaign.updatedAt.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>快速统计</h3>
            <div className="campaign-stats">
              <div className="stat-item">
                <Users size={16} />
                <span>角色: {selectedCampaign.characters.length}</span>
              </div>
              <div className="stat-item">
                <Calendar size={16} />
                <span>会话: {selectedCampaign.sessions.length}</span>
              </div>
              <div className="stat-item">
                <MessageSquare size={16} />
                <span>NPC: {(selectedCampaign.npcs || []).length}</span>
              </div>
              <div className="stat-item">
                <BookOpen size={16} />
                <span>笔记: {selectedCampaign.notes.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="campaign-main-content">
          <div className="campaign-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Eye size={16} />
              概览
            </button>
            <button 
              className={`tab ${activeTab === 'npcs' ? 'active' : ''}`}
              onClick={() => setActiveTab('npcs')}
            >
              <Users size={16} />
              NPC管理
            </button>
            <button 
              className={`tab ${activeTab === 'plot' ? 'active' : ''}`}
              onClick={() => setActiveTab('plot')}
            >
              <BookOpen size={16} />
              剧情管理
            </button>
            <button 
              className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <MessageSquare size={16} />
              笔记系统
            </button>
            <button 
              className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              <Calendar size={16} />
              会话记录
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-panel">
                <div className="overview-section">
                  <h3>战役概览</h3>
                  <p>{selectedCampaign.description}</p>
                </div>
                
                <div className="overview-section">
                  <h3>最近活动</h3>
                  <div className="recent-activities">
                    <p>暂无活动记录</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'npcs' && (
              <div className="npcs-panel">
                <div className="panel-header">
                  <h3>NPC管理</h3>
                  <button 
                    onClick={() => setShowNPCForm(true)}
                    className="add-btn"
                  >
                    <Plus size={16} />
                    添加NPC
                  </button>
                </div>
                
                <div className="npcs-list">
                  {(selectedCampaign.npcs || []).map(npc => (
                    <div key={npc.id} className="npc-item">
                      <div className="npc-info">
                        <h4>{npc.name}</h4>
                        <p className="npc-role">{npc.role}</p>
                        <p className="npc-location">{npc.location}</p>
                        <p className="npc-description">{npc.description}</p>
                        <span className={`npc-status ${npc.isAlive ? 'alive' : 'dead'}`}>
                          {npc.isAlive ? '存活' : '已故'}
                        </span>
                        {npc.files && npc.files.length > 0 && (
                          <div className="npc-files">
                            <h5>附件 ({npc.files.length})</h5>
                            <div className="files-grid">
                              {npc.files.map(file => (
                                <div key={file.id} className="file-item" onClick={() => openFilePreview(file)}>
                                  <div className="file-icon">
                                    {getFileIcon(file.type)}
                                  </div>
                                  <div className="file-info">
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                  </div>
                                  {file.type === 'image' && (
                                    <div className="file-preview">
                                      <img src={file.url} alt={file.name} />
                                    </div>
                                  )}
                                  <div className="file-actions">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadFile(file);
                                      }}
                                      className="download-btn"
                                      title="下载文件"
                                    >
                                      <Download size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="npc-actions">
                        <button 
                          className="delete-btn"
                          onClick={() => deleteNPC(npc.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showNPCForm && (
                  <div className="form-overlay">
                    <div className="form-modal">
                      <h3>添加NPC</h3>
                      <div className="form-content">
                        <div className="form-group">
                          <label>NPC名称</label>
                          <input
                            type="text"
                            value={newNPC.name}
                            onChange={(e) => setNewNPC({...newNPC, name: e.target.value})}
                            placeholder="输入NPC名称"
                          />
                        </div>
                        <div className="form-group">
                          <label>角色</label>
                          <input
                            type="text"
                            value={newNPC.role}
                            onChange={(e) => setNewNPC({...newNPC, role: e.target.value})}
                            placeholder="输入角色（如：商人、守卫等）"
                          />
                        </div>
                        <div className="form-group">
                          <label>位置</label>
                          <input
                            type="text"
                            value={newNPC.location}
                            onChange={(e) => setNewNPC({...newNPC, location: e.target.value})}
                            placeholder="输入位置"
                          />
                        </div>
                        <div className="form-group">
                          <label>描述</label>
                          <textarea
                            value={newNPC.description}
                            onChange={(e) => setNewNPC({...newNPC, description: e.target.value})}
                            placeholder="输入NPC描述"
                            rows={3}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={newNPC.isAlive}
                              onChange={(e) => setNewNPC({...newNPC, isAlive: e.target.checked})}
                            />
                            存活
                          </label>
                        </div>
                        <div className="form-group">
                          <label>上传文件 (可选)</label>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary"
                          >
                            <Upload size={16} />
                            选择文件
                          </button>
                          <div className="uploaded-files">
                            {(newNPC.files || []).map(file => (
                              <div key={file.id} className="uploaded-file">
                                <span>{file.name} ({formatFileSize(file.size)})</span>
                                <button onClick={() => removeFile(file.id)} className="remove-file-btn">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button onClick={addNPC} className="btn-primary">
                          添加NPC
                        </button>
                        <button 
                          onClick={() => {
                            setShowNPCForm(false);
                            resetNPCForm();
                          }}
                          className="btn-secondary"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'plot' && (
              <div className="plot-panel">
                <div className="panel-header">
                  <h3>剧情管理</h3>
                  <button 
                    onClick={() => setShowPlotForm(true)}
                    className="add-btn"
                  >
                    <Plus size={16} />
                    添加剧情点
                  </button>
                </div>
                
                <div className="plot-list">
                  {(selectedCampaign.plotPoints || []).map(plot => (
                    <div key={plot.id} className="plot-item">
                      <div className="plot-info">
                        <h4>{plot.title}</h4>
                        <p className="plot-chapter">第 {plot.chapter} 章</p>
                        <p className="plot-description">{plot.description}</p>
                        <span className={`plot-status ${plot.isCompleted ? 'completed' : 'pending'}`}>
                          {plot.isCompleted ? '已完成' : '待完成'}
                        </span>
                      </div>
                      <div className="plot-actions">
                        <button 
                          onClick={() => deletePlotPoint(plot.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showPlotForm && (
                  <div className="form-overlay">
                    <div className="form-modal">
                      <h3>添加剧情点</h3>
                      <div className="form-content">
                        <div className="form-group">
                          <label>标题</label>
                          <input
                            type="text"
                            value={newPlotPoint.title}
                            onChange={(e) => setNewPlotPoint({...newPlotPoint, title: e.target.value})}
                            placeholder="输入剧情点标题"
                          />
                        </div>
                        <div className="form-group">
                          <label>章节</label>
                          <input
                            type="number"
                            min="1"
                            value={newPlotPoint.chapter}
                            onChange={(e) => setNewPlotPoint({...newPlotPoint, chapter: parseInt(e.target.value) || 1})}
                          />
                        </div>
                        <div className="form-group">
                          <label>描述</label>
                          <textarea
                            value={newPlotPoint.description}
                            onChange={(e) => setNewPlotPoint({...newPlotPoint, description: e.target.value})}
                            placeholder="输入剧情点描述"
                            rows={4}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={newPlotPoint.isCompleted}
                              onChange={(e) => setNewPlotPoint({...newPlotPoint, isCompleted: e.target.checked})}
                            />
                            已完成
                          </label>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button onClick={addPlotPoint} className="btn-primary">
                          添加剧情点
                        </button>
                        <button 
                          onClick={() => {
                            setShowPlotForm(false);
                            resetPlotForm();
                          }}
                          className="btn-secondary"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-panel">
                <div className="panel-header">
                  <h3>笔记系统</h3>
                  <button 
                    onClick={() => setShowNoteForm(true)}
                    className="add-btn"
                  >
                    <Plus size={16} />
                    添加笔记
                  </button>
                </div>
                
                <div className="notes-list">
                  {(selectedCampaign.notes || []).map(note => (
                    <div key={note.id} className="note-item">
                      <div className="note-info">
                        <h4>{note.title}</h4>
                        <p className="note-category">{note.category}</p>
                        <p className="note-content">{note.content}</p>
                        <span className="note-date">
                          {note.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="note-actions">
                        <button 
                          onClick={() => deleteNote(note.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showNoteForm && (
                  <div className="form-overlay">
                    <div className="form-modal">
                      <h3>添加笔记</h3>
                      <div className="form-content">
                        <div className="form-group">
                          <label>标题</label>
                          <input
                            type="text"
                            value={newNote.title}
                            onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                            placeholder="输入笔记标题"
                          />
                        </div>
                        <div className="form-group">
                          <label>分类</label>
                          <select
                            value={newNote.category}
                            onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                          >
                            <option value="general">一般</option>
                            <option value="quest">任务</option>
                            <option value="location">地点</option>
                            <option value="item">物品</option>
                            <option value="lore">背景故事</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>内容</label>
                          <textarea
                            value={newNote.content}
                            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                            placeholder="输入笔记内容"
                            rows={6}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button onClick={addNote} className="btn-primary">
                          添加笔记
                        </button>
                        <button 
                          onClick={() => {
                            setShowNoteForm(false);
                            resetNoteForm();
                          }}
                          className="btn-secondary"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="sessions-panel">
                <h3>会话记录</h3>
                <div className="sessions-list">
                  {selectedCampaign.sessions.length > 0 ? (
                    selectedCampaign.sessions.map(session => (
                      <div key={session.id} className="session-item">
                        <h4>{session.name}</h4>
                        <p>{session.description}</p>
                        <span className="session-date">
                          {session.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>暂无会话记录</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 文件预览模态框 */}
      {previewFile && (
        <div className="file-preview-modal">
          <div className="file-preview-content">
            <div className="preview-header">
              <h3>{previewFile.name}</h3>
              <button onClick={closeFilePreview} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="preview-body">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="preview-image" />
              ) : (
                <div className="preview-info">
                  <div className="file-icon-large">
                    {getFileIcon(previewFile.type)}
                  </div>
                  <p>文件类型: {previewFile.type}</p>
                  <p>文件大小: {formatFileSize(previewFile.size)}</p>
                  <p>上传时间: {previewFile.uploadedAt.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="preview-actions">
              <button onClick={() => downloadFile(previewFile)} className="btn-primary">
                <Download size={16} />
                下载文件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager; 