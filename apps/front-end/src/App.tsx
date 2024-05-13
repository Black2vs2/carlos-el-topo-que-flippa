import React, { useEffect, useState } from 'react';

import { Grid, CircularProgress, Backdrop, Skeleton, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

import { ProfitableOrders } from './@types/AOData';

import { singularOrPluralNaming } from './service/utils';
import { OrdersTable, ClearCitiesDialog } from './components';
import Api from './service/api';
import { socket } from './service/socket';
import { useClearCitiesState } from './components/dialog/_stores/useClearCitiesState';
import { TopBarPremium } from './components/top-bar/TopBarPremium';
import { TopBarActions } from './components/top-bar/TopBarActions';
import { TopBarAutorefresh } from './components/top-bar/TopBarAutorefresh';
import useTabActive from './hooks/FocusHandler';
import { useFiltersStore } from './_stores/useFiltersStore';
import { useCallback } from 'react';

function App() {
  const { enqueueSnackbar } = useSnackbar();
  const { loading: isClearLoading } = useClearCitiesState();
  const { autorefreshChecked } = useFiltersStore();

  const {
    isLoading: orderIsLoading,
    data: profitableOrders,
    refetch: orderRefetch,
  } = useQuery<ProfitableOrders[]>({
    queryKey: ['orders'],
    queryFn: () => Api.allOrders().then((r) => r.data),
    refetchOnWindowFocus: false,
    retry: false,
    cacheTime: 0,
    onSuccess: (d) =>
      enqueueSnackbar(`Successfully refreshed list (${d.length} ${singularOrPluralNaming(d.length, 'order')})`, {
        autoHideDuration: 1000,
        variant: 'success',
      }),
    onError: () => enqueueSnackbar('Error refreshing list', { autoHideDuration: 1000, variant: 'error' }),
  });

  const onRefresh = useCallback(async () => {
    if (orderIsLoading) return;
    await orderRefetch();
  }, [orderIsLoading, orderRefetch]);

  useEffect(() => {
    const interval = autorefreshChecked ? setInterval(onRefresh, 3000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autorefreshChecked, onRefresh]);

  // useEffect(() => {
  //   socket.connect();
  // }, [socket]);
  // useEffect(() => {
  //   function onOrdersEvent(value: ProfitableOrders[]) {
  //     console.log("value", value);
  //   }

  //   socket.on("orders", onOrdersEvent);

  //   return () => {
  //     socket.off("orders", onOrdersEvent);
  //   };
  // }, []);
  /**
   * Add clear last X hours
   * Add possibility to compare prices in cities for materials
   * 
   */

  return (
    <>
      {/* <button
        onClick={() => {
          socket.emit("orders", test);
        }}
      ></button> */}
      {/* <CollapsibleTable /> */}
      <Typography variant="h1" align="center" fontWeight={'500'} className="text-title">
        Carlos el topo que flippa
      </Typography>
      <ClearCitiesDialog confirmCallback={() => onRefresh()} profitableOrders={profitableOrders || []} />
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isClearLoading || orderIsLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container justifyContent="center" display="grid" rowSpacing={3} marginTop={1}>
        <Grid item container columnGap={2}></Grid>
        <Grid item container>
          <Grid container item xs={9} columnGap={2}>
            {TopBarActions(isClearLoading || orderIsLoading, onRefresh)}
            {/* {TopBarFilter(maxCost, setMaxCost, minProfit, setMinProfit)} */}
          </Grid>
          {TopBarAutorefresh()}
          {TopBarPremium()}
        </Grid>
        <Grid item>
          {orderIsLoading ? (
            <Skeleton variant="rounded" width="990px" height={500} animation="wave" />
          ) : (
            <OrdersTable rows={profitableOrders || []} />
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default App;
