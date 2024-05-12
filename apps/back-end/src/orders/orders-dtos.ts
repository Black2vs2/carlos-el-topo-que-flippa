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
