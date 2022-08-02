import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MapDashboardComponent } from './map-dashboard/map-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapDashboardComponent,
    PageNotFoundComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: 'Acceuil', component: HomeComponent },
      {path: 'Map', component: MapDashboardComponent},
      {path: 'Admin', component: AdminDashboardComponent},
      {path: '', redirectTo: '/Acceuil', pathMatch: 'full'},

      // wildcard
      {path: '**', component: PageNotFoundComponent}
    ]),
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule
  ],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
