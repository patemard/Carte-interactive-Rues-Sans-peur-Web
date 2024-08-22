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
import { ActivatedRoute, Router } from '@angular/router';
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
import Icon from 'ol/style/Icon'
import {MatDialog} from "@angular/material/dialog";
import {TagChoiceDialogComponent} from "../dialogs/tagChoice-dialog.component";
import { IpService } from '../Service/ip.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.css']
})

export class MapDashboardComponent extends Helper implements OnInit {
  currentTag: Tag = new Tag;
  map: any;
  overlay: any;
  description: string = '';
  ipAddress: string = '';
  title: string = '';
  selectedEmotion: any;
  selectedTransport: any;
  selectedType: any;
  layer: any;
  completedCardColor: string = '';
  showPopup: boolean = false;
  protected drawingStarted: boolean = false;
  feature: any;
  heartIsClicked: boolean = false;
  flagIsClicked: boolean = false;
  showCard: boolean = false;

  tagList: any = [];
  trajectoryCoords: any =[];

  geocoder: any;
  srcResult: any;


  constructor(
      protected tagService: TagService,
      private router: Router,
      public dialog: MatDialog,
      private route: ActivatedRoute,
      private ngZone: NgZone,
      private ipService: IpService,
      private location: Location
      ) {
    super();
    this.initializeOnLoad();
    console.log("this.tagService.isAdmin", this.tagService.isAdmin)
  }

  initializeOnLoad() {
    this.currentTag = new Tag();
    this.description = '';
    this.title = '';
    this.showPopup = false;
    this.showCard = false;
    this.heartIsClicked = false;
    this.selectedEmotion = ''
    this.selectedTransport = '';
    this.selectedType = '';
    this.completedCardColor = '';
    this.ipAddress = '';
  }

  ngOnInit() {
    this.initMap();
    this.initGeoCoder();
    this.initPopup();
    this.getTags();
    this.getUserIp();
    this.route.paramMap.subscribe(params => {
      let id = params.get('id');
      if (id) {
          this.getTagFromUrl(id)
      } else {
        // handle missing card
      }
   });
    // this.loadMarkerData()
  }
  async getTagFromUrl(id: string) {

    await this.getTag(id);
    this.clickedOnTag();
    
  }

  getTag(id: string) { 
    return new Promise((resolve, reject) =>  {
    this.tagService.getTag(id).subscribe( res => {
      this.currentTag = res;
      console.log(this.currentTag );
       resolve(true);
      
     });
    })

  }
    

  

  getUserIp() {
    this.ipService.getIpAddress().subscribe( (data) => {
        if (data.ip){
        this.ipAddress = data.ip;
        }
      },
      (error) => {
        console.error('Failed to fetch IP address', error);
      }
    );
  }


  initMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      view: new View({
        center: fromLonLat([this.QUEBEC_CITY.longitude, this.QUEBEC_CITY.latitude]),
        minZoom: 12,
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
      this.overlay = new Overlay({
        element: container,
        autoPan: true,
      });
      this.map.addOverlay(this.overlay);
    }

    this.map.on('click',async (evt: any) => {
      if (this.map.hasFeatureAtPixel(evt.pixel) && !this.showPopup) {        
        this.feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature: any) {
          return feature;
        })
        
        await this.getTag(this.feature.values_.data.id)
        this.clickedOnTag();
      } else if (!this.tagService.isAdmin && !this.drawingStarted && !this.showPopup && !this.showCard) {
      this.initializeOnLoad();
        // [0]: latt, [1]: long.
        this.currentTag.mercatorCoord = evt.coordinate;
        let coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.currentTag.longitude = coords[0]
        this.currentTag.latitude = coords[1];

        if (this.map.getView().getZoom() >= 18) {
          this.showPopup = true;
          this.overlay.setPosition(evt.coordinate);
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
    this.submitTrajectory()
    this.map.removeInteraction(draw);
  });

  }

  processWheelEvent(evt: any) {
    evt.preventDefault();
  }



  clickedOnTag() {
    
    this.showCard = true;
    this.overlay.setPosition(this.currentTag.mercatorCoord); 
    this.location.go("carte/" + this.currentTag.id)

    if (this.currentTag.flagged) {
      this.flagIsClicked =  this.currentTag.flagged.some(h => h === this.ipAddress);
    }
    this.heartIsClicked = this.currentTag.heart ? this.currentTag.heart.some(h => h === this.ipAddress) : false;
    this.completedCardColor = this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb || '';
    this.selectedEmotion = this.currentTag.emotion;
    this.selectedTransport = this.currentTag.transport;
    this.selectedType = this.currentTag.trajectory ? "Trajectoire" : "Point";
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
      if (!this.tagService.isAdmin) {
        // Filter inactive for non admins
      this.tagList = this.tagList.filter((x: Tag)=> x.active);
      }
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
        this.refresh();
      })
    }
  }

  refresh() {
    this.currentTag = new Tag();
        this.showCard = false;
        this.getTags();
        this.feature.values_ = null;
        this.map.render();
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


    let style = undefined;
    if (data.flagged && this.tagService.isAdmin) {
      // if admiin view and flagged, show different icon
      style = new Style({
        image: new Icon({
          scale: 0.18,
          crossOrigin: 'anonymous',
          src: 'assets/png/'+ 'signal.png'
        })
      });
    } else {
    // Define a style for the point feature
      style = new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: color }) //couleur relatif au emotion
        })
      });
    }

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
    console.log(this.selectedType); 
    if (this.selectedType == "Point") {
      this.setModel();
      this.tagService.addTag(this.currentTag)
      .subscribe((data) => {
        console.log('Data added successfully!', data)
        this.ngZone.run(() => this.router.navigateByUrl('/'))
        this.getTags();
          this.initializeOnLoad();
        }, (err: any) => {
          console.log(err);
      });
    } else if (this.selectedType == "Trajectoire"){
      this.showPopup = false;
      this.initDrawing();
    }
  }

  setModel() {
    this.currentTag.active = true;
    this.currentTag.emotion = this.selectedEmotion;
    this.currentTag.transport = this.selectedTransport;
    this.currentTag.description = this.currentTag.description?.trim()
  }

  submitTrajectory() {
    this.setModel();
    this.currentTag.trajectory = this.trajectoryCoords;
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

  isFormValid(): boolean {
    return !!(
      this.currentTag.title &&
      this.selectedEmotion &&
      this.selectedTransport &&
      this.currentTag.description &&
      this.selectedType
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
      this.currentTag.heart = [];
    }
    this.currentTag.heart.push(this.ipAddress);
    this.heartIsClicked = true;

    this.updateTag(this.currentTag);
  }

  flag() {
    if (!this.currentTag.flagged) {
      this.currentTag.flagged = [];
    }
    this.currentTag.flagged.push(this.ipAddress);
    if (this.currentTag.flagged.length > 1) {
      // Hide if more than one flagged
      this.currentTag.active = false;
    }
    this.flagIsClicked = true;
    
    this.updateTag(this.currentTag);
    this.sendEmail();
  }

  updateTag(tag: Tag) {
    this.tagService.updateTag(tag.id, tag)
      .subscribe(res => {
        this.refresh();
    })
  }

  openDeleteDialog(enterAnimationDuration: string, exitAnimationDuration: string): void  {
    console.log(this.currentTag)
    this.tagService.selectedTag = this.currentTag;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);

      if(result.event == 'hide'){
        this.currentTag.active = false;
        this.updateTag(this.currentTag);
      }else if(result.event == 'unhide'){
        this.currentTag.active = true;
        if (this.currentTag.id) {
          this.updateTag(this.currentTag);
        }
      } else if(result.event == 'delete'){
        if (this.currentTag.id) {
          this.delete(this.currentTag.id);
        }
      }
    });

  }

  sendEmail() {
    const emailData = {
      from: 'RuesSansPeur@gmail.com',
      to: 'pat.emard@posteo.net',
      subject: 'Témoignage Signalé',
      text: 'Le témoignage #' + ' ' + this.currentTag.id + ' a éte signalé'
    };

    this.tagService.sendEmail(emailData)
      .subscribe((response: any) => {
        console.log('Email sent successfully!', response);
      }, (error: any) => {
        console.error('Failed to send email.', error);
      });
  }

  copyUrlToclipboard() {
  
    navigator.clipboard.writeText(window.location.href).then(() => {

      alert("Lien copié dans le presse papier."); // remplace par toast.
      });
  }




}
