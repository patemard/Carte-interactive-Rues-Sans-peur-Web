import { Injectable } from '@angular/core';
import { Tag } from '../Models/tag';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class TagService {
  private _isAdmin = false;
  private _selectedTag: Tag | undefined;
  private _gender: any;
  private _genderPrecision: any;
  private _ageGroup: any;
  private _minorityGroup: any;
  private _minorityGroupPrecision: any;


  // Node/Express APIw
  REST_API: string = environment.REST_API;

  // Http Header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient) {}

  public get gender() {
    return this._gender;
  }

  public set gender(gender: any) {
    this._gender = gender;
  }

  public get ageGroup() {
    return this._ageGroup;
  }

  public set ageGroup(ageGroup: any) {
    this._ageGroup = ageGroup;
  }

  public get genderPrecision() {
    return this._genderPrecision;
  }

  public set genderPrecision(genderPrecision: any) {
    this._genderPrecision = genderPrecision;
  }
  public get minorityGroup() {
    return this._minorityGroup;
  }

  public set minorityGroup(minorityGroup: any) {
    this._minorityGroup = minorityGroup;
  }

  public get minorityGroupPrecision() {
    return this._minorityGroupPrecision;
  }

  public set minorityGroupPrecision(minorityGroupPrecision: any) {
    this._minorityGroupPrecision = minorityGroupPrecision;
  }


  public get isAdmin() {
    return this._isAdmin;
  }

  public set isAdmin(isAdmin: boolean) {
    this._isAdmin = isAdmin;
  }

  public get selectedTag() {
    return this._selectedTag;
  }

  public set selectedTag(selectedTag: Tag | undefined) {
    this._selectedTag = selectedTag;
  }

  // Add
  addTag(data: Tag): Observable<any> {
    let API_URL = `${this.REST_API}/add-tag`;
    return this.httpClient.post(API_URL, data)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Get all objects
  getTags() {
    return this.httpClient.get(`${this.REST_API}`);
  }

  // Get single object
  getTag(id:any): Observable<any> {
    let API_URL = `${this.REST_API}/read-tag/${id}`;
    return this.httpClient.get(API_URL, { headers: this.httpHeaders })
      .pipe(map((res: any) => {
          return res || {}
        }),
        catchError(this.handleError)
      )
  }

  // Update
  updateTag(id:any, data:any): Observable<any> {
    let API_URL = `${this.REST_API}/update-tag/${id}`;
    return this.httpClient.put(API_URL, data, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      )
  }

  // Delete
  deleteTag(id:any): Observable<any> {
    let API_URL = `${this.REST_API}/delete-tag/${id}`;
    return this.httpClient.delete(API_URL, { headers: this.httpHeaders}).pipe(
        catchError(this.handleError)
      )
  }

  addImage(data: any): Observable<any> {
    let API_URL = `${this.REST_API}/add-image`;
    return this.httpClient.post(API_URL, data)
    .pipe(
      catchError(this.handleError)
    )
}
  // Error
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Handle client error
      errorMessage = error.error.message;
    } else {
      // Handle server error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  sendEmail(emailData: { from: string; to: string[]; subject: string; text: string; }) {
    let API_URL = `${this.REST_API}/send-email`;

    return this.httpClient.post(API_URL, emailData);
  }


}
