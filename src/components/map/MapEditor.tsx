import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, Map, MapToken } from '../../types';
import { ArrowLeft, Upload, Grid, Save, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import './MapEditor.css';

interface MapEditorProps {
  currentUser: User;
  maps: Map[];
  onUpdateMaps: (maps: Map[]) => void;
}

const MapEditor: React.FC<MapEditorProps> = ({
  maps,
  onUpdateMaps,
}) => {
  const { mapId } = useParams<{ mapId?: string }>();
  const [currentMap, setCurrentMap] = useState<Map | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMap, setNewMap] = useState({
    name: '',
    description: '',
    gridSize: 50,
    width: 800,
    height: 600
  });
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedToken, setSelectedToken] = useState<MapToken | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    imageUrl: '',
    size: 40,
    isPlayer: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 根据URL参数设置当前地图
  useEffect(() => {
    if (mapId && mapId !== 'new') {
      const map = maps.find(m => m.id === mapId);
      if (map) {
        setCurrentMap(map);
      }
    }
  }, [mapId, maps]);

  // 创建新地图
  const createMap = () => {
    if (!newMap.name.trim()) return;

    const map: Map = {
      id: Date.now().toString(),
      name: newMap.name,
      description: newMap.description,
      imageUrl: mapImage || undefined,
      width: newMap.width,
      height: newMap.height,
      gridSize: newMap.gridSize,
      tokens: [],
      roomCode: `M${Date.now().toString().slice(-6)}`,
      collaborators: [],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedMaps = [...maps, map];
    onUpdateMaps(updatedMaps);
    setCurrentMap(map);
    setShowCreateForm(false);
    resetForm();
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setMapImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 添加标记
  const addToken = () => {
    if (!currentMap || !newToken.name.trim()) return;

    const token: MapToken = {
      id: Date.now().toString(),
      name: newToken.name,
      x: 100,
      y: 100,
      size: newToken.size,
      imageUrl: newToken.imageUrl,
      isVisible: true,
      isPlayer: newToken.isPlayer,
      characterId: undefined
    };

    const updatedMap = {
      ...currentMap,
      tokens: [...currentMap.tokens, token],
      updatedAt: new Date()
    };

    const updatedMaps = maps.map(m => m.id === currentMap.id ? updatedMap : m);
    onUpdateMaps(updatedMaps);
    setCurrentMap(updatedMap);
    setShowTokenForm(false);
    resetTokenForm();
  };

  // 删除标记
  const deleteToken = (tokenId: string) => {
    if (!currentMap) return;

    const updatedMap = {
      ...currentMap,
      tokens: currentMap.tokens.filter(t => t.id !== tokenId),
      updatedAt: new Date()
    };

    const updatedMaps = maps.map(m => m.id === currentMap.id ? updatedMap : m);
    onUpdateMaps(updatedMaps);
    setCurrentMap(updatedMap);
  };

  // 开始拖拽
  const startDrag = (token: MapToken, event: React.MouseEvent) => {
    setSelectedToken(token);
    setIsDragging(true);
    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  // 处理拖拽移动
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !selectedToken || !currentMap) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;

    const updatedToken = {
      ...selectedToken,
      x: Math.max(0, Math.min(x, currentMap.width - selectedToken.size)),
      y: Math.max(0, Math.min(y, currentMap.height - selectedToken.size))
    };

    const updatedMap = {
      ...currentMap,
      tokens: currentMap.tokens.map(t => t.id === selectedToken.id ? updatedToken : t),
      updatedAt: new Date()
    };

    setCurrentMap(updatedMap);
  };

  // 结束拖拽
  const stopDrag = () => {
    if (isDragging && currentMap) {
      const updatedMaps = maps.map(m => m.id === currentMap.id ? currentMap : m);
      onUpdateMaps(updatedMaps);
    }
    setIsDragging(false);
    setSelectedToken(null);
  };

  // 绘制六边形网格
  const drawHexGrid = (ctx: CanvasRenderingContext2D, gridSize: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const hexWidth = gridSize * 2;
    const hexHeight = gridSize * Math.sqrt(3);
    const hexRadius = gridSize;

    for (let y = 0; y < currentMap!.height + hexHeight; y += hexHeight * 0.75) {
      for (let x = 0; x < currentMap!.width + hexWidth; x += hexWidth * 0.875) {
        const offsetX = (Math.floor(y / (hexHeight * 0.75)) % 2) * (hexWidth / 2);
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = x + offsetX + hexRadius * Math.cos(angle);
          const py = y + hexRadius * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  // 绘制地图
  useEffect(() => {
    if (!currentMap || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mapImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (showGrid) {
          drawHexGrid(ctx, currentMap.gridSize);
        }
      };
      img.src = mapImage;
    } else if (showGrid) {
      drawHexGrid(ctx, currentMap.gridSize);
    }
  }, [currentMap, mapImage, showGrid]);

  const resetForm = () => {
    setNewMap({
      name: '',
      description: '',
      gridSize: 50,
      width: 800,
      height: 600
    });
    setMapImage(null);
  };

  const resetTokenForm = () => {
    setNewToken({
      name: '',
      imageUrl: '',
      size: 40,
      isPlayer: true
    });
  };

  // 如果没有选择地图，显示地图列表
  if (!currentMap) {
    return (
      <div className="map-editor">
        <header className="map-header">
          <Link to="/" className="back-btn">
            <ArrowLeft size={20} />
            返回主页
          </Link>
          <h1>🗺️ 地图编辑器</h1>
          <button 
            className="create-map-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            创建地图
          </button>
        </header>

        <main className="map-main">
          {showCreateForm ? (
            <div className="create-map-form">
              <h2>创建新地图</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>地图名称</label>
                  <input
                    type="text"
                    value={newMap.name}
                    onChange={(e) => setNewMap({...newMap, name: e.target.value})}
                    placeholder="输入地图名称"
                  />
                </div>
                <div className="form-group">
                  <label>描述</label>
                  <input
                    type="text"
                    value={newMap.description}
                    onChange={(e) => setNewMap({...newMap, description: e.target.value})}
                    placeholder="输入地图描述"
                  />
                </div>
                <div className="form-group">
                  <label>宽度 (像素)</label>
                  <input
                    type="number"
                    min="400"
                    max="2000"
                    value={newMap.width}
                    onChange={(e) => setNewMap({...newMap, width: parseInt(e.target.value) || 800})}
                  />
                </div>
                <div className="form-group">
                  <label>高度 (像素)</label>
                  <input
                    type="number"
                    min="300"
                    max="1500"
                    value={newMap.height}
                    onChange={(e) => setNewMap({...newMap, height: parseInt(e.target.value) || 600})}
                  />
                </div>
                <div className="form-group">
                  <label>网格大小</label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={newMap.gridSize}
                    onChange={(e) => setNewMap({...newMap, gridSize: parseInt(e.target.value) || 50})}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>上传地图图片</h3>
                <div className="image-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-btn"
                  >
                    <Upload size={20} />
                    选择图片
                  </button>
                  {mapImage && (
                    <div className="image-preview">
                      <img src={mapImage} alt="地图预览" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button onClick={createMap} className="btn-primary">
                  创建地图
                </button>
                <button onClick={() => setShowCreateForm(false)} className="btn-secondary">
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="maps-list">
              <h2>我的地图</h2>
              {maps.length > 0 ? (
                <div className="maps-grid">
                  {maps.map(map => (
                    <div key={map.id} className="map-card">
                      <div className="map-preview">
                        {map.imageUrl ? (
                          <img src={map.imageUrl} alt={map.name} />
                        ) : (
                          <div className="map-placeholder">
                            <ImageIcon size={48} />
                            <span>无图片</span>
                          </div>
                        )}
                      </div>
                      <div className="map-info">
                        <h3>{map.name}</h3>
                        <p>{map.description || '无描述'}</p>
                        <div className="map-meta">
                          <span>{map.width} × {map.height}</span>
                          <span>网格: {map.gridSize}px</span>
                          <span>标记: {map.tokens.length}</span>
                        </div>
                      </div>
                      <div className="map-actions">
                        <button 
                          onClick={() => setCurrentMap(map)}
                          className="edit-btn"
                        >
                          编辑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>还没有创建地图</p>
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="create-btn"
                  >
                    <Plus size={16} />
                    创建第一个地图
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // 地图编辑器界面
  return (
    <div className="map-editor">
      <header className="map-header">
        <div className="map-title">
          <Link to="/maps" className="back-btn">
            <ArrowLeft size={20} />
            返回列表
          </Link>
          <div>
            <h1>{currentMap.name}</h1>
            <p>{currentMap.description}</p>
          </div>
        </div>
        <div className="map-controls">
          <div className="control-group">
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`control-btn ${showGrid ? 'active' : ''}`}
            >
              <Grid size={16} />
              网格
            </button>
            <button 
              onClick={() => setShowTokenForm(true)}
              className="control-btn"
            >
              <Plus size={16} />
              添加标记
            </button>
            <button 
              onClick={() => {
                const updatedMaps = maps.map(m => m.id === currentMap.id ? currentMap : m);
                onUpdateMaps(updatedMaps);
              }}
              className="control-btn"
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </div>
      </header>

      <div className="map-workspace">
        <div className="map-canvas-container">
          <canvas
            ref={canvasRef}
            width={currentMap.width}
            height={currentMap.height}
            className="map-canvas"
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          />
          
          {/* 标记层 */}
          <div className="tokens-layer">
            {currentMap.tokens.map(token => (
              <div
                key={token.id}
                className={`map-token ${token.isPlayer ? 'player' : 'npc'} ${selectedToken?.id === token.id ? 'selected' : ''}`}
                style={{
                  left: token.x,
                  top: token.y,
                  width: token.size,
                  height: token.size
                }}
                onMouseDown={(e) => startDrag(token, e)}
              >
                {token.imageUrl ? (
                  <img src={token.imageUrl} alt={token.name} />
                ) : (
                  <div className="token-placeholder">
                    {token.name.charAt(0)}
                  </div>
                )}
                <div className="token-label">{token.name}</div>
                <button 
                  className="token-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteToken(token.id);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="map-sidebar">
          <div className="sidebar-section">
            <h3>地图信息</h3>
            <div className="map-info">
              <p><strong>尺寸:</strong> {currentMap.width} × {currentMap.height}</p>
              <p><strong>网格大小:</strong> {currentMap.gridSize}px</p>
              <p><strong>标记数量:</strong> {currentMap.tokens.length}</p>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>标记列表</h3>
            <div className="tokens-list">
              {currentMap.tokens.map(token => (
                <div key={token.id} className="token-item">
                  <div className="token-info">
                    <span className="token-name">{token.name}</span>
                    <span className={`token-type ${token.isPlayer ? 'player' : 'npc'}`}>
                      {token.isPlayer ? '玩家' : 'NPC'}
                    </span>
                  </div>
                  <div className="token-actions">
                    <button 
                      onClick={() => deleteToken(token.id)}
                      className="delete-btn"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 标记表单 */}
      {showTokenForm && (
        <div className="token-form-overlay">
          <div className="token-form">
            <div className="form-header">
              <h3>添加标记</h3>
              <button 
                onClick={() => {
                  setShowTokenForm(false);
                  resetTokenForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-content">
              <div className="form-group">
                <label>标记名称</label>
                <input
                  type="text"
                  value={newToken.name}
                  onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                  placeholder="输入标记名称"
                />
              </div>

              <div className="form-group">
                <label>图片URL (可选)</label>
                <input
                  type="text"
                  value={newToken.imageUrl}
                  onChange={(e) => setNewToken({...newToken, imageUrl: e.target.value})}
                  placeholder="输入图片URL"
                />
              </div>

              <div className="form-group">
                <label>大小 (像素)</label>
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={newToken.size}
                  onChange={(e) => setNewToken({...newToken, size: parseInt(e.target.value) || 40})}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newToken.isPlayer}
                    onChange={(e) => setNewToken({...newToken, isPlayer: e.target.checked})}
                  />
                  是玩家角色
                </label>
              </div>

              <div className="form-actions">
                <button onClick={addToken} className="btn-primary">
                  添加标记
                </button>
                <button 
                  onClick={() => {
                    setShowTokenForm(false);
                    resetTokenForm();
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapEditor;
