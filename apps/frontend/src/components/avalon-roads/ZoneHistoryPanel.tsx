import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { useAvalonStore } from '../../_stores/useAvalonStore';
import './AvalonRoads.css';

function getTierClass(tier: number): string {
  if (tier <= 4) return 't4';
  if (tier <= 6) return 't6';
  return 't8';
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function getIconColor(alt: string): string {
  if (alt === 'GOLD') return 'gold';
  if (alt === 'BLUE') return 'blue';
  if (alt === 'GREEN') return 'green';
  return 'resource';
}

export default function ZoneHistoryPanel() {
  const { zoneHistory } = useAvalonStore();

  if (zoneHistory.length === 0) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Zone History
        </Typography>
        <Typography className="waiting-text" variant="body2">
          No zone history yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Zone History
      </Typography>
      {zoneHistory.map((entry, i) => {
        const isGolden = entry.mapInfo?.hasGoldenChest;
        return (
          <Box key={i} className={`zone-history-row ${isGolden ? 'golden-row' : ''}`}>
            <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
              {entry.zoneName}
            </Typography>
            {entry.mapInfo && entry.mapInfo.tier > 0 && (
              <Chip label={`T${entry.mapInfo.tier}`} size="small" className={`tier-chip ${getTierClass(entry.mapInfo.tier)}`} />
            )}
            {entry.mapInfo?.icons
              .filter((ic) => ['GOLD', 'BLUE', 'GREEN'].includes(ic.alt))
              .map((ic, j) => (
                <span key={j} className={`icon-badge ${getIconColor(ic.alt)}`}>
                  {ic.alt}
                </span>
              ))}
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', whiteSpace: 'nowrap' }}>
              {timeAgo(entry.timestamp)}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
