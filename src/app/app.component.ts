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
    if (!this.isOpen ) {
      this.isOpen = true;
      const dialogRef = this.dialog.open(RessourceDialogComponent, {
        height: '70%',
        width: '40%',
        panelClass: 'bleu-pale-atv'
      });
  
      dialogRef.afterClosed().subscribe(result => {
        this.isOpen = false
        console.log(`Dialog result: ${result}`);
      });
    }
  }

}
