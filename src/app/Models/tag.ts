
export class Tag {
  id?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  title?: string;
  label?: string;
  transport?: any
  emotion?: any;
  trajectory?: any
  rgb?: any;
  heart: number;
  flagged?: number;

  constructor() {
    this.heart = 0;
  }


}
