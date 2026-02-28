import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { useAvalonStore } from '../../_stores/useAvalonStore';
import { ChestStatus } from '../../@types/avalon.types';
import './AvalonRoads.css';

function getChestStatusClass(status: ChestStatus): string {
  return status.toLowerCase();
}

function getChestTypeIcon(type: string): string {
  switch (type.toUpperCase()) {
    case 'GOLD':
      return 'gold';
    case 'BLUE':
      return 'blue';
    case 'GREEN':
      return 'green';
    default:
      return 'resource';
  }
}

export default function ChestStatusPanel() {
  const { activeChests } = useAvalonStore();

  return (
    <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Chest Status
      </Typography>
      {activeChests.length === 0 ? (
        <Typography className="waiting-text" variant="body2">
          No active chests
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {activeChests.map((chest) => (
            <Box
              key={chest.id}
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.04)' }}
            >
              <span className={`icon-badge ${getChestTypeIcon(chest.chestType)}`}>{chest.chestType}</span>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {chest.zoneName}
              </Typography>
              <Chip label={chest.status} size="small" className={`chest-status ${getChestStatusClass(chest.status)}`} />
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
