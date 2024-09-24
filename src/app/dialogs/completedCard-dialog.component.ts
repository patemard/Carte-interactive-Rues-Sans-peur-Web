
import {Component, OnInit} from "@angular/core";
import { TagService } from "../Service/tag.service";
import { IpService } from "../Service/ip.service";
import { Helper } from "../helper";
import { Tag } from "../Models/tag";
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog.component';
import { MatDialog } from "@angular/material/dialog";


@Component({
  selector: 'completedCard-dialog',
  templateUrl: 'completedCard-dialog.component.html',
  styleUrls: ['./completedCard-dialog.component.css']
})



export class CompletedCardDialogComponent extends Helper  implements OnInit {
  tagService_: TagService;
  ipService_: IpService;
  heartIsClicked: boolean = false;
  flagIsClicked: boolean = false;
  completedCardColor: string = '';
  selectedEmotion: any;
  selectedTransport: any;
  selectedType: any;
  ipAddress: string = '';

  constructor(tagService: TagService,
    ipService: IpService,
    public dialog: MatDialog,

  ) {
    super();
    this.tagService_ = tagService;
    this.ipService_ = ipService;
  }

  ngOnInit(): void {
    this.getUserIp();
    this.cardInitialization();

  }

  cardInitialization() {
    if (this.tagService_.selectedTag) {
      const emotion = this.tagService_.selectedTag.emotion;
      if (this.tagService_.selectedTag.flagged) {
        this.flagIsClicked =  this.tagService_.selectedTag.flagged.some(h => h === this.ipAddress);
      }
      const color = this.emotions.find(x => x.name ===emotion)?.rgb;
      this.heartIsClicked = this.tagService_.selectedTag.heart ? this.tagService_.selectedTag.heart.some(h => h === this.ipAddress) : false;
      this.completedCardColor = color?.card || '';
      this.selectedEmotion = this.tagService_.selectedTag.emotion;
      this.selectedTransport = this.tagService_.selectedTag.transport;
      this.selectedType = this.tagService_.selectedTag.trajectory ? "Trajectoire" : "Point";
    }

  }


  heart() {
    if (this.tagService_.selectedTag && !this.tagService_.selectedTag.heart) {
      this.tagService_.selectedTag.heart = [];
    }
    this.tagService_.selectedTag.heart.push(this.ipAddress);
    this.heartIsClicked = true;

    this.updateTag(this.tagService_.selectedTag);

  }

  flag() {
    if (!this.tagService_.selectedTag.flagged) {
      this.tagService_.selectedTag.flagged = [];
    }
    this.tagService_.selectedTag.flagged.push(this.ipAddress);
    if (this.tagService_.selectedTag.flagged.length > 1) {
      // Hide if more than one flagged
      this.tagService_.selectedTag.active = false;
    }
    this.flagIsClicked = true;

    this.updateTag(this.tagService_.selectedTag);
    this.sendEmail();

  }

  updateTag(tag: Tag) {
    this.tagService_.updateTag(tag.id, tag)
      .subscribe(res => {
        // this.refresh();
        // close and refresh on map component;
    })
  }


  sendEmail() {
    const id = this.tagService_.selectedTag ? this.tagService_.selectedTag.id : '';
    const emailData = {
      from: 'RuesSansPeur@gmail.com',
      to: 'pat.emard@posteo.net',
      subject: 'Témoignage Signalé',
      text: 'Le témoignage #' + ' ' + id + ' a éte signalé'
    };

    this.tagService_.sendEmail(emailData)
      .subscribe((response: any) => {
        console.log('Email sent successfully!', response);
      }, (error: any) => {
        console.error('Failed to send email.', error);
      });
  }

  getUserIp() {
    this.ipService_.getIpAddress().subscribe( (data) => {
        if (data.ip){
          this.ipAddress = data.ip;
        }
      },
      (error) => {
        console.error('Failed to fetch IP address', error);
      }
    );
  }

  close(){}

  openDeleteDialog(enterAnimationDuration: string, exitAnimationDuration: string): void  {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);

      if(result.event == 'hide'){
        this.tagService_.selectedTag.active = false;
        this.updateTag(this.tagService_.selectedTag);
      }else if(result.event == 'unhide'){
        this.tagService_.selectedTag.active = true;
        if (this.tagService_.selectedTag.id) {
          this.updateTag(this.tagService_.selectedTag);
        }
      } else if(result.event == 'delete'){
        if (this.tagService_.selectedTag.id) {
          this.delete(this.tagService_.selectedTag.id);
        }
      }
    });
  }

  delete(id: string) {
    if (id) {
      this.tagService_.deleteTag(id)
      .subscribe( res =>{
        // this.refresh();
      })
    }
  }

}
