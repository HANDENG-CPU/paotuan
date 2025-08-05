import React, { useState, useMemo } from 'react';
import { GachaRecord, GachaEvent } from '../types';
import { ArrowLeft, Filter, Calendar, Star } from 'lucide-react';
import './RecordViewer.css';

interface RecordViewerProps {
  records: GachaRecord[];
  events: GachaEvent[];
  onBack: () => void;
}

const RecordViewer: React.FC<RecordViewerProps> = ({ records, events, onBack }) => {
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rarity'>('date');

  const filteredRecords = useMemo(() => {
    let filtered = records;
    
    if (selectedEvent !== 'all') {
      filtered = filtered.filter(record => record.eventId === selectedEvent);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime();
      } else {
        const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
        const aOrder = rarityOrder[a.cardRarity as keyof typeof rarityOrder] || 0;
        const bOrder = rarityOrder[b.cardRarity as keyof typeof rarityOrder] || 0;
        return bOrder - aOrder;
      }
    });
  }, [records, selectedEvent, sortBy]);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'ssr':
        return '#ffd700';
      case 'sr':
        return '#c0c0c0';
      case 'r':
        return '#cd7f32';
      default:
        return '#ffffff';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'ssr':
        return '⭐⭐⭐';
      case 'sr':
        return '⭐⭐';
      case 'r':
        return '⭐';
      default:
        return '';
    }
  };

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const rarityCounts = filteredRecords.reduce((acc, record) => {
      acc[record.cardRarity] = (acc[record.cardRarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, rarityCounts };
  }, [filteredRecords]);

  if (records.length === 0) {
    return (
      <div className="record-viewer">
        <div className="viewer-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            返回
          </button>
          <h2>抽卡记录</h2>
        </div>
        <div className="empty-records">
          <p>还没有抽卡记录</p>
          <p>开始抽卡来查看记录吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="record-viewer">
      <div className="viewer-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          返回
        </button>
        <h2>抽卡记录</h2>
      </div>

      <div className="viewer-controls">
        <div className="filter-controls">
          <label>事件筛选:</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="all">全部事件</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-controls">
          <label>排序方式:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'rarity')}
          >
            <option value="date">按时间</option>
            <option value="rarity">按稀有度</option>
          </select>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-label">总抽卡数</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        {Object.entries(stats.rarityCounts).map(([rarity, count]) => (
          <div key={rarity} className="stat-card">
            <span className="stat-label">{rarity}</span>
            <span className="stat-value" style={{ color: getRarityColor(rarity) }}>
              {count}
            </span>
          </div>
        ))}
      </div>

      <div className="records-list">
        {filteredRecords.map(record => (
          <div key={record.id} className="record-item">
            <div className="record-header">
              <div className="record-info">
                <h4>{record.cardName}</h4>
                <span className="event-name">{record.eventName}</span>
              </div>
              <div className="record-rarity">
                <span 
                  className="rarity-badge"
                  style={{ color: getRarityColor(record.cardRarity) }}
                >
                  {getRarityIcon(record.cardRarity)} {record.cardRarity}
                </span>
              </div>
            </div>
            <div className="record-footer">
              <span className="draw-time">
                <Calendar size={14} />
                {new Date(record.drawnAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="no-records">
          <p>没有找到符合条件的记录</p>
        </div>
      )}
    </div>
  );
};

export default RecordViewer; 