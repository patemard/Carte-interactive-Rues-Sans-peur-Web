import { Constants } from "./constants";

export class Helper extends Constants {
    
   _isMobilePortrait: boolean = false;
   _isMobileLandscape: boolean = false;


    isMobile() {
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);


        if (isMobile) {

            this._isMobilePortrait = window.innerWidth <= 768;
            this._isMobileLandscape = window.innerWidth > window.innerHeight; // Typical breakpoint for tablets and mobile

            window.addEventListener('resize', () => {
                if (window.innerWidth > window.innerHeight) {
                    this._isMobilePortrait = false;
                    this._isMobileLandscape = true;
                } else {
                    this._isMobilePortrait = true;
                    this._isMobileLandscape = false;
                }
            }); 
        }
    }
  


}
