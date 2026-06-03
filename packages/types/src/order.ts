
export type OrderItemType = {
  id: number;
  productName: string;
  sku: string;
  quantity: number;
  priceAtPurchase: number;
  variant: {
    id: number;
    product: { name: string };
    attributeValues: { attribute: { name: string }; value: string }[];
  }
};

export type OrderType = {
  id: number;
  user?: { id?: number; name?: string; email?: string };
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  status: string;
  /** Backend: cột legacy; với VNPay chứa mã tham chiếu giao dịch (vnp_TxnRef). */
  stripeSessionId?: string | null;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemType[];
};

export type OrderChartType = {
  month: string;
  total: number;
  successful: number;
};