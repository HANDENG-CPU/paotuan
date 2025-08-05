import React from 'react';
import { Loader2 } from 'lucide-react';
import { LoadingState } from '../../utils/loadingManager';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  loadingStates: LoadingState[];
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ loadingStates }) => {
  if (loadingStates.length === 0) return null;

  const primaryLoading = loadingStates[0]; // 显示第一个加载状态

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner">
          <Loader2 size={32} className="spinner" />
        </div>
        
        <div className="loading-text">
          <h3>{primaryLoading.message || '加载中...'}</h3>
          
          {primaryLoading.progress !== undefined && (
            <div className="loading-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${primaryLoading.progress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(primaryLoading.progress)}%</span>
            </div>
          )}
          
          {loadingStates.length > 1 && (
            <div className="loading-count">
              还有 {loadingStates.length - 1} 个操作进行中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay; 