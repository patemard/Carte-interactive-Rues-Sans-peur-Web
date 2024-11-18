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
    this.dialogRef.close({event:this.selectedAction});
    }
}
