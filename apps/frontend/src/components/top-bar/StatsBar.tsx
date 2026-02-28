import React from 'react';
import { Box, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useOrdersStatsStore } from '../../_stores/useOrdersStatsStore';
import { getNameByLocationId } from '../../service/utils';

export function StatsBar() {
  const { connectedClients, ordersIngestedLastMinute, totalOrdersInDb, profitableCount, ordersByCity } =
    useOrdersStatsStore();

  const cityEntries = Object.entries(ordersByCity)
    .map(([id, count]) => ({ id: Number(id), name: getNameByLocationId(Number(id)), count }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', my: 1 }}>
      <Chip icon={<PeopleIcon />} label={`${connectedClients} online`} size="small" variant="outlined" />
      <Chip icon={<TrendingUpIcon />} label={`${ordersIngestedLastMinute} orders/min`} size="small" variant="outlined" />
      <Chip icon={<StorageIcon />} label={`${totalOrdersInDb} in DB`} size="small" variant="outlined" />
      <Chip
        icon={<MonetizationOnIcon />}
        label={`${profitableCount} profitable`}
        size="small"
        variant="outlined"
        color="success"
      />
      {cityEntries.map((city) => (
        <Chip key={city.id} label={`${city.name || city.id}: ${city.count}`} size="small" variant="outlined" />
      ))}
    </Box>
  );
}
