import { Component, OnInit } from '@angular/core';
import { Helper } from '../helper';
import { Coord } from '../Models/Coord';
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
          minZoom: 14,
          source: new ol.source.OSM(),
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.longitude, this.latitude]),
        minZoom: 14,
        constrainOnlyCenter: true,
        zoom: 14
      })
    });

    this.map.on('click', (evt: any) => {
      console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
      // Donne [0]: latt, [1]: long.
      let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      let Coordinates = new Coord(Coords[1], Coords[0]);
      this.createTag(Coordinates);
      this.setCenter(Coordinates);
    })
    this.initPopup();
  }

  initPopup() {
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    var overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });
    this.map.addOverlay(overlay);
    if (closer) {
      closer.onclick = function() {
          overlay.setPosition(undefined);
          if (closer) {closer.blur();}
          return false;
      };
    }
    this.map.on('singleclick',  (event: any) => {

      if (this.map.hasFeatureAtPixel(event.pixel) === true) {
        console.log(event)
        console.log(this.map)
          var coordinate = event.coordinate;

      //   if (content){content.innerHTML = '<b>Hello world!</b><br />I am a popup.';}
          overlay.setPosition(coordinate);
      } else {
          overlay.setPosition(undefined);
          if (closer) {closer.blur();}
      }
  });
  }

  setCenter(Coord: Coord) {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([Coord.longitude, Coord.latitude]));
    view.setZoom(18);
  }

  // Mettre pour que zoom 18 sois le minimum pour mettre un poiunt
  createTag(Coord: Coord) {
    var layer = new ol.layer.Vector({
      source: new ol.source.Vector({
          features: [
              new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat([Coord.longitude, Coord.latitude]))
              })
          ]
      })
    });
  this.map.addLayer(layer);
  }

}
