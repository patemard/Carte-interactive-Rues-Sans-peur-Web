import { Component } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { TagService } from "../Service/tag.service";
@Component({
  templateUrl: 'confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  selectedAction: any
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    protected tagService: TagService
  ) {}

  confirm(){
    console.log(this.selectedAction);
    if (this.selectedAction == 'hide') {

      // TOdo should return info to main component.
      // let tag = this.tagService.selectedTag;
      // if (tag) {
      //   tag.active = false;
      //   this.tagService.updateTag(tag.id, tag).subscribe();
      // }
      // update new inactive value
    } else if (this.selectedAction == 'delete') {

    }

    }
}
