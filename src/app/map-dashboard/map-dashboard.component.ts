import {
  Component,
  NgZone,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { Helper } from '../helper';
import { Tag } from '../Models/tag';
import { TagService } from '../Service/tag.service';
import { Router } from '@angular/router';
declare var ol: any;
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point, LineString } from 'ol/geom';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import Text from 'ol/style/Text';
import Geocoder from 'ol-geocoder';
import Draw from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import {MatDialog} from "@angular/material/dialog";
import {TagChoiceDialogComponent} from "../dialogs/tagChoice-dialog.component";

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
  showChoice: boolean = false;
  completedCardColor: string = '';
  showPopup: boolean = false;
  protected drawingStarted: boolean = false;
  feature: any;
  isClicked: boolean = false;
  showCard: boolean = false;

  tagList: any = [];
  trajectoryCoords: any =[];

  geocoder: any;
  srcResult: any;
  
  //class a fixer
  emotions: {name: string, icon: string, class?: string, rgb?: string, png: string}[] = [
    { name: "Évènement", icon: "circle-exclamation", class: "text-success", rgb: "rgba(40, 167, 69, 0.75)", png: "black"},
    { name: "Fierté ", icon: "face-smile", class: "text-warning", rgb: "rgba(255, 193, 7, 0.75)", png: "greeen" },
    { name: "Tristesse ", icon: "face-sad-tear", class: "text-primary", rgb: "rgba(0, 123, 255, 0.75)", png: "yellow"  },
    { name: "Frustration", icon: "face-angry" , class: "text-danger", rgb: "rgba(220, 53, 69, 0.75)", png: "red"},
    { name: "Peur", icon: "frown-open", class: "text-info", rgb: "rgba(91, 162, 184, 0.75)", png: "blue"}
  ]

  transports = [
    { name: "Marche", icon: "person-walking"},
    { name: "Vélo ", icon: "bicycle"},
    { name: "Bus ", icon: "bus" },
    { name: "Voiture ", icon: "car"},
  ]

  constructor(
      protected tagService: TagService,
      private router: Router,
      public dialog: MatDialog,
      private ngZone: NgZone,
      ) {
    super();
    this.initializeOnLoad();
    console.log("this.tagService.isAdmin", this.tagService.isAdmin)
  }

  initializeOnLoad() {
    this.latitude = this.QUEBEC_CITY.latitude;
    this.longitude = this.QUEBEC_CITY.longitude;
    this.currentTag = new Tag();
    this.description = '';
    this.title = '';
    this.showPopup = false;
    this.showCard = false;
    this.isClicked = false;
    this.selectedEmotion = ''
    this.selectedTransport = '';
    this.completedCardColor = '';
  }

  ngOnInit() {
    this.initMap();
    this.initGeoCoder();
    this.initPopup();
    this.getTags();
    // this.loadMarkerData()
  }


  initMap() {
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
    // Listen for map view changes and update geocoder extent accordingly
    // this.map.on('moveend', () => {
    //   this.updateGeocoderExtent();
    // });
  }
    // Function to update geocoder's search extent
  // updateGeocoderExtent() {
  //   var extent = this.map.getView().calculateExtent(this.map.getSize());
  //     console.log("extent", extent)
  //   this.geocoder.options.bounded = true; // Ensure geocoder search is bounded
  //   this.geocoder.options.viewbox = extent; // Set the search extent to the current map extent

  //   this.geocoder.options.extent = extent; // Set the search extent to the current map extent
  // }

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
      if (this.drawingStarted || this.showPopup || this.showCard) {
        return;
      }
      this.initializeOnLoad();
      if (this.map.hasFeatureAtPixel(evt.pixel)) {
        this.clickedOnTag(evt);
        overlay.setPosition(evt.coordinate);
      } else if (!this.tagService.isAdmin) {
        // [0]: latt, [1]: long.
        let Coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.currentTag.longitude = Coords[0]
        this.currentTag.latitude = Coords[1];

        if (this.map.getView().getZoom() >= 18) {
          this.showChoice = true;
          overlay.setPosition(evt.coordinate);
        } else {
          this.setCenter(18);
        }
      }
    })
  }

  initGeoCoder() {
    // Add search control https://www.npmjs.com/package/ol-geocoder
    this.geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'fr-ca',
      placeholder: 'Recherchez un endroit',
      limit: 5,
      debug: false,
      autoComplete: true,
      keepOpen: true,
      preventDefault: true,
      countrycodes: 'ca',
      params: {
        viewbox: this.QUEBEC_BOUNDING_BOX
      }
    });
    this.map.addControl(this.geocoder);
    this.map.addEventListener('wheel', this.processWheelEvent)
    this.geocoder.on('addresschosen',  (evt: any) => {
      const coord = evt.coordinate;
      this.map.getView().setCenter(coord);
      this.map.getView().setZoom(18);
    });
    // this.loadMarkerData()gcd-input-query
    // let geocoderInput = document.getElementById('gcd-input-query');
    // console.log(geocoderInput);

    // if (geocoderInput) {
    //   geocoderInput.addEventListener('beforequery', function(event) {
    //     // Your event handling code here
    //     console.log('Input value changed:', event);
    //   });
    // }
    //   this.geocoder.on('beforequery', (evt: any) => {
    //     // it's up to you
    //     console.info(evt);
    //   });
  }

  initDrawing() {
  // Create a vector source and layer for the trajectory
  this.drawingStarted = true;
  // Create a vector source and layer for the trajectory
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: 'blue',
        }),
      }),
    }),
  });
  this.map.addLayer(vectorLayer);

  // Enable drawing interaction for points
  const draw = new Draw({
    source: vectorSource,
    type: 'Point',
  });
  this.map.addInteraction(draw);

  // Collect points and create a line feature
  const points: number[][] = [];
  draw.on('drawend', (event: any) => {
    console.log('drawend')
    const feature = event.feature;
    const coordinates = (feature.getGeometry() as Point).getCoordinates();
    points.push(coordinates);

    // Create a LineString feature if we have at least two points
    if (points.length > 1) {
      const lineString = new LineString(points);
      const lineFeature = new Feature({
        geometry: lineString,
      });

      // Clear the previous line feature and add the new one
      vectorSource.clear();
      vectorSource.addFeature(lineFeature);
    }
  });

  // Save the trajectory as GeoJSON
  document.getElementById('saveTrajectory')?.addEventListener('click', () => {
    const format = new GeoJSON();
    const features = vectorSource.getFeatures();
    const geojson = format.writeFeatures(features, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    // Save or display the GeoJSON string
    this.trajectoryCoords = geojson;
    this.drawingStarted=false;
    this.showPopup = true;
    this.map.removeInteraction(draw);
  });

  }
  processWheelEvent(evt: any) {
    evt.preventDefault();
  }



  clickedOnTag(evt:any) {
    this.showChoice = false;
    
    this.feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature: any) {
        return feature;
    })

    this.showCard = this.feature.values_.data;
    
    this.currentTag = {
      id: this.feature.values_.data.id,
      title: this.feature.values_.data.title,
      description: this.feature.values_.data.text,
      emotion: this.feature.values_.data.emotion,
      trajectory: this.feature.values_.data.trajectory,
      heart: this.feature.values_.data.heart || 0
    }

    this.completedCardColor = this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb || '';
    this.selectedEmotion = this.feature.values_.data.emotion;
    this.selectedTransport = this.feature.values_.data.transport;
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
      this.tagList.forEach((tag: Tag) => {
        tag.label = this.emotions.find(x => x.name === tag.emotion)?.class;
   
        const isTrajectory = tag.trajectory && tag.trajectory.length !== 0
        if (isTrajectory) {
          this.addTrajectory(tag)
        } else {
          this.addPointFeature(tag);
        }
      });
    })
  }

  delete(id: string) {
    if (id) {
      this.tagService.deleteTag(id)
      .subscribe( res =>{
        this.currentTag = new Tag();
        this.showCard = false;
        this.getTags();
        this.feature.values_ = null;
        this.map.render();
      })
    }
  }

  private addTrajectory(tag: Tag) {
    let color = this.emotions.find(x=>x.name === tag.emotion)?.rgb;
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: color , //couleur relatif au emotion
          width: 3,
        })
      }),

    });
    const format = new GeoJSON();
    const features = format.readFeatures(tag.trajectory, {
      featureProjection: 'EPSG:3857'// Projected coordinate system used by the map
    });
    let firstCoordinate: any;

    if (features.length > 0) {
      const firstFeature = features[0];
      firstFeature.set('data', tag)
      const geometry = firstFeature.getGeometry();
      if (geometry && geometry.getType() === 'LineString') {
        const coordinates = (geometry as any).getCoordinates();
        firstCoordinate = coordinates[0];
      }
    }
    vectorSource.clear();
    vectorSource.addFeatures(features);

    const coordinates = fromLonLat([firstCoordinate[0], firstCoordinate[1]]);

    // Add the vector layer to the map
    this.map.addLayer(vectorLayer);

  }
  /**
   * Creates the tag's visual point on the map.
   * @param data - tag data
   */

  addPointFeature(data: any): void {
    // Define coordinates for the point (longitude, latitude)
    const coordinates = fromLonLat([data.longitude, data.latitude]);
    let color = this.emotions.find(x=>x.name === data.emotion)?.rgb;
    
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
        fill: new Fill({ color: color }) //couleur relatif au emotion
      })
    });
    // const style = new Style({
    //   image: new Icon({
    //     color: this.emotions.find(x=>x.name === data.emotion)?.rgb,
    //     scale: 0.05,
    //     crossOrigin: 'anonymous',
    //     src: 'assets/png/'+ this.emotions.find(x=>x.name === data.emotion)?.png + 'Pin.png'
    //   })
    // });

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
      this.currentTag.trajectory = this.trajectoryCoords;
      this.currentTag.transport = this.selectedTransport;
      this.currentTag.description = this.currentTag.description?.trim()
      this.tagService.addTag(this.currentTag)
      .subscribe((data) => {
        console.log('Data added successfully!', data)
        this.ngZone.run(() => this.router.navigateByUrl('/'))
        this.getTags();
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



  onFileSelected() {
    const inputNode: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.srcResult = e.target.result;
      };

      reader.readAsArrayBuffer(inputNode.files[0]);
      this.tagService.addImage(this.srcResult)
      .subscribe((data: any) => {
        console.log('Data added successfully!', data)
        this.ngZone.run(() => this.router.navigateByUrl('/Map'))
        this.addPointFeature(data);

        this.initializeOnLoad();
      }, (err: any) => {
        console.log(err);
    });
    }
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


  heart() {
    if (!this.currentTag.heart ) {
      this.currentTag.heart = 0;
    }
    this.currentTag.heart++;
    this.isClicked = true;
    //todo:  update tag

    
    this.tagService.updateTag(this.currentTag.id, this.currentTag).subscribe(res => {
      this.getTags()
      this.map.render();
      
    })
    
  }


}
