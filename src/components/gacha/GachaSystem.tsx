import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../types';
import EventList from '../EventList';
import EventEditor from '../EventEditor';
import GachaPanel from '../GachaPanel';
import RecordViewer from '../RecordViewer';
import './GachaSystem.css';

interface GachaSystemProps {
  currentUser: User;
  events: any[];
  records: any[];
  onUpdateEvents: (events: any[]) => void;
  onUpdateRecords: (records: any[]) => void;
}

const GachaSystem: React.FC<GachaSystemProps> = ({
  currentUser,
  events,
  records,
  onUpdateEvents,
  onUpdateRecords,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'list' | 'editor' | 'gacha' | 'records'>('list');

  const handleSaveEvent = (event: any) => {
    const updatedEvents = events.find((e: any) => e.id === event.id)
      ? events.map((e: any) => e.id === event.id ? event : e)
      : [...events, event];
    
    onUpdateEvents(updatedEvents);
    setCurrentView('list');
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((e: any) => e.id !== eventId);
    onUpdateEvents(updatedEvents);
    
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const handleAddRecord = (newRecords: any[]) => {
    const updatedRecords = [...records, ...newRecords];
    onUpdateRecords(updatedRecords);
  };

  return (
    <div className="gacha-system">
      <header className="gacha-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={20} />
          返回主页
        </Link>
        <h1>🎲 抽卡系统</h1>
        <nav className="gacha-nav">
          <button 
            className={currentView === 'list' ? 'active' : ''} 
            onClick={() => setCurrentView('list')}
          >
            事件列表
          </button>
          <button 
            className={currentView === 'editor' ? 'active' : ''} 
            onClick={() => setCurrentView('editor')}
          >
            创建事件
          </button>
          <button 
            className={currentView === 'records' ? 'active' : ''} 
            onClick={() => setCurrentView('records')}
          >
            抽卡记录
          </button>
        </nav>
      </header>

      <main className="gacha-main">
        {currentView === 'list' && (
          <EventList
            events={events}
            onSelectEvent={setSelectedEvent}
            onEditEvent={(event) => {
              setSelectedEvent(event);
              setCurrentView('editor');
            }}
            onDeleteEvent={handleDeleteEvent}
            onGachaEvent={(event) => {
              setSelectedEvent(event);
              setCurrentView('gacha');
            }}
          />
        )}

        {currentView === 'editor' && (
          <EventEditor
            event={selectedEvent}
            onSave={handleSaveEvent}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'gacha' && selectedEvent && (
          <GachaPanel
            event={selectedEvent}
            onDraw={handleAddRecord}
            onBack={() => setCurrentView('list')}
            currentUser={currentUser}
          />
        )}

        {currentView === 'records' && (
          <RecordViewer
            records={records}
            events={events}
            onBack={() => setCurrentView('list')}
          />
        )}
      </main>
    </div>
  );
};

export default GachaSystem; 