import { Coord } from "./Coord";

export class Tag {
  coord: Coord;
  text: string;
  title: string;

  constructor(latitude?: number,
    longitude?: number,
    text?: string,
    title?: string,

    ) {
    this.coord = new Coord(latitude, longitude);
    this.text = text || '';
    this.title = title || '';

  }

}
