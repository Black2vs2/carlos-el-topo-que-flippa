import * as React from 'react';

import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Button, Checkbox } from '@mui/material';
import './OrdersTable.css';
import { OrderWithKey, ProfitableOrders } from '../../@types/AOData';
import { PREMIUM_TAX_AMOUNT, QUALITIES_COLORS, QUALITIES_NAMES, TAX_AMOUNT } from '../../service/consts';
import { getNameByLocationId } from '../../service/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useFiltersStore } from '../../_stores/useFiltersStore';
import { useDataStore } from '../../_stores/useDataStore';
dayjs.extend(relativeTime);

type TableProps = {
  rows: ProfitableOrders[];
};
const OrdersTable: React.FunctionComponent<TableProps> = ({ rows }) => {
  const headers = [
    'Name',
    'Buy Quality',
    'Buy Price',
    'Buy Location',
    'Buy SeededAt',
    'Sell Quality',
    'Sell Price',
    'Sell SeededAt',
    'Quantity',
    'Profit',
    'Cost/Profit',
    'Actions',
  ];
  const { premiumChecked } = useFiltersStore();
  const { checkedIds, addCheckedId, removeCheckedId } = useDataStore();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Consider</TableCell>
            {/* <TableCell>ID</TableCell> */}
            {headers.map((header) => (
              <TableCell align="center" key={header} className={`table-header-row-cell ${header}`}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows
            ?.map((profitableOrder) => buildSortableOrders(profitableOrder, premiumChecked))
            .filter((sortableOrder) => sortableOrder.taxedProfit > 0)
            .sort((a, b) => b.taxedProfit - a.taxedProfit)
            .map(({ sortableOrder, taxedProfit }) =>
              buildTableRow(sortableOrder, taxedProfit, { checkedIds, addCheckedId, removeCheckedId })
            )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function buildTableRow(
  data: ProfitableOrders,
  taxedProfit: number,
  {
    addCheckedId,
    checkedIds,
    removeCheckedId,
  }: {
    checkedIds: number[];
    addCheckedId: (value: number) => void;
    removeCheckedId: (value: number) => void;
  }
): JSX.Element {
  const itemKey = data.Key;
  const itemName = data.name;
  const beautifiedName = `${itemName} ${itemKey.charAt(1)}.${itemKey.split('@')?.[1] || 0}`;
  const buyItem = data.ordersToBuy[0];
  const sellItem = data.orderToSell;

  const buySeededAt = dayjs(buyItem.SeededAt).fromNow();
  const sellSeededAt = dayjs(sellItem.SeededAt).fromNow();

  const costProfitRatio = taxedProfit / buyItem.UnitPriceSilver;

  const printInfo = () => {
    console.log(data, taxedProfit);
  };

  function getColorByPrice(price: number, maximumAmount: number, invert = false): string {
    const intensity = Math.min(price / maximumAmount, 1);
    let red = Math.floor(255 * intensity);
    let green = Math.floor(255 * (1 - intensity));

    if (invert) {
      [red, green] = [green, red];
    }
    return `rgba(${red}, ${green}, 10, 0.4)`;
  }

  function toggleIsChecked(id: number) {
    if (checkedIds.find((c) => c === id) !== undefined) {
      removeCheckedId(id);
    } else {
      addCheckedId(id);
    }
  }

  return (
    <TableRow key={buyItem.Id} className="table-row">
      {/* <TableCell>{buyItem.Id}</TableCell> */}
      <TableCell>
        <Checkbox checked={checkedIds.find((c) => c === buyItem.Id) !== undefined} onChange={() => toggleIsChecked(buyItem.Id)} />
      </TableCell>
      {/* <TableCell className="table-body-row-cell">{itemKey}</TableCell> */}
      <TableCell>{beautifiedName}</TableCell>
      <TableCell className="buy">
        {qualityTagbox(QUALITIES_COLORS[buyItem.QualityLevel - 1], QUALITIES_NAMES[buyItem.QualityLevel - 1])}
      </TableCell>
      <TableCell className="buy number">{priceTagbox(getColorByPrice, buyItem)}</TableCell>
      <TableCell className="buy">{getNameByLocationId(buyItem.LocationId) || buyItem.LocationId}</TableCell>
      <TableCell className="buy">{buySeededAt}</TableCell>
      <TableCell className="sell">
        {qualityTagbox(QUALITIES_COLORS[sellItem.QualityLevel - 1], QUALITIES_NAMES[sellItem.QualityLevel - 1])}
      </TableCell>
      <TableCell className="sell number">{sellItem.UnitPriceSilver.toLocaleString('it-IT')}</TableCell>
      <TableCell className="sell">{sellSeededAt}</TableCell>
      <TableCell style={{ textAlign: 'center' }}>{sellItem.Amount}</TableCell>
      <TableCell className="profit number">{taxedProfit.toLocaleString('it-IT')}</TableCell>
      <TableCell className="number" style={{ background: getColorByPrice(costProfitRatio, 0.25, true), textAlign: 'center' }}>
        {costProfitRatio.toFixed(2)}
      </TableCell>
      <TableCell>
        <Button variant="contained" color={'info'} onClick={() => printInfo()}>
          Print Info
        </Button>
      </TableCell>
    </TableRow>
  );
}

function qualityTagbox(qualityColor: string, qualityName: string) {
  // function getContrastColor(bgColor: string): string {
  //   if (!qualityColor) return "black";
  //   const brightness = Math.round((color.r * 299 + color.g * 587 + color.b * 114) / 1000);
  //   return brightness > 125 ? "black" : "white";
  // }
  return (
    <div
      style={{
        background: qualityColor,
        textAlign: 'center',
        padding: '10px 6px',
        borderRadius: '10px',
        // color: getContrastColor(qualityColor),
      }}
    >
      {qualityName}
    </div>
  );
}

function priceTagbox(getColorByPrice: (price: number, maximumAmount: number, invert?: boolean) => string, buyItem: OrderWithKey) {
  return (
    <div
      style={{
        background: getColorByPrice(buyItem.UnitPriceSilver, 2500000),
        textAlign: 'center',
        padding: '10px 14px',
        borderRadius: '50px',
      }}
    >
      {buyItem.UnitPriceSilver.toLocaleString('it-IT')}
    </div>
  );
}

function buildSortableOrders(data: ProfitableOrders, premiumTaxCheck: boolean): { sortableOrder: ProfitableOrders; taxedProfit: number } {
  let buyItem = data.ordersToBuy[0];

  if (data.ordersToBuy.length > 1) {
    buyItem = data.ordersToBuy.reduce((prev, curr) => (prev.UnitPriceSilver < curr.UnitPriceSilver ? prev : curr));
  }

  const sellItem = data.orderToSell;

  const taxedSellProfit = sellItem.UnitPriceSilver - sellItem.UnitPriceSilver * (premiumTaxCheck ? PREMIUM_TAX_AMOUNT : TAX_AMOUNT);
  const taxedProfit = Math.round(taxedSellProfit - buyItem.UnitPriceSilver);

  return { sortableOrder: { ...data, ordersToBuy: [buyItem] }, taxedProfit };
}

export default OrdersTable;
