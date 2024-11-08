
import {Component} from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { TagService } from "../Service/tag.service";


@Component({
  templateUrl: './identification-dialog.component.html',
  styleUrls: ['./identification-dialog.component.css']

})


export class IdentificationDialogComponent {
log($event: any) {
  console.log($event)
}

  ageGroups = [
    'Moins de 18 ans', '18-24 ans', '25-34 ans', '35-44 ans',
    '45-54 ans', '55-64 ans', '65-74 ans', '75 et + ans'
  ];

  genders = [
     'Homme',
     'Femme' ,
     'Personne non-binaire',
     'Je ne souhaite pas répondre',
     'Autre',
    ];

  minorityGroups = [
    'Personne de la diversité sexuelle (lesbienne, gai, bisexuel-le, pansexuel-le, asexuel-le)',
    'Personne de la diversité de genre (trans, non-binaire, polygenre, pangenre, agenre, neutrois, fluide, etc.)',
    'Personne racisée',
    'Personne immigrante',
    'Personne portant un symbole culturel ou religieux',
    'Personne autochtonee',
    'Personne en situation de handicap visible',
    'Personne dont la langue maternelle n’est pas le français' ,
    'Personne en situation de handicap invisible (déficience intellectuelle, sensorielle, neurologique oupsychique)',
    'Personne en situation de précarité financière',
    'Personne vivant avec un autre facteur de discrimination',
  ];

  minorityGroup: any
  minorityTooltip: string;
  minorityOther = false;
  otherGender = false;

  selectedGender: string;
  ageGroup: any;
  genderPrecision: any;
  minorityGroupPrecision: any;


  constructor( public dialogRef: MatDialogRef<IdentificationDialogComponent>,
    private tagService: TagService) {
    this.minorityGroup = this.tagService.minorityGroup;
    if (this.minorityGroup){
      this.minorityTooltip = this.minorityGroup.map((x: any) => x.name).join(', ')
      this.minorityGroupPrecision = this.tagService.minorityGroupPrecision;
      this.checkMirorityGroup(this.minorityGroup);
    } else { 
      this.minorityTooltip  = '';
    }
    this.selectedGender = this.tagService.gender;
    this.genderPrecision = this.tagService.genderPrecision;
    this.ageGroup = this.tagService.ageGroup;
    if (this.selectedGender && this.selectedGender.trim()) {
      this.checkGender(this.selectedGender);
    }
  }
  checkGender(event: any) {
    this.selectedGender=event;
    this.otherGender = this.selectedGender.toUpperCase().includes('AUTRE');
  }
  
  checkMirorityGroup(event: any) {
    this.minorityGroup = event;
    this.minorityOther = this.minorityGroup.some((x: string) => x.toUpperCase().includes('AUTRE'));
    this.minorityTooltip = this.minorityGroup.map((x: any) => x).join(',  ');
  }
    
  saveIdentification() {
    let finalString = '';
    if (this.selectedGender) {
      this.tagService.gender = this.selectedGender;
      finalString += this.selectedGender;
      if (this.genderPrecision) {
        finalString += ' (' + this.genderPrecision + ')';
        this.tagService.genderPrecision = this.genderPrecision;
      }
    }

    if (this.ageGroup) {
      this.tagService.ageGroup = this.ageGroup;
      finalString = this.ageGroup
    }

    if (this.minorityGroup) {
      this.tagService.minorityGroup = this.minorityGroup;
      if (this.minorityGroup.length > 1) {
        finalString += this.minorityGroup.map((x: any) => x.name).join(', ');
      } else {
        finalString += this.minorityGroup;
      }

      if (this.minorityGroupPrecision) {
        this.tagService.minorityGroupPrecision = this.minorityGroupPrecision;
        finalString += ' (' + this.minorityGroupPrecision + ')';
      }
    }
    
    this.dialogRef.close({identification: finalString});
  }

  reset() {
    this.selectedGender = '';
    this.ageGroup = '';
    this.minorityGroup = '';
    this.minorityTooltip = '';
    this.minorityOther = false;
    this.minorityGroupPrecision = '';
    this.genderPrecision = '';
    this.tagService.gender = '';
    this.tagService.ageGroup  = '';
    this.tagService.minorityGroup  = '';
    this.tagService.genderPrecision = ''; 
    this.tagService.minorityGroupPrecision  = '';
    this.dialogRef.close({identification: ''});
  }
  

}
