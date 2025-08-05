import React from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AppError } from '../../utils/errorHandler';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  errors: AppError[];
  onClearError: (errorId: string) => void;
  onClearAll: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onClearError,
  onClearAll
}) => {
  if (errors.length === 0) return null;

  const getIcon = (type: AppError['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
        return <Info size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getTypeClass = (type: AppError['type']) => {
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <div className="error-display">
      <div className="error-header">
        <h3>系统消息</h3>
        {errors.length > 1 && (
          <button onClick={onClearAll} className="clear-all-btn">
            清除全部
          </button>
        )}
      </div>
      
      <div className="error-list">
        {errors.map(error => (
          <div key={error.id} className={`error-item ${getTypeClass(error.type)}`}>
            <div className="error-icon">
              {getIcon(error.type)}
            </div>
            
            <div className="error-content">
              <div className="error-title">{error.title}</div>
              <div className="error-message">{error.message}</div>
              {error.details && (
                <div className="error-details">
                  <details>
                    <summary>详细信息</summary>
                    <pre>{JSON.stringify(error.details, null, 2)}</pre>
                  </details>
                </div>
              )}
              <div className="error-time">
                {error.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <button 
              onClick={() => onClearError(error.id)}
              className="clear-error-btn"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorDisplay; 