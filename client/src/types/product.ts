export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number;
  category?: string;
  slug?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
