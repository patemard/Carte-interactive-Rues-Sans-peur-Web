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
  constructor() { super();}

  ngOnInit() {

    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.QUEBEC.latitude, this.QUEBEC.longitude]),
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
