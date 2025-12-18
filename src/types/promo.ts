export type PromoType = "percentage" | "flat";

export type Promo = {
  code: string;
  type: PromoType;
  value: number;
  validFrom?: string;
  validTo?: string;
  maxDiscountPerRide?: number;
  totalUsageLimit?: number;
};
