import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RessourceDialogComponent } from './dialogs/ressource-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public dialog: MatDialog) {}

  
  openDialog() {
    
    const dialogRef = this.dialog.open(RessourceDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  
  }

}
