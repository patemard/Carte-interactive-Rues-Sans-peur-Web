import { Component, NgZone, OnInit } from '@angular/core';
import { Helper } from '../helper';
import { Tag } from '../Models/tag';
import { TagService } from '../Service/tag.service';
import { Router } from '@angular/router';
import { Coordinates } from '../Models/Coordinates';
declare var ol: any;

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.css']
})

export class MapDashboardComponent extends Helper implements OnInit {
  latitude: number = 0;
  longitude: number = 0;
  currentTag: Tag = new Tag;
  map: any; 
  description: string = '';
  title: string = '';
  selectedEmotion: any;
  selectedTransport: any;
  layer: any;
  showPopup: boolean = false;
  disableEdit: boolean = false;
  tagList: any = [];

  emotions = [
    { name: "Évènement", icon: "circle-exclamation"},
    { name: "Fierté ", icon: "face-smile", class: "yellow" },
    { name: "Tristesse ", icon: "face-sad-tear"  },
    { name: "Frustration", icon: "face-angry" },
    { name: "Peur", icon: "frown-open"}
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
    this.initializeOnLoad();
  }

  initializeOnLoad() {
    this.latitude = this.QUEBEC_CITY.latitude;
    this.longitude = this.QUEBEC_CITY.longitude;
    this.currentTag = new Tag();
    this.description = '';
    this.title = '';  
    this.showPopup = false;
    this.disableEdit = false;
    this.selectedEmotion = '';
    this.selectedTransport = '';
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
    this.map.addEventListener('wheel', this.processWheelEvent)
    this.initPopup();
    this.getTags();
  }

  getTags() {
    this.tagService.getTags()
    .subscribe(data => {
      this.tagList = data;
      console.log(data)
      this.populateLayers();
    })
  }

  populateLayers() {
    // let tagListGeoJson = [];
    // for (let i = 0; i < this.tagList.length; i++) {
    //   const tag = this.tagList[i];
    //   tagListGeoJson.push(this.mapToGeoJSON(tag));
    // }
    // let tagListString = JSON.stringify(tagListGeoJson)
    // let tagListGeoJSONFormat = tagListString.slice(1,-1);

    let vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        // url:,
        format: new ol.format.GeoJSON(),
        wrapX: false
      })
    });

    // console.log(tagListGeoJSONFormat)
    
    // const features = new ol.format.GeoJSON().readFeatures(tagListGeoJSONFormat);
    // vector.addFeatures(features);

    this.map.addLayer(vector);
    
  }

  mapToGeoJSON(tag: any) {
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [Number(tag.latitude), Number(tag.longitude)] 
      },
      "properties": {
        "title": tag.title,
        "description": tag.text,
        "transport": tag.transport,
        "emotion": tag.emotion
      }
    }
  }

  processWheelEvent(evt: any) {
    evt.preventDefault();
  }

  initPopup() {
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    // var closer = document.getElementById('popup-closer');

    var overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    });

    this.map.addOverlay(overlay);
    this.map.on('click', (evt: any) => {
      if (this.map.hasFeatureAtPixel(evt.pixel) === true) {
        var feature = this.map.forEachFeatureAtPixel(evt.pixel, 
          function(feature: any) {
            return feature;
          })
          
        this.currentTag = {
          id: feature.values_.data.id,
          title: feature.values_.data.title,
          description: feature.values_.data.text,
         }
        this.selectedEmotion = feature.values_.data.emotion;
        this.selectedTransport = feature.values_.data.transport;
        this.showPopup = true;
        this.disableEdit = true;
        console.log( feature.values_.data)
        
      } else {
        this.initializeOnLoad();
        // [0]: latt, [1]: long.
        let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.currentTag.coordinates = new Coordinates(Coords[0] ,Coords[1]);
        
        if (this.map.getView().getZoom() >= 18) {
          this.showPopup = true;
          overlay.setPosition(evt.coordinate);
        } else {
          this.setCenter(this.currentTag.coordinates);
        }
      }
    })
  }
  

  setCenter(Coord: Coordinates) {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([Coord.longitude, Coord.latitude]));
    view.setZoom(18);
  }

  /**
   * Creates the tag's visual point on the map.
   * @param data - tag data
   */
  createTag(data: any) {
    this.layer = new ol.layer.Vector({
      source: new ol.source.Vector({
          features: [
              new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat([data.longitude, data.latitude])),
                  data: data
              })
          ]
      })
    });

    this.map.addLayer(this.layer);

  }


  onSubmit(): any {
    if (this.isFormValid()) {
      this.currentTag.emotion = this.selectedEmotion;
      this.currentTag.transport = this.selectedTransport;

      this.tagService.addTag(this.currentTag)
      .subscribe((data) => {
          console.log('Data added successfully!', data)
          this.ngZone.run(() => this.router.navigateByUrl('/Map'))
          this.createTag(data);
          this.initializeOnLoad();
        }, (err: any) => {
          console.log(err);
      });
    }

  }

  isFormValid(): boolean {
    return !!(
      this.currentTag.title && 
      this.selectedEmotion && 
      this.selectedTransport &&
      this.currentTag.description
      ) 
  }

  log() {
    console.log(this.currentTag);
  }

}
