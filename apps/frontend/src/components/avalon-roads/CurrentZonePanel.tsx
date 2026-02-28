import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useAvalonStore } from '../../_stores/useAvalonStore';
import './AvalonRoads.css';

function getTierClass(tier: number): string {
  if (tier <= 4) return 't4';
  if (tier <= 5) return 't5';
  if (tier <= 6) return 't6';
  if (tier <= 7) return 't7';
  return 't8';
}

function getIconColor(alt: string): string {
  if (alt === 'GOLD') return 'gold';
  if (alt === 'BLUE') return 'blue';
  if (alt === 'GREEN') return 'green';
  return 'resource';
}

export default function CurrentZonePanel() {
  const { currentZone, zoneHistory } = useAvalonStore();

  const latestEntry = zoneHistory.length > 0 ? zoneHistory[0] : null;
  const mapInfo = latestEntry?.mapInfo;

  if (!currentZone) {
    return (
      <Box className="zone-panel">
        <Typography className="waiting-text" variant="h5">
          Waiting for zone data...
        </Typography>
      </Box>
    );
  }

  const panelClass = [
    'zone-panel',
    mapInfo?.hasGoldenChest ? 'golden' : '',
    !mapInfo?.hasGoldenChest && mapInfo?.hasBlueChest ? 'blue-chest' : '',
    !mapInfo?.hasGoldenChest && !mapInfo?.hasBlueChest && mapInfo?.hasGreenChest ? 'green-chest' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box className={panelClass}>
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Typography className="zone-name">{currentZone}</Typography>
        {mapInfo && mapInfo.tier > 0 && (
          <Chip label={`T${mapInfo.tier}`} size="small" className={`tier-chip ${getTierClass(mapInfo.tier)}`} />
        )}
      </Box>
      {mapInfo && (
        <Box display="flex" gap={1} flexWrap="wrap">
          {mapInfo.icons.map((icon, i) => (
            <span key={i} className={`icon-badge ${getIconColor(icon.alt)}`}>
              {icon.alt}
              {icon.badge ? ` x${icon.badge}` : ''}
            </span>
          ))}
        </Box>
      )}
    </Box>
  );
}
