import React, { useState } from 'react';
import { GachaEvent, GachaRecord, User } from '../types';
import { drawMultipleCards } from '../utils/gacha';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import './GachaPanel.css';

interface GachaPanelProps {
  event: GachaEvent;
  currentUser: User;
  onDraw: (records: GachaRecord[]) => void;
  onBack: () => void;
}

const GachaPanel: React.FC<GachaPanelProps> = ({ event, currentUser, onDraw, onBack }) => {
  const [drawCount, setDrawCount] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCards, setDrawnCards] = useState<GachaRecord[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleDraw = () => {
    if (drawCount < 1 || drawCount > 100) {
      alert('请选择1-100之间的抽卡次数');
      return;
    }

    setIsDrawing(true);
    setShowResults(false);

    setTimeout(() => {
      const drawnCards = drawMultipleCards(event.cards, drawCount);
      
      const records: GachaRecord[] = drawnCards.map(card => ({
        id: Date.now().toString() + Math.random(),
        eventId: event.id,
        eventName: event.name,
        cardId: card.id,
        cardName: card.name,
        cardRarity: card.rarity,
        userId: currentUser.id,
        username: currentUser.username,
        drawnAt: new Date()
      }));

      setDrawnCards(records);
      onDraw(records);
      setShowResults(true);
      setIsDrawing(false);
    }, 1000);
  };

  const handleReset = () => {
    setDrawnCards([]);
    setShowResults(false);
  };

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

  return (
    <div className="gacha-panel">
      <div className="panel-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          返回
        </button>
        <h2>{event.name}</h2>
        {event.description && (
          <p className="event-description">{event.description}</p>
        )}
      </div>

      <div className="panel-content">
        <div className="draw-controls">
          <div className="draw-settings">
            <label>抽卡次数:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={drawCount}
              onChange={(e) => setDrawCount(parseInt(e.target.value) || 1)}
              disabled={isDrawing}
            />
          </div>
          
          <div className="draw-actions">
            <button
              className="draw-btn"
              onClick={handleDraw}
              disabled={isDrawing}
            >
              {isDrawing ? (
                <>
                  <RotateCcw size={20} className="spinning" />
                  抽卡中...
                </>
              ) : (
                <>
                  <Play size={20} />
                  开始抽卡
                </>
              )}
            </button>
            
            {showResults && (
              <button className="reset-btn" onClick={handleReset}>
                <RotateCcw size={20} />
                重新抽卡
              </button>
            )}
          </div>
        </div>

        {isDrawing && (
          <div className="drawing-animation">
            <div className="spinner"></div>
            <p>正在抽卡...</p>
          </div>
        )}

        {showResults && drawnCards.length > 0 && (
          <div className="draw-results">
            <h3>抽卡结果</h3>
            <div className="results-grid">
              {drawnCards.map((record) => (
                <div key={record.id} className="result-card">
                  <div className="card-image">
                    {record.cardName.charAt(0)}
                  </div>
                  <div className="card-info">
                    <h4>{record.cardName}</h4>
                    <span 
                      className="rarity-badge"
                      style={{ color: getRarityColor(record.cardRarity) }}
                    >
                      {record.cardRarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="results-summary">
              <h4>抽卡统计</h4>
              <div className="summary-stats">
                <div className="stat">
                  <span>总抽卡数:</span>
                  <span>{drawnCards.length}</span>
                </div>
                {(() => {
                  const rarityCounts = drawnCards.reduce((acc, card) => {
                    acc[card.cardRarity] = (acc[card.cardRarity] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  return Object.entries(rarityCounts).map(([rarity, count]) => (
                    <div key={rarity} className="stat">
                      <span>{rarity}:</span>
                      <span>{count}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GachaPanel; 