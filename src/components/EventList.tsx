import React from 'react';
import { GachaEvent } from '../types';
import { Calendar, Edit, Trash2, Play } from 'lucide-react';
import './EventList.css';

interface EventListProps {
  events: GachaEvent[];
  onSelectEvent: (event: GachaEvent) => void;
  onEditEvent: (event: GachaEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onGachaEvent: (event: GachaEvent) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onGachaEvent,
}) => {
  if (events.length === 0) {
    return (
      <div className="event-list-empty">
        <div className="empty-state">
          <h2>还没有抽卡事件</h2>
          <p>点击"创建事件"开始创建你的第一个抽卡事件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-list">
      <h2>抽卡事件列表</h2>
      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3>{event.name}</h3>
              <div className="event-actions">
                <button
                  className="action-btn edit"
                  onClick={() => onEditEvent(event)}
                  title="编辑事件"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDeleteEvent(event.id)}
                  title="删除事件"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {event.description && (
              <p className="event-description">{event.description}</p>
            )}
            
            <div className="event-stats">
              <div className="stat">
                <span className="stat-label">卡片数量:</span>
                <span className="stat-value">{event.cards.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">创建时间:</span>
                <span className="stat-value">
                  {event.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="event-footer">
              <button
                className="gacha-btn"
                onClick={() => onGachaEvent(event)}
              >
                <Play size={16} />
                开始抽卡
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList; 