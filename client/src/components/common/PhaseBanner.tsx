import React from 'react';
import { Info, Sparkles } from 'lucide-react';

export const PhaseBanner: React.FC = () => {
  return (
    <aside className="phase-banner" aria-label="System Notice">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={14} style={{ color: '#818cf8' }} />
        <span><strong>MindTrace Phase 1 Architecture:</strong> Full-stack UI & Pipeline Scaffolding</span>
      </div>
      <span style={{ opacity: 0.5 }}>|</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Info size={13} style={{ color: '#38bdf8' }} />
        <span>AI Diagnostic & Recovery Engines running in <em>Designated Placeholder Mode</em></span>
      </div>
    </aside>
  );
};
