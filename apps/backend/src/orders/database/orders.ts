const cityOrders = [
  {
    Id: 11516113962,
    ItemTypeId: 'T8_2H_WARBOW@3',
    ItemGroupTypeId: 'T8_2H_WARBOW',
    LocationId: 2004,
    QualityLevel: 4,
    EnchantmentLevel: 3,
    UnitPriceSilver: 4489998,
    Amount: 1,
    AuctionType: 'offer',
    Expires: '2023-12-07T04:01:19.819Z',
    // Id: 11516301950,
    // ItemTypeId: 'T4_HEAD_PLATE_KEEPER@3',
    // ItemGroupTypeId: 'T4_HEAD_PLATE_KEEPER',
    // LocationId: 3005,
    // QualityLevel: 3,
    // EnchantmentLevel: 3,
    // UnitPriceSilver: 100_000_000,
    // Amount: 1,
    // AuctionType: 'offer',
    // Expires: '2023-12-07T06:10:14.212669',
  },
];

const blackMarketOrders = [
  {
    Id: 11516301950,
    ItemTypeId: 'T4_HEAD_PLATE_KEEPER@3',
    ItemGroupTypeId: 'T4_HEAD_PLATE_KEEPER',
    LocationId: 3003,
    QualityLevel: 3,
    EnchantmentLevel: 3,
    UnitPriceSilver: 200_000_000,
    Amount: 1,
    AuctionType: 'request',
    Expires: '2023-12-07T06:10:14.212669',
  },
];

export const seedOrders = {
  profitable: {
    cityOrders,
    blackMarketOrders,
  },
};
