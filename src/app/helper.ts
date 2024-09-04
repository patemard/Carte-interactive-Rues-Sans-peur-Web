import { Constants } from "./constants";

export class Helper extends Constants {


    isMobileDevice() {
        return window.innerWidth <= 768; // Typical breakpoint for tablets and mobile
    }
        

}
