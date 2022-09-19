import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Helper } from '../helper';
import { Coord } from '../Models/Coord';
import { Tag } from '../Models/tag';
declare var ol: any;

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.css']
})
export class MapDashboardComponent extends Helper implements OnInit {
  latitude: number;
  longitude: number;
  tags: Tag[];
  currentTag: Tag;
  map: any;
  constructor() {
    super();
    this.latitude = this.QUEBEC_CITY.latitude;
    this.longitude = this.QUEBEC_CITY.longitude;
    this.tags = [];
    this.currentTag = new Tag();
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
      // [0]: latt, [1]: long.
      let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      let Coordinates = new Coord(Coords[0] ,Coords[1]);
      if (this.map.getView().getZoom() >= 18) {
        this.createTag(Coordinates);
      } else {
        this.setCenter(Coordinates);
      }
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
      // check pour tag fais avec createTag()
      if (this.map.hasFeatureAtPixel(event.pixel) === true) {
        console.log(event, "event")
        console.log(this.map, "this.map")
          var coordinate = event.coordinate;

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

  createTag(Coord: Coord) {
    let layer = new ol.layer.Vector({
      source: new ol.source.Vector({
          features: [
              new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat([Coord.longitude, Coord.latitude]))
              })
          ]
      })
    });

    let ids:any = [];
     this.tags.forEach(tag=>{
      ids.push(tag._id);
     })
    let highestId = Math.max(ids);
    let newId = highestId ? highestId + 1 : 1;
    let newTag: Tag = {
      _id: newId,
      coord: Coord = {longitude: Coord.longitude,latitude: Coord.latitude},
    };
    layer.tag = newTag;

    this.map.addLayer(layer);
    this.tags.push(newTag);
    // console.log(layer, "layer")
  }

  saveTag() {
    console.log(  this.currentTag);
  }

}
