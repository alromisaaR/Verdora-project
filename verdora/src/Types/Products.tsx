export interface Products {
  id: string; // غير لـ string
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  bestseller: boolean;
  oldprice: string;
  rate: string;
  review: string;
  discount: string;
  isNew: boolean;
  scientificName: string;
  nativeRegion: string;
  lifeCycle: string;
  genus: string;
  type: string;
  climate: string;
  soilType: string;
  wateringNeeds: string;
  sunlight: string;
  humidity: string;
  growthRate: string;
  propagation: string;
  toxicity: string;
  careTips: string;
  floweringSeason: string;
  height: string;
  containerType: string;
}

export type Product = Products;
