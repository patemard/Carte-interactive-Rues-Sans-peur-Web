import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MapDashboardComponent } from './map-dashboard/map-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {
  MatDialogModule

} from '@angular/material/dialog';
import { RessourceDialogComponent } from './dialogs/ressource-dialog.component';
import {CompletedCardDialogComponent} from "./dialogs/completedCard-dialog.component";
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { SaveTrajectoryButtonComponent } from './interfaces/SaveTrajectoryButton';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapDashboardComponent,
    PageNotFoundComponent,
    CompletedCardDialogComponent,
    AdminDashboardComponent,
    RessourceDialogComponent,
    ConfirmDialogComponent,
    SaveTrajectoryButtonComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: '', component: MapDashboardComponent},
      {path: 'admin', component: AdminDashboardComponent},
      {path: 'carte/:id', component: MapDashboardComponent},

      // wildcard
      {path: '**', component: PageNotFoundComponent},
      {path: 'introuvable', component: PageNotFoundComponent}
    ]),
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    HttpClientModule,
    ScrollingModule

  ],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
