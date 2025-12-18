export type PromoType = "PERCENTAGE" | "FLAT";

export interface Promo {
  id: string;
  couponId: string;
  code: string;
  couponCode: string;
  type: PromoType;
  value: number;
  validFrom: string;
  validTo: string;
  maxDiscountPerRide: number;
  totalUsageLimit: number;
}

export interface PromoForm {
  code: string;
  type: PromoType;
  value: number;
  validFrom?: string;
  validTo?: string;
  maxDiscountPerRide: number;
  totalUsageLimit: number;
  couponId?: string;
}