import { AuctionType } from '@custom-types/AOData';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteByCityRequest {
  @ApiProperty()
  cityId: string;
  @ApiProperty()
  authToken: string;
}

export class OrderRequest {
  @ApiProperty()
  Id: number;
  @ApiProperty()
  ItemTypeId: string;
  @ApiProperty()
  ItemGroupTypeId: string;
  @ApiProperty()
  LocationId: number;
  @ApiProperty()
  QualityLevel: number;
  @ApiProperty()
  EnchantmentLevel: number;
  @ApiProperty()
  UnitPriceSilver: number;
  @ApiProperty()
  Amount: number;
  @ApiProperty()
  AuctionType: AuctionType;
  @ApiProperty()
  Expires: Date;
}

export class MarketOrderIngestRequest {
  @ApiProperty({ type: OrderRequest })
  Orders: OrderRequest[];
}

export class MapDataIngestRequest {
  @ApiProperty()
  ZoneID: number;
  @ApiProperty()
  BuildingType: number[];
  @ApiProperty()
  AvailableFood: number[];
  @ApiProperty()
  Reward: number[];
  @ApiProperty()
  AvailableSilver: number[];
  @ApiProperty()
  Owners: string[];
  @ApiProperty()
  PublicFee: number[];
  @ApiProperty()
  AssociateFee: number[];
  @ApiProperty()
  Coordinates: number[][];
  @ApiProperty()
  Durability: number[];
  @ApiProperty()
  Permission: number[];
}

export class OrderWithKeyResponse {
  @ApiProperty()
  key: string;
  @ApiProperty()
  Id: number;
  @ApiProperty()
  ItemTypeId: string;
  @ApiProperty()
  ItemGroupTypeId: string;
  @ApiProperty()
  LocationId: number;
  @ApiProperty()
  QualityLevel: number;
  @ApiProperty()
  EnchantmentLevel: number;
  @ApiProperty()
  UnitPriceSilver: number;
  @ApiProperty()
  Amount: number;
  @ApiProperty()
  AuctionType: AuctionType;
  @ApiProperty()
  Expires: Date;
}
