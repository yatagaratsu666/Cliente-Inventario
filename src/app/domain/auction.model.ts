export interface Bid {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
}

export interface ItemRef {
  id: string;
  userId?: string;
  name?: string;
  isAvailable?: boolean;
  type?: string;
  description?: string;
  imagen?: string;
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
