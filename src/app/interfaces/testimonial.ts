export interface Testimonial {
  _id: number;
  name: string;
  designation?: string;
  organization?: string;
  message: string;
  rating: number; // 1-5
  stars: number[]; // precomputed array for template iteration
}
