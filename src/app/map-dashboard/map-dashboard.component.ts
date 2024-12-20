import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
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
import { IpService } from '../Service/ip.service';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { RessourceDialogComponent } from '../dialogs/ressource-dialog.component';
import { IdentificationDialogComponent } from '../dialogs/identification-dialog.component';
import Cluster from 'ol/source/Cluster';
import {boundingExtent} from 'ol/extent.js';
import {  FullScreen   } from 'ol/control';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions } from 'ol/interaction';
import { CustomCheckboxControl } from '../interfaces/CustomCheckboxControl';
import { GeolocationButtonControl } from '../interfaces/GeolocationButtonControl';
import { SaveTrajectoryButton } from '../interfaces/SaveTrajectoryButton';
import { TrajectoryInfoBanner } from '../interfaces/TrajectoryInfoBanner';
import { transform } from 'ol/proj';

@Component({
  selector: 'app-map-dashboard',
  templateUrl: './map-dashboard.component.html',
  styleUrls: ['./map-dashboard.component.css']
})

export class MapDashboardComponent extends Helper implements OnInit {
  currentTag: Tag = new Tag;
  saveTrajectoryButtonControl: any;
  trajectoryInfoBanner: any;
  map: any;
  overlay: any;
  description: string = '';
  ipAddress: string = '';
  title: string = '';
  selectedEmotion: any;
  selectedCategory: any;
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
  nonClusteredLayer: any;
  pointLayers: any;
  trajectoryLayer: any;
  clusteredLayer: any;
  clikedOnLayer: any;
  @ViewChild('scrollableContainer') scrollableContainer: ElementRef | undefined;
  constructor(
      protected tagService: TagService,
      private router: Router,
      public dialog: MatDialog,
      private route: ActivatedRoute,
      private ngZone: NgZone,
      private ipService: IpService,
      private injector: Injector,
      private resolver: ComponentFactoryResolver
      ) {
    super();
    this.initializeOnLoad();
  }

  initializeOnLoad() {
    this.currentTag = new Tag();
    this.description = '';
    this.title = '';
    this.showPopup = false;
    this.showCard = false;
    this.heartIsClicked = false;
    this.selectedEmotion = ''
    this.selectedCategory = '';
    this.selectedTransport = '';
    this.selectedType = '';
    this.completedCardColor = '';
    this.ipAddress = '';
    this.pointLayers = [];
    this.trajectoryLayer = [];
    this.clusteredLayer = [];
    this.clikedOnLayer = [];
  }

  async ngOnInit() {
    this.isMobile();
    this.initMap();
    this.initGeoCoder();
    this.initPopup();
    await this.getTags();
    await this.getUserIp();
    this.visualAggregation();
    this.map.addControl(
      new CustomCheckboxControl(this.pointLayers, this.trajectoryLayer, this.clusteredLayer)
    );
    this.map.addControl(
      new GeolocationButtonControl(this.map),
    );
    this.initInfoModal();
  }


  getTag(id: string) {
    if (this.showCard) {
      this.close();
    }
    return new Promise((resolve, reject) =>  {
    this.tagService.getTag(id).subscribe( res => {
      this.currentTag = res;
       resolve(true);
     });
    })

  }

  getUserIp() {
    return new Promise((resolve, reject) =>  {
      this.ipService.getIpAddress().subscribe( (data) => {
          if (data.ip){
            this.ipAddress = data.ip;
          }
          resolve(true);
        },
        (error) => {
          resolve(error);
          console.error('Failed to fetch IP address', error);
        }
      );
    });
  }


  initMap() {
    const extent = ol.proj.transformExtent(
      this.QUEBEC_BOUNDING_BOX,
      'EPSG:4326', 'EPSG:3857'
    );

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
        maxZoom: 20,
        zoom: 14,
        extent: extent,
      }),
      interactions: defaultInteractions({
        pinchZoom: true,
        dragPan: true,
      }),
       controls: defaultControls(),
    });

    if (this._isMobile) {
      const fullScreenControl = new FullScreen();
      this.map.addControl(fullScreenControl);
    }
  }


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
        if (this.feature.values_.data && this.feature.values_.data.id) {
          await this.getTag(this.feature.values_.data.id)
          this.clickedOnTag();
        }
      } else if (!this.tagService.isAdmin && !this.drawingStarted && !this.showPopup && !this.showCard) {
        this.initializeOnLoad();
        // [0]: latt, [1]: long.
        this.currentTag.mercatorCoord = evt.coordinate;
        let coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        this.currentTag.longitude = coords[0]
        this.currentTag.latitude = coords[1];

        if (this.map.getView().getZoom() >= 18) {
          this.showPopup = true;
          const offsetCoord = [
            this.currentTag.mercatorCoord[0] + 100,
            this.currentTag.mercatorCoord[1] - 100,
          ];
          this.overlay.setPosition(this.currentTag.mercatorCoord);
          this.lockExtent(offsetCoord);
        } else {
          this.zoomInOnClick(18, evt.coordinate);
        }
      }
    })
  }

  initInfoModal() {
    const dialogRef = this.dialog.open(RessourceDialogComponent, {
      enterAnimationDuration: 700,
      panelClass: this._isMobileLandscape  ? 'mt-5' : '',
    });
  }

  initIdentificationModal() {
    const dialogRef = this.dialog.open(IdentificationDialogComponent, {
      width: this._isMobilePortrait || this._isMobileLandscape ? 'fit-content' : '35%',
      enterAnimationDuration: 550
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentTag.identification = result.identification;
      }
    });
  }

  openDeleteDialog(enterAnimationDuration: string, exitAnimationDuration: string): void  {
    this.tagService.selectedTag = this.currentTag;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });

    dialogRef.afterClosed().subscribe(result => {
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

  initGeoCoder() {
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
      viewbox:{
        viewbox: this.QUEBEC_BOUNDING_BOX.join(','), // add viewbox as comma-separated string
        bounded: "1",
      }
    });
    this.map.addControl(this.geocoder);
    this.map.addEventListener('wheel', this.processWheelEvent)
    this.geocoder.on('addresschosen',  (evt: any) => {
      const coord = evt.coordinate;
      this.map.getView().setCenter(coord);
      this.map.getView().setZoom(16);
    });
  }

  initDrawing() {
    this.unlockExtent(true)
    const view = this.map.getView();  // Get the current view of the map
    // Set a new minimum zoom level
    view.setMinZoom(18);
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
    this.addSaveTrajectoryButton();
    this.addTrajectoryInfoBanner();

    // Save the trajectory as GeoJSON
    document.getElementById('saveTrajectory')?.addEventListener('click', () => {
      const format = new GeoJSON();
      const features = vectorSource.getFeatures();
      const geojson = format.writeFeatures(features, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });
      const view = this.map.getView();  // Get the current view of the map
      // Set a new minimum zoom level
      view.setMinZoom(14);
      // Save or display the GeoJSON string
      this.trajectoryCoords = geojson;
      this.drawingStarted=false;
      this.submitTrajectory()
      this.map.removeInteraction(draw);
      this.removeSaveTrajectoryButton();
      this.removeTrajectoryInfoBanner();
    });
  }
  // Function to extract the first coordinate from GeoJSON object

  addSaveTrajectoryButton() {
    this.saveTrajectoryButtonControl = new SaveTrajectoryButton(this.map,this.injector, this.resolver)
    this.map.addControl(this.saveTrajectoryButtonControl);
  }

  removeSaveTrajectoryButton() {
    if (this.saveTrajectoryButtonControl) {
      this.map.removeControl(this.saveTrajectoryButtonControl);
    }
  }

  addTrajectoryInfoBanner() {
    this.trajectoryInfoBanner = new TrajectoryInfoBanner(this.map,this.injector, this.resolver)
    this.map.addControl(this.trajectoryInfoBanner);
  }

  removeTrajectoryInfoBanner() {
    if (this.trajectoryInfoBanner) {
      this.map.removeControl(this.trajectoryInfoBanner);
    }
  }

  processWheelEvent(evt: any) {
    evt.preventDefault();
  }


  async clickedOnTag() {
    if (!this.ipAddress) {
      await this.getUserIp();
    }

    this.showCard = true;
    this.overlay.setPosition(this.currentTag.mercatorCoord);

    const color = this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb;
    this.heartIsClicked = this.currentTag.heart ? this.currentTag.heart.some(h => h === this.ipAddress) : false;
    this.flagIsClicked = this.currentTag.flagged ? this.currentTag.flagged.some(h => h === this.ipAddress): false;
    this.completedCardColor = color?.card || '';
    this.selectedEmotion = this.currentTag.emotion;
    this.selectedTransport = this.currentTag.transport;
    this.selectedType = this.currentTag.trajectory ? "Trajectoire" : "Point";
    this.clikedOnLayer = this.getLayerById(this.currentTag?.id || '');
    this.changeLayerColor(
      this.clikedOnLayer,
      color?.highlight || '',
      this.currentTag.trajectory
    )
    this.scrollToTop();
    this.lockExtent(this.currentTag.mercatorCoord, true);
  }


  lockExtent(centerCoord: number[], offSet?: boolean){
    this.hideOrShowFieldForMobile(true);
    if (this._isMobilePortrait && offSet) {
      centerCoord = [
        this.currentTag.mercatorCoord[0] + 175,
        this.currentTag.mercatorCoord[1] ,
      ];
    }

    const view = this.map.getView();
     // Animate to the specific coordinate
     view.animate({
      center: centerCoord,
      zoom: view.getZoom(),
      duration: 800,  // Duration in milliseconds for the animation
    });
    if (!this._isMobile) {
          // Lock the extent after the animation completes
      setTimeout(() => {
        let extent = view.calculateExtent(this.map.getSize());
        const margin = 0.05;

        // Calculate the width and height of the extent
        const width = extent[2] - extent[0];
        const height = extent[3] - extent[1];

        // Expand the extent by adding/subtracting a margin
        extent = [
          extent[0] - width * margin, // minX with margin
          extent[1] - height * margin, // minY with margin
          extent[2] + width * margin,  // maxX with margin
          extent[3] + height * margin  // maxY with margin
        ];

        // Set the final view with locked constraints
        this.map.setView(
          new View({
            center: centerCoord,
            zoom: this.map.getView().getZoom(),
            minZoom: this.map.getView().getZoom() -2,
            maxZoom: this.map.getView().getZoom() +2,
            extent: extent,          // Lock panning within this extent
            constrainResolution: true,
          })
        );

        if (this._isMobilePortrait || this._isMobileLandscape) {
          let lockOrientationIn = '';
          if (this._isMobilePortrait) {
            lockOrientationIn = 'portrait';
          } else if(this._isMobileLandscape) {
            lockOrientationIn = 'landscape';
          }
          (screen.orientation as any).lock(lockOrientationIn)
          .then(() => {
              console.log('Orientation locked to portrait');
          })
          .catch((error: any) => {
              console.error('Failed to lock orientation:', error);
          });
        }
      }, 800); // Delay matches the animation duration to lock view after animation
    }

  }

  hideOrShowFieldForMobile(hide: boolean) {
    if (this._isMobile) {
      const geolocationDiv = document.getElementById('geolocationDiv');
      if (geolocationDiv) {
        geolocationDiv.style.display = hide ? 'none' : 'block';
      }
      const checkboxesDiv = document.getElementById('checkboxesDiv');
      if (checkboxesDiv) {
        checkboxesDiv.style.display = hide ? 'none' : 'block';
      }
      const goecoderBtn = document.getElementById('gcd-button-control');
      if (goecoderBtn) {
        goecoderBtn.style.display = hide ? 'none' : 'block';
      }
      const zoomIn = document.getElementsByClassName('ol-zoom-in');
      for (let i = 0; i < zoomIn.length; i++) {
        (zoomIn[i] as HTMLElement).style.display = hide ? 'none' : 'block';
      }
      const zoomOut = document.getElementsByClassName('ol-zoom-out');
      for (let i = 0; i < zoomOut.length; i++) {
        (zoomOut[i] as HTMLElement).style.display =  hide ? 'none' : 'block';
      }
    }
  }

  unlockExtent(hide?: boolean) {
    this.hideOrShowFieldForMobile(!!hide);
    const extent = ol.proj.transformExtent(
      this.QUEBEC_BOUNDING_BOX,
      'EPSG:4326', 'EPSG:3857'
    );
    const view = this.map.getView();
    // Re-assign the view with constraints to lock panning and zoom
    this.map.setView(
      new View({
        center: view.getCenter(),
        zoom: view.getZoom(),
        minZoom: 12,
        maxZoom: 20,
        extent: extent,         // Constrains panning within this extent
      })
    );
    this.visualAggregation();
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }

  scrollToTop() {
    setTimeout(() => {
      if (this.scrollableContainer?.nativeElement) {
        this.scrollableContainer.nativeElement.scrollTop = 0;
      }
    }, 0);
  }

  // Function to get a layer by its custom 'layerId'
  getLayerById(layerId: string) {
    return this.map.getLayers().getArray().find((layer: any) => layer.get('layerId') === layerId);
  }

  // Used to highlight selected trajectory
  changeLayerColor(layer: any, newColor: string, isTrajectory?: boolean, isReset?: boolean) {
    let newStyle;
    let width = isReset ? 5 : 6;
    if (this._isMobile) {
      width = isReset ? 8 : 9;
    }
    if (isTrajectory) {
      newStyle = new Style({
        stroke: new Stroke({
          color: newColor,
          width: width,
        }),
      });
    } else {
      newStyle = new Style({
        image: new Circle({
          radius: isReset ? 5 : 6,
          fill: new Fill({ color: newColor }) //couleur relatif au emotion
        })
      })
    }
    layer.setStyle(newStyle);
  }

  zoomInOnClick(zoom: number, coord: any) {
    var view = this.map.getView();
    view.animate({
      center: coord,
      zoom: zoom,
      duration: 700,  // Duration in milliseconds for the animation
    });
  }

  /**
   * Récupère les tag dans la base de donnée
  */
  getTags() {
    return new Promise((resolve, reject) =>  {
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
        resolve(this.tagList);
      })
    });
  }

  delete(id: string) {
    if (id) {
      this.tagService.deleteTag(id)
      .subscribe( res =>{
          this.refresh();
      })
    }

  }

  updateTag(tag: Tag) {
    this.tagService.updateTag(tag.id, tag)
      .subscribe(res => {
        this.refresh();
    })
  }

  refreshPage() {
    this.router.navigateByUrl('/')
    window.location.reload();
  }


  async refresh() {
    this.currentTag = new Tag();
    this.showCard = false;
    if (this.feature) {
      this.feature.values_ = null;
    }

    await this.getTags();
    this.map.render();
    this.router.navigateByUrl('/')
  }


  private addTrajectory(tag: Tag, isOpen?: boolean) {
    let color = this.emotions.find(x=>x.name === tag.emotion)?.rgb;
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: isOpen ? color?.highlight :color?.trajectory, //couleur relatif au emotion
          width: this._isMobile ? 11 : 7,
        })
      })
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

    // const coordinates = fromLonLat([firstCoordinate[0], firstCoordinate[1]]);
    vectorLayer.set('layerId', tag.id);
    // Add the vector layer to the map
    this.trajectoryLayer.push(vectorLayer)
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
          radius: this._isMobile ? 11 : 7,
          fill: new Fill({ color: color?.point }) //couleur relatif au emotion
        })
      })
    }
    // Apply the style to the feature
    feature.setStyle(style);

    // Create a vector layer to display the point feature
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature]
      })
    });
    vectorLayer.set('name', 'pointLayer');
    vectorLayer.set('layerId', data.id);

    this.pointLayers.push(vectorLayer)
    // Add the vector layer to the map
    this.map.addLayer(vectorLayer);
    this.nonClusteredLayer = this.map.getLayers().getArray().find((layer: any) => layer.get('name') === 'pointLayer');
  }


  onSubmit(): any {
    if (this.isFormValid()) {
      if (this.selectedType == "Point") {
        this.setModel();
        this.tagService.addTag(this.currentTag)
        .subscribe((data) => {
          this.ngZone.run(() => this.router.navigateByUrl('/'))
          this.initializeOnLoad();
          this.refresh();
          this.unlockExtent();
          }, (err: any) => {
            console.log(err);
        });
      } else if (this.selectedType == "Trajectoire"){
        this.showPopup = false;
        this.initDrawing();
      }
    }
  }

  setModel() {
    this.currentTag.active = true;
    this.currentTag.title = this.selectedCategory || "Témoignage";
    this.currentTag.emotion = this.selectedEmotion;
    this.currentTag.transport = this.selectedTransport;
    this.currentTag.description = this.formatLongStringWithSpaces(this.currentTag.description, 30);
    if (!this.currentTag.transport) {
      this.currentTag.transport = this.rdmTransports[0].name
    }
  }

   formatLongStringWithSpaces(input: any, length: any) {
    // Normalize existing spaces first, replacing multiple spaces with a single space and trimming.
    input = input.replace(/\s+/g, ' ').trim();
    if (!input.includes(' ')) {
      // Insert spaces into long strings without breaking existing words.
      input = input.replace(new RegExp(`.{1,${length}}`, 'g'), '$& ').trim();
      input = input.replace(new RegExp(`.{1,${length}}`, 'g'), '$& ').trim();
    }
    return input;

  }

  submitTrajectory() {
    this.setModel();
    this.currentTag.trajectory = this.trajectoryCoords;
    // Re allign the card point to be on the first trajectory point.
    const transformedCoord = transform(this.extractFirstCoordinate(JSON.parse(this.trajectoryCoords)), 'EPSG:4326', 'EPSG:3857');
    this.currentTag.mercatorCoord = transformedCoord;

    this.tagService.addTag(this.currentTag)
    .subscribe((data) => {
      this.ngZone.run(() => this.router.navigateByUrl('/'))
      this.initializeOnLoad();
      this.refresh();
      this.unlockExtent();
      }, (err: any) => {
        console.log(err);
    });
  }

  extractFirstCoordinate(geojson: any) {
    if (geojson && geojson.features && Array.isArray(geojson.features) && geojson.features.length > 0) {
      // Iterate over features to find the first coordinate
      for (const feature of geojson.features) {
        if (feature && feature.geometry && feature.geometry.coordinates) {
          const geometryType = feature.geometry.type;
          const coordinates = feature.geometry.coordinates;

          switch (geometryType) {
            case 'Point':
              // For Point, return the coordinates directly
              return coordinates;
            case 'LineString':
              // For LineString, return the first coordinate
              if (coordinates.length > 0) {
                return coordinates[0];
              }
              break;
            case 'Polygon':
              // For Polygon, return the first coordinate of the first ring
              if (coordinates.length > 0 && coordinates[0].length > 0) {
                return coordinates[0][0];
              }
              break;
            default:
              console.warn(`Unsupported geometry type: ${geometryType}`);
          }
        }
      }
      throw new Error('No coordinates found in any feature.');
    } else {
      throw new Error('Invalid GeoJSON or no features found.');
    }
  }

  isFormValid(): boolean {
    return !!(
      this.selectedEmotion &&
      this.currentTag.description &&
      this.selectedType
      )
  }




  visualAggregation() {
    let pointArray: any = [];
    let trajectoryArray: any = [];

    // Loop through marker data and create point features
    this.tagList.forEach( (tag: Tag)  => {
      if (tag.active) {
        if (tag.longitude && tag.latitude && !tag.trajectory) {
          pointArray.push(tag)
        } else {
          trajectoryArray.push(tag)
        }
      }
    });

    let positivePointArray: any = [];
    let negativePointArray: any = [];
    let positiveTrajectoryArray: any = [];
    let negativeTrajectoryArray: any = [];
    this.seperateInEmotionArrays(pointArray, positivePointArray, negativePointArray);
    this.seperateInEmotionArrays(trajectoryArray, positiveTrajectoryArray, negativeTrajectoryArray);

    this.clusterMarkers(positivePointArray, this.emotions[0].rgb.cluster);
    this.clusterMarkers(negativePointArray, this.emotions[1].rgb.cluster);
  }

  seperateInEmotionArrays(originalArray: any[], positiveArray:any[], negativeArray: any[]) {
    originalArray.forEach( (tag: Tag) => {
      if (tag.emotion == this.emotions[0].name) {
        positiveArray.push(tag);
      } else {
        negativeArray.push(tag);
      }
    });
  }



  clusterMarkers(tag: Tag[], color: string): void {
    const features: any = []
    tag.forEach( (tag: Tag) => {
      if (tag.mercatorCoord && !tag.trajectory) {
            // Create a feature with the point geometry
        const feature = new Feature({
          geometry: new Point(tag.mercatorCoord),
          data: tag
        });
        features.push(feature)
      }
    });


      // Create a vector source with the points
      const source = new VectorSource({
        features: features,
      });

        // Create a cluster source
      const clusterSource = new Cluster({
        distance: 20, // Distance in pixels within which points will be clustered
        source: source
      });

      const minClusterSize = 3;

      const styleCache: any = {};
      const clusters = new VectorLayer({
        source: clusterSource,
        style: function (feature) {
          const size = feature.get('features').length;

          // Only show clusters with more than minClusterSize points
          if (size < minClusterSize) {
            // Return null to not render this cluster
            return null;
          }

          let style = styleCache[size];
          if (!style) {
            style = new Style({
              image: new Circle({
                radius: 10,
                stroke: new Stroke({
                  color: '#fff',
                }),
                fill: new Fill({
                  color:color,
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: '#fff',
                }),
              }),
            });
            styleCache[size] = style;
          }
          return style;
        },
      });
      clusters.set('name', 'clusteredLayer');

      this.clusteredLayer.push(clusters)

      // Add the marker layer to the map
      this.map.addLayer(clusters);
      this.map.on('click', (e: any) => {
        clusters.getFeatures(e.pixel).then((clickedFeatures) => {
          if (clickedFeatures.length) {
            // Get clustered Coordinates
            const features = clickedFeatures[0].get('features');
            if (features.length > 0) {
              const extent = boundingExtent(
                features.map((r: any) => r.getGeometry().getCoordinates()),
              );
              this.map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50], maxZoom: 17 });
            }
          }
        });
      });
      const zoomThreshold = 15;  // Define the zoom level where clustering disappears

      // Listen to the map's 'moveend' event to check the zoom level after each interaction
      this.map.getView().on('change:resolution', () => {
        const zoom =  this.map.getView().getZoom();
        if (clusters && this.nonClusteredLayer) {
          if (zoom >= zoomThreshold) {
            // If zoomed in, show non-clustered features
            if (this.map.getLayers().getArray().includes(clusters)) {
              this.map.removeLayer(clusters);
            }
            if (!this.map.getLayers().getArray().includes(this.nonClusteredLayer)) {
              this.map.addLayer(this.nonClusteredLayer);
            }
          } else {
            // If zoomed out, show clustered features
            if (!this.map.getLayers().getArray().includes(clusters)) {
              this.map.addLayer(clusters);
            }
          }
        }
      });
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

  sendEmail() {
    const lat = this.currentTag.latitude;
    const lon = this.currentTag.longitude;
    let emailData = {
      from: 'RuesSansPeur@gmail.com',
      to: ['a.metivierhudon@transportsviables.org', 'm.lucas@transportsviables.org', 'acces@transportsviables.org'],
      subject: 'Témoignage Signalé',
      text: ""
    };
    if (lat && lon) {
      this.ipService.getCoordDetails(lat.toString(), lon.toString()).subscribe(res => {
         emailData.text = 'Un témoignage sur a éte signalé.\n Info de localisation: \n' + '"'+ res.display_name +'"';
      this.tagService.sendEmail(emailData)
        .subscribe((response: any) => {
          console.log('Email sent successfully!', response);
        }, (error: any) => {
          console.error('Failed to send email.', error);
        });
      })
    } else {
       emailData.text = 'Le témoignage #' + ' ' + this.currentTag.id + ' a éte signalé'
       this.tagService.sendEmail(emailData)
        .subscribe((response: any) => {
           console.log('Email sent successfully!', response);
        }, (error: any) => {
          console.error('Failed to send email.', error);
        });
    }
  }

  getTransportIcon(): any{
    const transportForIcon = [...this.transports, ...this.rdmTransports]
    let icon = transportForIcon.find(x => x.name == this.currentTag.transport)?.icon
    return icon;
  }


  close() {
    const color = this.currentTag?.trajectory ?
    this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb.trajectory :
    this.emotions.find(x => x.name === this.currentTag.emotion)?.rgb.point;
    if (color) {
      if (this.clikedOnLayer) {
        this.changeLayerColor(
          this.clikedOnLayer,
          color,
          this.currentTag?.trajectory,
          true
        )
      }
    }
    this.unlockExtent();
    this.showCard=false;
  }

}


