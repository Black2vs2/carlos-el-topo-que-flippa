import React from "react";
import { Button } from "@mui/material";
import { useClearCitiesState } from "../dialog/_stores/useClearCitiesState";

export const TopBarActions = (isAnythingLoading: boolean, onRefresh: () => void) => {
  const { setOpen } = useClearCitiesState();
  return (
    <>
      <Button variant="contained" color={"info"} disabled={isAnythingLoading} onClick={() => onRefresh()}>
        REFRESH
      </Button>
      <Button variant="outlined" color={"error"} disabled={isAnythingLoading} onClick={() => setOpen(true)}>
        CLEAR CITY ORDERS
      </Button>
    </>
  );
};
