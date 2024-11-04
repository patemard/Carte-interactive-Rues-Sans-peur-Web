import { Control   } from 'ol/control';
  
  // Create a custom control for the checkbox
  export class CustomCheckboxControl extends Control {
    private  checkboxElement: HTMLInputElement;
    private  trajectoryCheckboxElement: HTMLInputElement;
    private  pointLayers_: any;
    private  trajectoryLayer_: any;
    private  clusteredLayer_: any;

    constructor(pointLayers: any, 
      trajectoryLayer: any, 
      clusteredLayer: any,
      isMobile: boolean, 
      isMobileLandscape: boolean){

      const pointCheckbox = document.createElement('input');
      pointCheckbox.type = 'checkbox';
      pointCheckbox.id = 'togglePoints';
      if (isMobileLandscape) {
        pointCheckbox.style.height = "4vh";
        pointCheckbox.style.width = "4vh";
      } else {
        pointCheckbox.style.height = "2vh";
        pointCheckbox.style.width = "2vh";
      }
      pointCheckbox.checked = true;
      
      const pointIcon = document.createElement('i');
      pointIcon.className="fa fa-map-marker"

      const labelPoints = document.createElement('label');
      labelPoints.htmlFor = 'togglePoints';
      labelPoints.textContent = 'Points';
      labelPoints.style.fontFamily= 'haas'

      const div = document.createElement('div');
      div.className = 'ol-unselectable ol-control';
      div.style.position = 'absolute';
      div.style.right = '3%';
      div.style.borderRadius = "16px"
      div.id = "checkboxesDiv"
      div.style.backgroundColor = "transparent"

      div.appendChild(pointCheckbox);
      div.appendChild(labelPoints);

      const trajectoryCheckbox= document.createElement('input');
      trajectoryCheckbox.type = 'checkbox';
      trajectoryCheckbox.id = 'toggleTrajectory';
      if (isMobileLandscape) {
        trajectoryCheckbox.style.height = "4vh";
        trajectoryCheckbox.style.width = "4vh";
      } else {
        trajectoryCheckbox.style.height = "2vh";
        trajectoryCheckbox.style.width = "2vh";
      }

      trajectoryCheckbox.checked = true;

      const trajectoryIcon = document.createElement('i');
      trajectoryIcon.className="fa fa-map-o"

      const labelTrajectory = document.createElement('label');
      labelTrajectory.htmlFor = 'toggleTrajectory';
      labelTrajectory.textContent = 'Trajectoires';
      
      const br = document.createElement("br");
      div.appendChild(br);

      div.appendChild(trajectoryCheckbox);
      div.appendChild(labelTrajectory);
      // div.appendChild(trajectoryIcon);

      super({
        element: div,
        target: undefined,
      });
      this.pointLayers_ = pointLayers;
      this.trajectoryLayer_ = trajectoryLayer;
      this.clusteredLayer_ = clusteredLayer;
      this.checkboxElement = pointCheckbox;
      this.trajectoryCheckboxElement = trajectoryCheckbox;


      // Add event listener for the checkbox
      this.checkboxElement.addEventListener('change', this.handleCheckboxChange.bind(this));
      this.trajectoryCheckboxElement.addEventListener('change', this.handleTrajectoryCheckboxChange.bind(this));

    }

    // Handle checkbox state change
    private handleCheckboxChange(event: Event) {
      const isChecked = (event.target as HTMLInputElement).checked

      for (let i = 0; i < this.pointLayers_.length; i++) {
        const element = this.pointLayers_[i];
        element.setVisible(isChecked);
      }

      for (let i = 0; i < this.clusteredLayer_.length; i++) {
        const element = this.clusteredLayer_[i];
        element.setVisible(isChecked);   
      }
    }
    // Handle checkbox state change
    private handleTrajectoryCheckboxChange(event: Event) {
      const isChecked = (event.target as HTMLInputElement).checked

      for (let i = 0; i < this.trajectoryLayer_.length; i++) {
        const element = this.trajectoryLayer_[i];
        element.setVisible(isChecked);
      }

    }

}