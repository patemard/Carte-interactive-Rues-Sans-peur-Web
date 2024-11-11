import { Component } from '@angular/core';
import { RessourceDialogComponent } from './dialogs/ressource-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isOpen = false;

  constructor(public dialog: MatDialog,) {}


  openDialog() {
    window.open('../assets/docs/Ressources-soutien-psychologique_RSP.pdf', '_blank');
  }



  openAbout() {
    const dialogRef = this.dialog.open(RessourceDialogComponent, {
      enterAnimationDuration: 700,
      panelClass:  window.innerWidth > window.innerHeight ? 'mt-5' : '',
    });
  }

}
