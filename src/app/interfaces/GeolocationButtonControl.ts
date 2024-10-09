import Control from 'ol/control/Control';
import Geolocation from 'ol/Geolocation';

export class GeolocationButtonControl extends Control {

    constructor(map: any, isMobileDevice: boolean) {
        // Geolocation API setup
        const geolocation = new Geolocation({
            tracking: false,
            projection: map.getView().getProjection()
        });

        // Create the button element
        const buttonElement = document.createElement('button');
        buttonElement.id = 'geolocationBtn';
        buttonElement.title = 'Allez a ma location';
        buttonElement.className = 'ol-custom-button';

        // Add an icon inside the button (optional)
        const icon = document.createElement('i');
        icon.className = 'fa fa-compass';  // FontAwesome compass icon
        buttonElement.appendChild(icon);

        // Create the container div
        const div = document.createElement('div');
        div.className = 'ol-unselectable ol-control';
        console.log("isMobileDevice", isMobileDevice);
        
        if (isMobileDevice) {
            div.style.top = '40%';
            div.style.left = '2%';
        } else {
            div.style.top = '32%';
            div.style.left = '0.2%'; 
        }
        div.style.position = 'absolute';

        // div.style.paddingTop = '1%';
        div.id = 'geolocationDiv';

        // Append button to the div
        div.appendChild(buttonElement);

        // Button click event
        buttonElement.addEventListener('click', () => {
            geolocation.setTracking(true);  // Start tracking

            geolocation.on('change:position', () => {
                const coordinates = geolocation.getPosition();

                if (coordinates) {
                    map.getView().setCenter(coordinates);  // Center the map to the geolocation position
                    map.getView().setZoom(18);  // Set zoom level (adjust as needed)
                }
                geolocation.setTracking(false);  // Stop tracking after getting the position
            });

            geolocation.on('error', (error: any) => {
                console.error('Geolocation error: ' + error.message);
                alert('Unable to get your location.');
                geolocation.setTracking(false);  // Stop tracking on error
            });
        });

        // Call the parent constructor with the created elements
        super({
            element: div,
        });
    }
}
