
export class Tag {
  id?: string;
  active?: boolean;
  latitude?: number;
  longitude?: number;
  mercatorCoord?: any;
  description?: string;
  title?: string;
  label?: string;
  transport?: any
  emotion?: any;
  trajectory?: any
  rgb?: any;
  heart: string[];
  flagged?: string[];
  identification?: string;

  constructor() {
    this.heart = [];
    this.flagged = [];

  }


}
