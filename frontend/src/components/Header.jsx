import React from 'react';
import { Grid, Cpu, Crown, Box, BarChart3, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isBackendConnected }) {
  const tabs = [
    { id: 'maze', label: '1. Maze Pathfinding', icon: Grid },
    { id: 'puzzle', label: '2. 8-Puzzle Search', icon: Cpu },
    { id: 'nqueens', label: '3. N-Queens Local Search', icon: Crown },
    { id: 'blocks', label: '4. Blocks World Planning', icon: Box },
    { id: 'dashboard', label: '5. Dashboard Leaderboard', icon: BarChart3 }
  ];

  return (
    <header className="header-glass">
      <div className="brand-title">
        <Activity className="w-6 h-6 text-cyan-400" />
        <span>AI Search & Planning Playground</span>
      </div>

      <div className="tab-group">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isBackendConnected ? '#10b981' : '#ef4444',
            boxShadow: isBackendConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
          }}
        />
        <span style={{ color: 'var(--text-muted)' }}>
          {isBackendConnected ? 'Python API Ready' : 'API Offline'}
        </span>
      </div>
    </header>
  );
}
