import {Component, EventEmitter, Inject, OnInit, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {TagService} from "../Service/tag.service";
import { IpService } from '../Service/ip.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loginPass: boolean = false;
  currentPassword: string = '';

  constructor(private tagService: TagService, private ipService: IpService) {}


  ngOnInit(): void {}

  login() {
    this.ipService.verifyPassword(this.currentPassword).subscribe({
      next: (res: any) => {
        if (res.message === 'Password match') {
          this.loginPass = true;
          this.tagService.isAdmin = true;
        } else {
          this.loginPass = false;
          this.tagService.isAdmin = false;
        }
      },
      error: (err: any) => {
        console.error('Error during password verification:', err);
        this.loginPass = false;
        this.tagService.isAdmin = false;
      }
    });
}
}
