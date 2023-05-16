import { Component, NgZone, OnInit } from '@angular/core';
import { Helper } from '../helper';
import { Coord } from '../Models/Coord';
import { Tag } from '../Models/tag';
import { TagService } from '../Service/tag.service';
import { Router } from '@angular/router';
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
  description: string;
  title: string;
  selectedEmotion: any;
  selectedTransport: any;

  emotions = [
    { name: "Évènement", icon: "circle-exclamation", color: "blue" },
    { name: "Fierté ", icon: "face-smile", color: "yellow" },
    { name: "Tristesse ", icon: "face-sad-tear", color: "light-blue" },
    { name: "Frustration", icon: "face-angry", color: "purple" },
    { name: "Peur", icon: "frown-open", color: "red" }
  ]

  transports = [
    { name: "Marche", icon: "person-walking"},
    { name: "Vélo ", icon: "bicycle"},
    { name: "Bus ", icon: "bus" },
    { name: "Voiture ", icon: "car"},
  ]

  constructor(
      private tagService: TagService,
      private router: Router,
      private ngZone: NgZone,
      ) {
    super();
    this.latitude = this.QUEBEC_CITY.latitude;
    this.longitude = this.QUEBEC_CITY.longitude;
    this.tags = [];
    this.currentTag = new Tag();
    this.description = '';
    this.title = '';
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
    this.map.on('click', (evt: any) => {
      console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
      // [0]: latt, [1]: long.
      let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      let Coordinates = new Coord(Coords[0] ,Coords[1]);
      this.currentTag.coord = Coordinates;
      if (this.map.getView().getZoom() >= 18) {
        this.createTag(Coordinates);
      } else {
        this.setCenter(Coordinates);
      }

    })
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

    this.map.addLayer(layer);
  }


  onSubmit(): any {
    this.tagService.addTag(this.currentTag)
    .subscribe(() => {
        console.log('Data added successfully!')
        this.ngZone.run(() => this.router.navigateByUrl('/Map'))
      }, (err: any) => {
        console.log(err);
    });
  }

  log() {
    console.log(this.currentTag);
  }

  }
