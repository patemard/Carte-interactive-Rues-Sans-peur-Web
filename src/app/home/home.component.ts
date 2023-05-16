import { Component, OnInit } from '@angular/core';
import { Helper } from '../helper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends Helper implements OnInit  {

  constructor() {super() }

  ngOnInit() {
  }

}
