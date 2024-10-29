import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RessourceDialogComponent } from './dialogs/ressource-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isOpen = false;

  constructor(public dialog: MatDialog) {}

  
  openDialog() {
    window.open('../assets/docs/Ressources-soutien-psychologique_RSP.pdf', '_blank');
  }

}