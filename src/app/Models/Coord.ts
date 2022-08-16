export class Coord {
  latitude: number;
  longitude: number;

  constructor(longitude?: number, latitude?: number) {
    this.latitude = latitude || 0;
    this.longitude = longitude || 0;
  }


}

