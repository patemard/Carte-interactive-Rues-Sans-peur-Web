import { Component, OnInit } from '@angular/core';
import { Helper } from '../helper';

@Component({
  selector: 'app-ressource-dialog',
  templateUrl: './ressource-dialog.component.html'
//   styleUrls: ['./admin-dashboard.component.css']
})
export class RessourceDialogComponent extends Helper implements OnInit{

  constructor() {super() }

  ngOnInit(): void {
  }

}
