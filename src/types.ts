export interface EVModel {
  id: string;
  name: string;
  brand: string;
  category: 'cars' | 'scooters' | 'bikes' | 'commercial';
  priceMin: number; // in Lakhs (e.g. 14.49)
  priceMax: number; // in Lakhs (e.g. 19.99)
  range: number; // in km (e.g. 465)
  rangeType: string; // 'MIDC' or 'ARAI'
  battery: string; // '40.5 kWh', etc.
  power: string; // '142.68 bhp', etc.
  torque?: string; // '250 Nm'
  topSpeed?: string; // '150 kmph'
  acceleration?: string; // '8.9 seconds'
  chargingTime: string; // '56 mins (10-80%)'
  chargingAC?: string; // '7.2 kW (Type 2)'
  chargingDC?: string; // '50 kW (CCS2)'
  rating: number; // 4.8
  reviewsCount: number; // 342
  seatingCapacity: number; // 5, 4, 7
  featured: boolean;
  popular: boolean;
  newLaunch: boolean;
  image: string;
  thumbnails: string[];
  pros: string[];
  cons: string[];
  description: string;
}

export type PageType = 'home' | 'listings' | 'detail' | 'compare' | 'savings-calc' | 'emi-calc';
