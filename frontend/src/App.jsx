import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MazeView from './components/MazeView';
import PuzzleView from './components/PuzzleView';
import NQueensView from './components/NQueensView';
import BlocksView from './components/BlocksView';
import DashboardView from './components/DashboardView';
import { fetchPresets } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('maze');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [benchmarkLogs, setBenchmarkLogs] = useState([]);

  // Check Python REST API health on mount
  useEffect(() => {
    async function checkHealth() {
      const presets = await fetchPresets();
      setIsBackendConnected(!!presets);
    }
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogResult = (result) => {
    setBenchmarkLogs((prev) => [result, ...prev]);
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      <main style={{ minHeight: '600px' }}>
        {activeTab === 'maze' && <MazeView onLogResult={handleLogResult} />}
        {activeTab === 'puzzle' && <PuzzleView onLogResult={handleLogResult} />}
        {activeTab === 'nqueens' && <NQueensView onLogResult={handleLogResult} />}
        {activeTab === 'blocks' && <BlocksView onLogResult={handleLogResult} />}
        {activeTab === 'dashboard' && <DashboardView benchmarkLogs={benchmarkLogs} />}
      </main>
    </div>
  );
}
