import { Control   } from 'ol/control';
declare var ol: any;
  
  // Create a custom control for the checkbox
  export class SaveTrajectoryButton extends Control {
    
    constructor(map: any, private injector: Injector, private resolver: ComponentFactoryResolver){
        // Create a container for the Angular component
        const container = document.createElement('div');
        
        // Create a div element to append the Angular component
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = '30%';
        div.style.left = '50%';
        div.id = 'saveTrajectoryDiv';
        div.appendChild(container);
    
        super({
            element: div
        });
    
        // Create Angular component dynamically
        const factory = this.resolver.resolveComponentFactory(SaveTrajectoryButtonComponent);
        const componentRef = factory.create(this.injector);
    
        // Append the Angular component to the container
        container.appendChild(componentRef.location.nativeElement);
    
        // Run change detection manually
        componentRef.changeDetectorRef.detectChanges();
  }
  }

  import { Component, ComponentFactoryResolver, Injector} from '@angular/core';

@Component({
    selector: 'app-save-trajectory-button',
    template: `
        <button mat-raised-button color="bleu-atv" id="saveTrajectory">
        Sauvegarder Trajectoire
        </button>
    `,
    styles: [`
        #saveTrajectory {
            width:full-width
        }
    `]
})
export class SaveTrajectoryButtonComponent {}