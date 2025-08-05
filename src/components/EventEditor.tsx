import React, { useState, useEffect } from 'react';
import { GachaEvent, Card } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseExcelFile, downloadExcelTemplate } from '../utils/excel';
import { Upload, Download, Plus, Trash2, Save, X } from 'lucide-react';
import './EventEditor.css';

interface EventEditorProps {
  event?: GachaEvent | null;
  onSave: (event: GachaEvent) => void;
  onCancel: () => void;
}

const EventEditor: React.FC<EventEditorProps> = ({ event, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDescription(event.description || '');
      setCards(event.cards);
    }
  }, [event]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const newCards = await parseExcelFile(file);
      setCards(newCards);
    } catch (error) {
      alert(error instanceof Error ? error.message : '文件上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请输入事件名称');
      return;
    }

    if (cards.length === 0) {
      alert('请至少添加一张卡片');
      return;
    }

    const eventData: GachaEvent = {
      id: event?.id || Date.now().toString(),
      name: name,
      description: description,
      cards: cards,
      roomCode: `G${Date.now().toString().slice(-6)}`,
      participants: [],
      isPublic: false,
      maxParticipants: 10,
      createdAt: event?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(eventData);
  };

  const addCard = () => {
    const newCard: Card = {
      id: uuidv4(),
      name: `新卡片${cards.length + 1}`,
      rarity: '普通',
      probability: 1,
      description: '',
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (index: number, field: keyof Card, value: any) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  return (
    <div className="event-editor">
      <div className="editor-header">
        <h2>{event ? '编辑事件' : '创建新事件'}</h2>
        <div className="editor-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            <X size={16} />
            取消
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} />
            保存
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="form-section">
          <h3>基本信息</h3>
          <div className="form-group">
            <label>事件名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入事件名称"
            />
          </div>
          <div className="form-group">
            <label>事件描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入事件描述（可选）"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>卡片管理</h3>
            <div className="section-actions">
              <button
                className="btn btn-outline"
                onClick={() => downloadExcelTemplate()}
              >
                <Download size={16} />
                下载模板
              </button>
              <label className="btn btn-outline upload-btn">
                <Upload size={16} />
                上传Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              <button className="btn btn-outline" onClick={addCard}>
                <Plus size={16} />
                添加卡片
              </button>
            </div>
          </div>

          {isUploading && (
            <div className="upload-status">
              正在处理Excel文件...
            </div>
          )}

          <div className="cards-list">
            {cards.map((card, index) => (
              <div key={card.id} className="card-item">
                <div className="card-header">
                  <span className="card-index">#{index + 1}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeCard(index)}
                    title="删除卡片"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="card-fields">
                  <div className="field-group">
                    <label>名称</label>
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => updateCard(index, 'name', e.target.value)}
                      placeholder="卡片名称"
                    />
                  </div>
                  <div className="field-group">
                    <label>稀有度</label>
                    <input
                      type="text"
                      value={card.rarity}
                      onChange={(e) => updateCard(index, 'rarity', e.target.value)}
                      placeholder="稀有度"
                    />
                  </div>
                  <div className="field-group">
                    <label>概率</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={card.probability}
                      onChange={(e) => updateCard(index, 'probability', parseFloat(e.target.value) || 0)}
                      placeholder="抽中概率"
                    />
                  </div>
                  <div className="field-group">
                    <label>图片链接</label>
                    <input
                      type="text"
                      value={card.image || ''}
                      onChange={(e) => updateCard(index, 'image', e.target.value)}
                      placeholder="图片URL（可选）"
                    />
                  </div>
                  <div className="field-group full-width">
                    <label>描述</label>
                    <textarea
                      value={card.description || ''}
                      onChange={(e) => updateCard(index, 'description', e.target.value)}
                      placeholder="卡片描述（可选）"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cards.length === 0 && (
            <div className="empty-cards">
              <p>还没有添加任何卡片</p>
              <p>请上传Excel文件或手动添加卡片</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventEditor; 