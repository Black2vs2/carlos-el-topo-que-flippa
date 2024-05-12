import React, { useEffect } from "react";

import { Button, Dialog as MuiDialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, Typography } from "@mui/material";
import { getNameByLocationId, singularOrPluralNaming } from "../../service/utils";
import { useClearCitiesState } from "./_stores/useClearCitiesState";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import Api from "../../service/api";
import { ProfitableOrders } from "../../@types/AOData";

type DialogProps = { profitableOrders: ProfitableOrders[]; confirmCallback: (cityId: number) => void };
const Dialog: React.FunctionComponent<DialogProps> = ({ profitableOrders, confirmCallback }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { open, selectedCityId, loading, setOpen, setSelectedCityId, setLoading } = useClearCitiesState();

  const { isLoading, data, refetch, fetchStatus } = useQuery({
    queryKey: ["clearDb"],
    queryFn: () => Api.clearCity(selectedCityId).then((r) => r.data),
    enabled: false,
    refetchOnWindowFocus: false,
    retry: false,
    cacheTime: 0,

    onSuccess: (d) =>
      enqueueSnackbar(`Successfully cleared ${d.data?.count} ${singularOrPluralNaming(d.data?.count || 0, "order")}`, {
        autoHideDuration: 2000,
        variant: "success",
      }),
    onError: () => enqueueSnackbar("Error clearing city orders", { autoHideDuration: 2000, variant: "error" }),
    onSettled: async () => {
      await confirmCallback(selectedCityId);
      setOpen(false);
    },
  });

  useEffect(() => {
    setLoading(isLoading && fetchStatus !== "idle");
  }, [isLoading, fetchStatus]);

  return (
    <MuiDialog onClose={() => setOpen(false)} open={open}>
      <DialogTitle>
        <div>
          <Typography variant="h6">Do you really want to clear this city orders?</Typography>
        </div>
      </DialogTitle>
      <DialogContent>
        <Grid container rowSpacing={2}>
          <Grid item>
            <Typography variant="body2">This action will clear all the entries made by all users on this city</Typography>
          </Grid>
          <Grid item minWidth="200px">
            <Select label="City" fullWidth={true} value={selectedCityId} onChange={(e) => setSelectedCityId(Number(e.target.value))}>
              <MenuItem value={-1}>All</MenuItem>
              {Array.from(
                new Set<number>([
                  ...profitableOrders.map((o) => o.orderToSell.LocationId),
                  ...profitableOrders.flatMap((o) => o.ordersToBuy.map((o) => o.LocationId)),
                ])
              )?.map((city) => (
                <MenuItem value={city} key={city}>
                  {getNameByLocationId(city)}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color={"info"} onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button variant="outlined" color={"error"} onClick={() => refetch()}>
          Clear
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};

export default Dialog;
