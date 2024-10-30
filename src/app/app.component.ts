import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isOpen = false;

  constructor() {}

  
  openDialog() {
    window.open('../assets/docs/Ressources-soutien-psychologique_RSP.pdf', '_blank');
  }

}