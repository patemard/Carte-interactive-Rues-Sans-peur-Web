import {Component, EventEmitter, Inject, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {TagService} from "../Service/tag.service";
import * as bcrypt from 'bcryptjs';
import { IpService } from '../Service/ip.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loginPass: boolean = false;
  currentPassword: string;
  password: string = "";
  private _tagService: TagService;
  private _ipService: IpService;
  constructor(tagService: TagService,
    ipservice: IpService
  ) {
    this._tagService = tagService;
    this._ipService = ipservice;
    this.currentPassword = '';
  }

  ngOnInit(): void {
    this._ipService.getHash().subscribe((res: any) => {
      this.password = res[0].password_hash;
    })
  }


  login() {
    bcrypt.compare(this.currentPassword, this.password).then((isMatch: any) => {
      if (isMatch) {
        this.loginPass = true;
        this._tagService.isAdmin = true;
      } else {
        this._tagService.isAdmin = false;
        this.loginPass = false;
      }
    });
  }
}
