export interface Bid {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface ItemRef {
  id: string;
  name?: string;
  imagen?: string;
  userId?: string;
  type?: string;
  description?: string;
}

export interface AuctionDTO {
  id: string;
  title?: string;
  description?: string;
  currentPrice: number;
  startingPrice?: number;
  buyNowPrice?: number | null;
  createdAt: string;
  endsAt: string;
  bids?: Bid[];
  highestBid?: Bid | null;
  highestBidderId?: string | null;
  item?: ItemRef | null;
  isClosed?: boolean;
}
