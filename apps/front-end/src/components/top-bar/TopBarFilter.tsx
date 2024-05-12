import React from "react";
import { Grid, TextField } from "@mui/material";

function TopBarFilter(
  maxCost: number,
  setMaxCost: React.Dispatch<React.SetStateAction<number>>,
  minProfit: number,
  setMinProfit: React.Dispatch<React.SetStateAction<number>>
) {
  return (
    <>
      <Grid item>
        <TextField
          label="Maximum Cost"
          variant="outlined"
          type="number"
          value={maxCost}
          onChange={(e) => setMaxCost(Number(e.target.value))}
        />
      </Grid>
      <Grid item>
        <TextField
          label="Minimum Profit"
          variant="outlined"
          type="number"
          value={minProfit}
          onChange={(e) => setMinProfit(Number(e.target.value))}
        />
      </Grid>
    </>
  );
}
