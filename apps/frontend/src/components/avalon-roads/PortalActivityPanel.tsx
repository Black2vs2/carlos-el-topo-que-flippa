import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useAvalonStore } from '../../_stores/useAvalonStore';
import './AvalonRoads.css';

function getPortalDangerClass(count: number): string {
  if (count === 0) return 'empty';
  if (count <= 2) return 'safe';
  if (count <= 5) return 'caution';
  return 'danger';
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export default function PortalActivityPanel() {
  const { portals } = useAvalonStore();

  return (
    <Paper sx={{ p: 2, bgcolor: 'rgba(30,30,45,0.6)', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Portal Activity
      </Typography>
      {portals.length === 0 ? (
        <Typography className="waiting-text" variant="body2">
          No portal activity detected
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(100,100,140,0.2)' }}>Zone</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(100,100,140,0.2)' }}>Players</TableCell>
                <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(100,100,140,0.2)' }}>Last Seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portals.map((portal) => (
                <TableRow key={portal.id}>
                  <TableCell sx={{ borderBottom: '1px solid rgba(100,100,140,0.1)' }}>
                    {portal.zoneName}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(100,100,140,0.1)' }}>
                    <span className={`portal-indicator ${getPortalDangerClass(portal.playerCount)}`} />
                    {portal.playerCount} {portal.playerCount === 1 ? 'player' : 'players'} in last 5 min
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid rgba(100,100,140,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                    {timeAgo(portal.lastSeen)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
