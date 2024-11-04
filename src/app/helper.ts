import { Constants } from "./constants";

export class Helper extends Constants {


    isMobilePortrait() {
        return window.innerWidth <= 768; // Typical breakpoint for tablets and mobile
    }
  
     isMobileLandscape() {
        // Check if the device is mobile
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
      
        // Check if the device is in landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
      
        // Return true if both conditions are met
        return isMobile && isLandscape;
      }    

}
