import { Control   } from 'ol/control';
declare var ol: any;
  
  // Create a custom control for the checkbox
  export class GeolocationButtonControl extends Control {
    
    constructor(map: any){
        console.log(map);
        
        // Geolocation API setup
        var geolocation = new ol.Geolocation({
            tracking: false,
            projection: map.getView().getProjection()
        });

      const buttonElement = document.createElement('input');
      buttonElement.type = 'button';
      buttonElement.id = 'geolocationBtn';
      buttonElement.title = 'Allez a ma location';

      buttonElement.className = "ol-custom-button";

     const icon = document.createElement('i');
     icon.className="fa fa-compass"

      const div = document.createElement('div');
      div.className = 'ol-unselectable ol-control';
      div.style.position = 'absolute';
      div.style.top = '30%';
    
      div.style.left = '1%';
      div.id = "geolocationDiv"
        // Button click event
        buttonElement.addEventListener('click',  ()=> {
            geolocation.setTracking(true);

            // geolocation.once('change:position',  ()=> {
                var coordinates = geolocation.getPosition();
                console.log(coordinates);
                
                if (coordinates) {
                    map.getView().setCenter(coordinates);
                    map.getView().setZoom(15); // Adjust the zoom level
                }
                geolocation.setTracking(false);
            // });

            geolocation.on('error',  (error: any)=> {
                console.error('Geolocation error: ' + error.message);
                alert('Unable to get your location.');
            });
        });

        div.appendChild(buttonElement);
       div.appendChild(icon);

        super({
            element: div,
   
            });
            
        ol.control.Control.call(this, {
            element: div
        });


    }
  }