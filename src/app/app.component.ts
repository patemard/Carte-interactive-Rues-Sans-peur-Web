import { Component } from '@angular/core';
import { RessourceDialogComponent } from './dialogs/ressource-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Helper } from './helper';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends Helper {
  isOpen = false;
  private dialogRef: any = null; // Reference to the opened dialog

  constructor(public dialog: MatDialog,) {super()
    this.isMobile();
  }


  openDialog() {
    window.open('../assets/docs/Ressources-soutien-psychologique_RSP.pdf', '_blank');
  }



  openAbout() {
    // Check if dialog is already open
    if (this.dialogRef) {
      console.log('Modal is already open');
      return; // Prevent opening a new dialog if one is already open
    }

    this.dialogRef = this.dialog.open(RessourceDialogComponent, {
      enterAnimationDuration: 700,
      panelClass:  window.innerWidth > window.innerHeight ? 'mt-5' : '',
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;  // Reset the dialog reference when it's closed
    });
  }

}
