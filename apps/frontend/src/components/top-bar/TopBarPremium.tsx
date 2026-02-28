import React from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { useFiltersStore } from '../../_stores/useFiltersStore';

export function TopBarPremium() {
  const { premiumChecked, setPremiumChecked } = useFiltersStore();

  return (
    <Grid container item justifyContent="right" alignItems="center" xs={2}>
      <Grid item>
        <FormControlLabel
          control={<Checkbox value={premiumChecked} checked={premiumChecked} onChange={(e) => setPremiumChecked(e.target.checked)} />}
          label="I have Premium"
        />
      </Grid>
    </Grid>
  );
}
