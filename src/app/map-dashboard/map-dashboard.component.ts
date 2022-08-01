import { Component, OnInit } from '@angular/core';
import { Helper } from '../helper';
declare var ol: any;

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.css']
})
export class MapDashboardComponent extends Helper implements OnInit {
  latitude: number;
  longitude: number;

  map: any;
  constructor() {
    super();
    this.latitude = this.QUEBEC_CITY.latitude;
    this.longitude = this.QUEBEC_CITY.longitude;
  }

  ngOnInit() {

    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.longitude, this.latitude]),
        zoom: 8
      })
    });
  }



  setCenter() {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(8);
  }

}
