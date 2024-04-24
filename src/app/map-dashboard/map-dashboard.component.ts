import { Component, NgZone, OnInit } from '@angular/core';
import { Helper } from '../helper';
import { Tag } from '../Models/tag';
import { TagService } from '../Service/tag.service';
import { Router } from '@angular/router';
import { Coordinates } from '../Models/Coordinates';
declare var ol: any;
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import Text from 'ol/style/Text';

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
  emotions: {name: string, icon: string, class?: string, rgb?: string}[] = [
    { name: "Évènement", icon: "circle-exclamation", class: "text-success", rgb: "rgba(40, 167, 69, 0.8)"},
    { name: "Fierté ", icon: "face-smile", class: "text-warning", rgb: "rgba(255, 193, 7, 0.8)" },
    { name: "Tristesse ", icon: "face-sad-tear", class: "text-primary", rgb: "rgba(0, 123, 255, 0.8)"  },
    { name: "Frustration", icon: "face-angry" , class: "text-danger", rgb: "rgba(220, 53, 69, 0.8)"},
    { name: "Peur", icon: "frown-open", class: "text-info", rgb: "rgba(91, 162, 184, 0.8)"}
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
    this.selectedEmotion = ''
    this.selectedTransport = '';
  }

  ngOnInit() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          minZoom: 12,
          source: new OSM(),
        })
      ],
      view: new View({
        center: fromLonLat([this.longitude, this.latitude]),
        minZoom: 13,
        constrainOnlyCenter: true,
        zoom: 14
      })
    });
    this.map.addEventListener('wheel', this.processWheelEvent)
    this.initPopup();
    this.getTags();
    // this.loadMarkerData()
  }

  processWheelEvent(evt: any) {
    evt.preventDefault();
  }

  initPopup() {
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    // var closer = document.getElementById('popup-closer');
    if(container) {
      var overlay = new Overlay({
        element: container,
        autoPan: true,
      });
      this.map.addOverlay(overlay);
    }
    
    this.map.on('click', (evt: any) => {
      this.initializeOnLoad();

      if (this.map.hasFeatureAtPixel(evt.pixel)) {

        var feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature: any) {
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
        overlay.setPosition(evt.coordinate);
      } else {
        // [0]: latt, [1]: long.
        let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.currentTag.longitude = Coords[0] 
        this.currentTag.latitude = Coords[1];
        
        if (this.map.getView().getZoom() >= 18) {
          this.showPopup = true;
          overlay.setPosition(evt.coordinate);
        } else {
          this.setCenter(18);
        }
      }
    })

  }
  
  setCenter(zoom: number) {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.currentTag.longitude, this.currentTag.latitude]));
    view.setZoom(zoom);
  }

  /**
   * Récupère les tag dans la base de donnée
  */
  getTags() {
    this.tagService.getTags()
    .subscribe(data => {
      this.tagList = data;
      console.log(data)
      this.tagList.forEach((tag: Tag) => {
        tag.label = this.emotions.find(x => x.name === tag.emotion)?.class;
        this.addPointFeature(tag);
      });
    })
  }


  /**
   * Creates the tag's visual point on the map.
   * @param data - tag data
   */
  
  addPointFeature(data: any): void {
    // Define coordinates for the point (longitude, latitude)
    const coordinates = fromLonLat([data.longitude, data.latitude]);

    // Create a point geometry
    const point = new Point(coordinates);

    // Create a feature with the point geometry
    const feature = new Feature({
      geometry: point,
      data: data
    });
    
    // Define a style for the point feature
    const style = new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({ color: this.emotions.find(x=>x.name === data.emotion)?.rgb }) //couleur relatif au emotgion
      })
    });

    // Apply the style to the feature
    feature.setStyle(style);

    // Create a vector layer to display the point feature
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature]
      })
    });

    // Add the vector layer to the map
    this.map.addLayer(vectorLayer);
  }


  onSubmit(): any {
    if (this.isFormValid()) {
      this.currentTag.emotion = this.selectedEmotion;
      this.currentTag.transport = this.selectedTransport;

      this.tagService.addTag(this.currentTag)
      .subscribe((data) => {
          console.log('Data added successfully!', data)
          this.ngZone.run(() => this.router.navigateByUrl('/Map'))
          this.addPointFeature(data);

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

  loadMarkerData(): void {
    // Fetch marker data from your backend or define it locally -- placeholder not called
    // this.markerData = [
    //   { lat: 51.5, lon: -0.1, label: 'Marker 1' },
    //   { lat: 51.51, lon: -0.09, label: 'Marker 2' },
    //   // Add more marker data as needed
    // ];

    // Cluster markers
    this.clusterMarkers();
  }

  clusterMarkers(): void {
    // Create a vector source for the markers
    const markerSource = new VectorSource();

    // Loop through marker data and create point features
    this.tagList.forEach( (tag: Tag)  => {
      if (tag.longitude && tag.latitude) {
        tag.label ="Marker 1";
        const pointFeature = new Feature({
          geometry: new Point(fromLonLat([tag.longitude, tag.latitude])),
          label: tag.label // Store label for clustering
        });
        markerSource.addFeature(pointFeature);
      }
    });

    // Create a vector layer with the marker source
    const markerLayer = new VectorLayer({
      source: markerSource,
      style: this.clusterStyleFunction // Apply clustering style
    });

    // Add the marker layer to the map
    this.map.addLayer(markerLayer);
  }

  clusterStyleFunction(feature: any): Style {
    const size = feature.get('features').length;
    let style;

    if (size > 1) {
      style = new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
          stroke: new Stroke({ color: '#3399CC', width: 2 }) // Define Stroke properties
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({ color: '#fff' })
        })
      });
    } else {
      style = new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: '#fff', width: 2 }) // Define Stroke properties
        })
      });
    }

    return style;
}
}
