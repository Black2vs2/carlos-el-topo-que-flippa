import React from 'react';
import { Checkbox, FormControlLabel, Grid } from '@mui/material';
import { useFiltersStore } from '../../_stores/useFiltersStore';

export function TopBarAutorefresh() {
  const { autorefreshChecked, setAutorefreshChecked } = useFiltersStore();

  return (
    <Grid container item justifyContent="right" alignItems="center" xs={1}>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox value={autorefreshChecked} checked={autorefreshChecked} onChange={(e) => setAutorefreshChecked(e.target.checked)} />
          }
          label="Autorefresh"
        />
      </Grid>
    </Grid>
  );
}
