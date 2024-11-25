import { Component, ComponentFactoryResolver, Injector } from '@angular/core';
import { Control } from 'ol/control';  // OpenLayers Control
declare var ol: any;

export class TrajectoryInfoBanner extends Control {
  constructor(map: any, private injector: Injector, private resolver: ComponentFactoryResolver) {

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
                div.style.top = '5%';
            } else if (_isMobileLandscape) {
                div.style.top = '10%';
            } else {
                div.style.top = '12%';
                div.style.left = '32%';
            }
        });
    }


    const container = document.createElement('div');

    const div = document.createElement('div');
    div.style.position = 'absolute';
    if (_isMobilePortrait) {
      div.style.top = '5%';
    } else if (_isMobileLandscape) {
        div.style.top = '10%';
    } else {
      div.style.top = '12%';
      div.style.left = '32%';
    }
    div.id = 'infoBannerDiv';
    div.appendChild(container);

    // Pass the created div to the parent Control
    super({
      element: div
    });

    // Create Angular component dynamically
    const factory = this.resolver.resolveComponentFactory(SaveTrajectoryInfoBannerComponent);
    const componentRef = factory.create(this.injector);

    // Append the Angular component to the container
    container.appendChild(componentRef.location.nativeElement);

    // Run change detection manually to update the view
    componentRef.changeDetectorRef.detectChanges();
  }
}


@Component({
  selector: 'app-save-trajectory-info-banner',
  template: `
    <div class="info-banner">
      <p>
       Tracez votre trajectoire en ajoutant des points pour les relier, une fois la trajectoire complète, cliquez sur "Sauvegarder trajectoire".
      </p>
    </div>
  `,
  styles: [`
    .info-banner {
      background-color: rgba(52, 41, 121, 0.9);
      color: white;
      padding: 15px;
      border-radius: 16px;
      font-size: 16px;
      max-width: 80%;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .info-banner p {
      margin: 0;
    }
    @media (max-width: 430px) {
      .info-banner{
        max-width: 100%;
      }
    }

  `]
})
export class SaveTrajectoryInfoBannerComponent {

}
