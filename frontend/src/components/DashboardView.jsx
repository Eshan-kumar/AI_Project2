import React, { useState } from 'react';
import { runBenchmarkAll } from '../services/api';
import { BarChart3, Zap, CheckCircle2, XCircle } from 'lucide-react';

export default function DashboardView({ benchmarkLogs }) {
  const [backendBenchmarkData, setBackendBenchmarkData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunFullBenchmark = async () => {
    setIsLoading(true);
    try {
      const data = await runBenchmarkAll();
      setBackendBenchmarkData(data.results || []);
    } catch (err) {
      alert('Failed to run full benchmark: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine live interactive runs logged from UI tabs + benchmark results
  const allResults = [...backendBenchmarkData, ...benchmarkLogs];

  const maxNodes = Math.max(...allResults.map((r) => r.nodes_expanded), 1);

  return (
    <div className="glass-panel">
      <div className="panel-header">
        <div className="panel-title">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span>Shared Integration Dashboard & Algorithm Leaderboard</span>
        </div>
        <button className="btn-primary" onClick={handleRunFullBenchmark} disabled={isLoading}>
          <Zap size={16} />
          {isLoading ? 'Running All Benchmarks...' : 'Run Full Benchmark (All 4 Problems)'}
        </button>
      </div>

      {allResults.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>No algorithm benchmarks recorded yet.</p>
          <p style={{ fontSize: '0.9rem' }}>
            Click <strong>"Run Full Benchmark"</strong> above to evaluate all algorithms, or run algorithms individually in each problem tab!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Comparison Table */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
              🏆 Performance Leaderboard
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Problem Domain</th>
                    <th>Algorithm</th>
                    <th>Status</th>
                    <th>Nodes Expanded</th>
                    <th>Time (ms)</th>
                    <th>Solution Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{row.problem}</td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>{row.algorithm}</td>
                      <td>
                        {row.solved ? (
                          <span className="badge-solved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Solved
                          </span>
                        ) : (
                          <span className="badge-failed" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={12} /> Unsolvable / Stuck
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.nodes_expanded.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.time_taken_ms} ms</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{row.solution_quality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Bar Chart: Nodes Expanded Comparison */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.2rem' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
              📊 Visual Node Expansion Comparison
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allResults.map((r, i) => {
                const pct = Math.min(100, Math.max(4, (r.nodes_expanded / maxNodes) * 100));
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ width: '220px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      [{r.problem}] {r.algorithm}
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', height: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                          borderRadius: '6px',
                          transition: 'width 0.5s ease-out'
                        }}
                      />
                    </div>
                    <div style={{ width: '80px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                      {r.nodes_expanded}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
