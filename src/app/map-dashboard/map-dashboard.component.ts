import {Component, ComponentFactoryResolver, NgZone, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
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

  showPopup: boolean = false;
  disableEdit: boolean = false;
  protected drawingStarted: boolean = false;

  tagList: any = [];
  trajectoryCoords: any =[];

  geocoder: any;
  srcResult: any;

  @ViewChild('dialogContainer', { read: ViewContainerRef }) dialogContainer: ViewContainerRef | undefined;

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
      private tagService: TagService,
      private router: Router,
      public dialog: MatDialog,
      private componentFactoryResolver: ComponentFactoryResolver,
      private ngZone: NgZone
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
      if (this.drawingStarted) {
        return;
      }
      this.initializeOnLoad();

      if (this.map.hasFeatureAtPixel(evt.pixel)) {
        this.clickedOnTag(evt);
        overlay.setPosition(evt.coordinate);
      } else {
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
    console.log(geojson);
    this.trajectoryCoords = geojson;
    this.drawingStarted=false;
    this.showPopup = true;
    this.map.removeInteraction(draw);
  });

  // Handle potential errors during rendering
  this.map.on('rendercomplete', (event:any) => {
    if (!event.frameState.layerStates) {
      console.error('Layer states are undefined.');
    }
  });
  }
  processWheelEvent(evt: any) {
    evt.preventDefault();
  }



  clickedOnTag(evt:any) {
    var feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature: any) {
        return feature;
    })
    this.disableEdit = feature.values_.data;// La Search met un tag, si on clic sur celui ci, il faut pas voir la carte complete

    this.currentTag = {
      id: feature.values_.data.id,
      title: feature.values_.data.title,
      description: feature.values_.data.text,
      emotion: feature.values_.data.emotion,
    }
//  this.currentTag.emotion.icon= this.emotions.find(x => x.name === this.currentTag.emotion)?.icon;
    let completedCard = document.getElementById('completedCard');
    let closeBtn = document.getElementById('closeBtn');

    let color = this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb;
    if (color && completedCard) {
      completedCard.style.background =color;
    }
    if (color && closeBtn) {
      closeBtn.style.background = color;
    }
    this.selectedEmotion = feature.values_.data.emotion;
    this.selectedTransport = feature.values_.data.transport;
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
        this.addPointFeature(tag);
      });
      console.log( this.tagList)
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
      this.currentTag.trajectoryCoords = this.trajectoryCoords;
      this.currentTag.transport = this.selectedTransport;
      this.currentTag.description = this.currentTag.description?.trim()
      this.tagService.addTag(this.currentTag)
      .subscribe((data) => {
        console.log('Data added successfully!', data)
        this.ngZone.run(() => this.router.navigateByUrl('/'))
        if (!this.trajectoryCoords) {
          this.addPointFeature(data);
        }
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


  openDialog(): void {
    if (this.dialogContainer) {
      this.dialogContainer.clear();
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TagChoiceDialogComponent);
      this.dialogContainer.createComponent(componentFactory);
    }
  }


}
