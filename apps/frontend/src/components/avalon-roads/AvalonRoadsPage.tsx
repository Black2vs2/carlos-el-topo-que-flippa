import React, { useEffect } from 'react';
import { Box, Grid, Snackbar, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import Api from '../../service/api';
import { useAvalonStore } from '../../_stores/useAvalonStore';
import { setupAvalonSocketListeners, cleanupAvalonSocketListeners } from '../../service/avalon-socket';
import { socket } from '../../service/socket';

import CurrentZonePanel from './CurrentZonePanel';
import ZoneHistoryPanel from './ZoneHistoryPanel';
import PortalActivityPanel from './PortalActivityPanel';
import ChestStatusPanel from './ChestStatusPanel';
import './AvalonRoads.css';

export default function AvalonRoadsPage() {
  const { setFullState, goldenAlert, setGoldenAlert } = useAvalonStore();

  useQuery({
    queryKey: ['avalon-state'],
    queryFn: () =>
      Api.getAvalonState().then((r) => {
        setFullState(r.data);
        return r.data;
      }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    setupAvalonSocketListeners();
    return () => {
      cleanupAvalonSocketListeners();
    };
  }, []);

  return (
    <Box className="avalon-container">
      <CurrentZonePanel />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ZoneHistoryPanel />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" gap={2}>
            <PortalActivityPanel />
            <ChestStatusPanel />
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={!!goldenAlert}
        autoHideDuration={6000}
        onClose={() => setGoldenAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setGoldenAlert(null)} sx={{ bgcolor: '#b8860b' }}>
          Golden Chest Zone: {goldenAlert?.name} (T{goldenAlert?.tier})
        </Alert>
      </Snackbar>
    </Box>
  );
}
