import {Component, EventEmitter, Inject, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {TagService} from "../Service/tag.service";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loginPass: boolean = false;
  currentPassword: string;
  password: string = "1" // TODO: put in DB hashed
  private _tagService: TagService;
  constructor(tagService: TagService) {
    this._tagService = tagService;
    this.currentPassword = '';
  }

  ngOnInit(): void {

  }


  login() {
    if (this.currentPassword === this.password) {
      this.loginPass = true;
      this._tagService.isAdmin = true;
    } else {
      this._tagService.isAdmin = false;
      this.loginPass = false;

    }
  }
}
