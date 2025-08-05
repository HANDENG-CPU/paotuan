import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, GameRule } from '../../types';
import { ArrowLeft, Plus, Upload, Download, Trash2, Eye, Search, Filter, BookOpen, FileText, Package, Settings, Star, Calendar, User as UserIcon } from 'lucide-react';
import './RuleBook.css';

interface RuleBookProps {
  currentUser: User;
  rules: GameRule[];
  onUpdateRules: (rules: GameRule[]) => void;
}

interface Mod {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  tags: string[];
  fileSize: number;
  downloadCount: number;
  rating: number;
  isPublic: boolean;
  isOfficial: boolean;
  createdAt: Date;
  updatedAt: Date;
  fileUrl?: string;
  thumbnailUrl?: string;
}

interface ModForm {
  name: string;
  description: string;
  category: string;
  tags: string;
  isPublic: boolean;
  version: string;
}

const RuleBook: React.FC<RuleBookProps> = ({
  currentUser,
  rules,
  onUpdateRules,
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-mods' | 'upload'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rating' | 'downloads'>('date');
  
  const [mods, setMods] = useState<Mod[]>([
    {
      id: '1',
      name: 'D&D 5e 核心规则',
      description: '包含D&D 5e的所有核心规则和机制',
      author: 'Wizards of the Coast',
      version: '1.0.0',
      category: 'core-rules',
      tags: ['dnd5e', 'core', 'rules'],
      fileSize: 2048,
      downloadCount: 15420,
      rating: 4.8,
      isPublic: true,
      isOfficial: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15')
    },
    {
      id: '2',
      name: 'Pathfinder 2e 玩家手册',
      description: 'Pathfinder 2e的完整玩家手册内容',
      author: 'Paizo',
      version: '2.1.0',
      category: 'player-guide',
      tags: ['pathfinder', 'player', 'guide'],
      fileSize: 3072,
      downloadCount: 8920,
      rating: 4.6,
      isPublic: true,
      isOfficial: true,
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2023-03-20')
    },
    {
      id: '3',
      name: '自定义魔法物品包',
      description: '包含100+个独特的魔法物品和装备',
      author: currentUser.username,
      version: '1.2.0',
      category: 'items',
      tags: ['magic', 'items', 'custom'],
      fileSize: 512,
      downloadCount: 2340,
      rating: 4.7,
      isPublic: true,
      isOfficial: false,
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2023-06-10')
    }
  ]);

  const [newMod, setNewMod] = useState<ModForm>({
    name: '',
    description: '',
    category: 'core-rules',
    tags: '',
    isPublic: true,
    version: '1.0.0'
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // 上传模组
  const uploadMod = () => {
    if (!newMod.name.trim() || !uploadedFile) return;

    const mod: Mod = {
      id: Date.now().toString(),
      name: newMod.name,
      description: newMod.description,
      author: currentUser.username,
      version: newMod.version,
      category: newMod.category,
      tags: newMod.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      fileSize: uploadedFile.size,
      downloadCount: 0,
      rating: 0,
      isPublic: newMod.isPublic,
      isOfficial: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      fileUrl: URL.createObjectURL(uploadedFile),
      thumbnailUrl: uploadedThumbnail ? URL.createObjectURL(uploadedThumbnail) : undefined
    };

    setMods(prev => [...prev, mod]);
    setShowUploadForm(false);
    resetUploadForm();
  };

  // 删除模组
  const deleteMod = (modId: string) => {
    setMods(prev => prev.filter(mod => mod.id !== modId));
    if (selectedMod?.id === modId) {
      setSelectedMod(null);
    }
  };

  // 下载模组
  const downloadMod = (mod: Mod) => {
    if (mod.fileUrl) {
      const link = document.createElement('a');
      link.href = mod.fileUrl;
      link.download = `${mod.name}-${mod.version}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 更新下载次数
      setMods(prev => prev.map(m => 
        m.id === mod.id 
          ? { ...m, downloadCount: m.downloadCount + 1 }
          : m
      ));
    }
  };

  // 评分模组
  const rateMod = (modId: string, rating: number) => {
    setMods(prev => prev.map(mod => 
      mod.id === modId 
        ? { ...mod, rating: (mod.rating + rating) / 2 }
        : mod
    ));
  };

  const resetUploadForm = () => {
    setNewMod({
      name: '',
      description: '',
      category: 'core-rules',
      tags: '',
      isPublic: true,
      version: '1.0.0'
    });
    setUploadedFile(null);
    setUploadedThumbnail(null);
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedThumbnail(file);
    }
  };

  // 过滤和排序模组
  const filteredMods = mods
    .filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mod.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });

  const myMods = mods.filter(mod => mod.author === currentUser.username);

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'core-rules', label: '核心规则' },
    { value: 'player-guide', label: '玩家指南' },
    { value: 'dm-guide', label: 'DM指南' },
    { value: 'items', label: '物品装备' },
    { value: 'monsters', label: '怪物图鉴' },
    { value: 'spells', label: '法术列表' },
    { value: 'adventures', label: '冒险模组' },
    { value: 'settings', label: '世界设定' },
    { value: 'tools', label: '工具插件' }
  ];

  // 如果没有选择模组，显示模组列表
  if (!selectedMod) {
    return (
      <div className="rule-book">
        <header className="rule-header">
          <Link to="/" className="back-btn">
            <ArrowLeft size={20} />
            返回主页
          </Link>
          <h1>📦 模组管理</h1>
          <button 
            className="upload-mod-btn"
            onClick={() => setShowUploadForm(true)}
          >
            <Upload size={20} />
            上传模组
          </button>
        </header>
        
        <main className="rule-main">
          {showUploadForm ? (
            <div className="upload-mod-form">
              <h2>上传新模组</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>模组名称</label>
                  <input
                    type="text"
                    value={newMod.name}
                    onChange={(e) => setNewMod({...newMod, name: e.target.value})}
                    placeholder="输入模组名称"
                  />
                </div>
                <div className="form-group">
                  <label>版本</label>
                  <input
                    type="text"
                    value={newMod.version}
                    onChange={(e) => setNewMod({...newMod, version: e.target.value})}
                    placeholder="例如: 1.0.0"
                  />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select
                    value={newMod.category}
                    onChange={(e) => setNewMod({...newMod, category: e.target.value})}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>标签</label>
                  <input
                    type="text"
                    value={newMod.tags}
                    onChange={(e) => setNewMod({...newMod, tags: e.target.value})}
                    placeholder="用逗号分隔，例如: dnd5e, magic, items"
                  />
                </div>
                <div className="form-group full-width">
                  <label>描述</label>
                  <textarea
                    value={newMod.description}
                    onChange={(e) => setNewMod({...newMod, description: e.target.value})}
                    placeholder="详细描述模组内容"
                    rows={4}
                  />
                </div>
              </div>

              <div className="upload-section">
                <h3>文件上传</h3>
                <div className="upload-grid">
                  <div className="upload-group">
                    <label>模组文件 (ZIP)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="upload-btn"
                    >
                      <Upload size={16} />
                      {uploadedFile ? uploadedFile.name : '选择文件'}
                    </button>
                  </div>
                  <div className="upload-group">
                    <label>缩略图 (可选)</label>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      style={{ display: 'none' }}
                    />
                    <button 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="upload-btn"
                    >
                      <Upload size={16} />
                      {uploadedThumbnail ? uploadedThumbnail.name : '选择图片'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newMod.isPublic}
                    onChange={(e) => setNewMod({...newMod, isPublic: e.target.checked})}
                  />
                  公开模组
                </label>
              </div>

              <div className="form-actions">
                <button onClick={uploadMod} className="btn-primary">
                  上传模组
                </button>
                <button onClick={() => setShowUploadForm(false)} className="btn-secondary">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="mods-container">
              <div className="mods-header">
                <div className="search-filters">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="搜索模组..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="filters">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="date">最新</option>
                      <option value="name">名称</option>
                      <option value="rating">评分</option>
                      <option value="downloads">下载量</option>
                    </select>
                  </div>
                </div>
                <div className="tabs">
                  <button 
                    className={`tab ${activeTab === 'browse' ? 'active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                  >
                    <BookOpen size={16} />
                    浏览模组
                  </button>
                  <button 
                    className={`tab ${activeTab === 'my-mods' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-mods')}
                  >
                    <UserIcon size={16} />
                    我的模组
                  </button>
                </div>
              </div>

              <div className="mods-grid">
                {(activeTab === 'browse' ? filteredMods : myMods).map(mod => (
                  <div key={mod.id} className="mod-card">
                    <div className="mod-header">
                      <div className="mod-thumbnail">
                        {mod.thumbnailUrl ? (
                          <img src={mod.thumbnailUrl} alt={mod.name} />
                        ) : (
                          <div className="mod-placeholder">
                            <Package size={32} />
                          </div>
                        )}
                      </div>
                      <div className="mod-badges">
                        {mod.isOfficial && <span className="badge official">官方</span>}
                        <span className="badge category">{categories.find(c => c.value === mod.category)?.label}</span>
                      </div>
                    </div>
                    
                    <div className="mod-content">
                      <h3>{mod.name}</h3>
                      <p className="mod-description">{mod.description}</p>
                      <div className="mod-meta">
                        <span className="author">作者: {mod.author}</span>
                        <span className="version">v{mod.version}</span>
                      </div>
                      <div className="mod-stats">
                        <div className="stat">
                          <Download size={14} />
                          <span>{mod.downloadCount}</span>
                        </div>
                        <div className="stat">
                          <Star size={14} />
                          <span>{mod.rating.toFixed(1)}</span>
                        </div>
                        <div className="stat">
                          <Calendar size={14} />
                          <span>{mod.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="mod-tags">
                        {mod.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mod-actions">
                      <button 
                        onClick={() => setSelectedMod(mod)}
                        className="view-btn"
                      >
                        <Eye size={16} />
                        查看
                      </button>
                      <button 
                        onClick={() => downloadMod(mod)}
                        className="download-btn"
                      >
                        <Download size={16} />
                        下载
                      </button>
                      {mod.author === currentUser.username && (
                        <button 
                          onClick={() => deleteMod(mod.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(activeTab === 'browse' ? filteredMods : myMods).length === 0 && (
                <div className="empty-state">
                  <p>{activeTab === 'browse' ? '没有找到模组' : '您还没有上传模组'}</p>
                  {activeTab === 'my-mods' && (
                    <button 
                      onClick={() => setShowUploadForm(true)}
                      className="create-btn"
                    >
                      <Plus size={16} />
                      上传第一个模组
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // 模组详情界面
  return (
    <div className="rule-book">
      <header className="rule-header">
        <div className="rule-title">
          <Link to="/rules" className="back-btn">
            <ArrowLeft size={20} />
            返回列表
          </Link>
          <div>
            <h1>{selectedMod.name}</h1>
            <p>v{selectedMod.version} • {selectedMod.author}</p>
          </div>
        </div>
        <div className="rule-controls">
          <button 
            onClick={() => downloadMod(selectedMod)}
            className="download-btn"
          >
            <Download size={16} />
            下载
          </button>
          {selectedMod.author === currentUser.username && (
            <button 
              onClick={() => deleteMod(selectedMod.id)}
              className="delete-btn"
            >
              <Trash2 size={16} />
              删除
            </button>
          )}
        </div>
      </header>

      <div className="mod-detail">
        <div className="mod-info">
          <div className="mod-header">
            <div className="mod-thumbnail-large">
              {selectedMod.thumbnailUrl ? (
                <img src={selectedMod.thumbnailUrl} alt={selectedMod.name} />
              ) : (
                <div className="mod-placeholder-large">
                  <Package size={64} />
                </div>
              )}
            </div>
            <div className="mod-details">
              <h2>{selectedMod.name}</h2>
              <p className="mod-description">{selectedMod.description}</p>
              <div className="mod-meta">
                <div className="meta-item">
                  <strong>作者:</strong> {selectedMod.author}
                </div>
                <div className="meta-item">
                  <strong>版本:</strong> v{selectedMod.version}
                </div>
                <div className="meta-item">
                  <strong>分类:</strong> {categories.find(c => c.value === selectedMod.category)?.label}
                </div>
                <div className="meta-item">
                  <strong>文件大小:</strong> {(selectedMod.fileSize / 1024).toFixed(1)} KB
                </div>
                <div className="meta-item">
                  <strong>下载次数:</strong> {selectedMod.downloadCount}
                </div>
                <div className="meta-item">
                  <strong>评分:</strong> {selectedMod.rating.toFixed(1)}/5.0
                </div>
                <div className="meta-item">
                  <strong>上传时间:</strong> {selectedMod.createdAt.toLocaleDateString()}
                </div>
              </div>
              <div className="mod-tags">
                {selectedMod.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBook; 