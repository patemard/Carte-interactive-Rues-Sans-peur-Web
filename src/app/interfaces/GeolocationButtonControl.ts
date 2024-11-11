import Control from 'ol/control/Control';
import Geolocation from 'ol/Geolocation';

export class GeolocationButtonControl extends Control {


    constructor(map: any) {

        const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
        let _isMobilePortrait: boolean = false;
        let _isMobileLandscape: boolean = false;

        if (isMobile) {

            _isMobilePortrait = window.innerWidth <= 768;
            _isMobileLandscape = window.innerWidth > window.innerHeight; // Typical breakpoint for tablets and mobile

            window.addEventListener('resize', () => {
                if (window.innerWidth > window.innerHeight) {
                    _isMobilePortrait = false;
                    _isMobileLandscape = true;
                } else if(window.innerWidth <= 768) {
                    _isMobilePortrait = true;
                    _isMobileLandscape = false;
                }
                if (_isMobilePortrait) {
                    div.style.top = '40%';
                    div.style.left = '3%';
                } else if (_isMobileLandscape) {
                    div.style.top = '45%';
                    div.style.left = '1.2%';
                } else {
                    div.style.marginTop = '18%';
                    div.style.left = '0.2%';
                }
            });
        }

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
        div.style.marginTop = '10%';

        if (_isMobilePortrait) {
            div.style.top = '40%';
            div.style.left = '3%';
        } else if (_isMobileLandscape) {
            div.style.top = '45%';
            div.style.left = '1.2%';
        } else {
            div.style.marginTop = '18%';
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
