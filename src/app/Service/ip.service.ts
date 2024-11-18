import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IpService {

  private ipifyUrl = 'https://api.ipify.org?format=json';
  private nomatimUrl = 'https://nominatim.openstreetmap.org/reverse?';

  REST_API: string = environment.REST_API;

  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) { }

  getIpAddress(): Observable<any> {
    return this.http.get<any>(this.ipifyUrl);
  }

  getCoordDetails(lat: string, lon: string) : Observable<any> {
    let url = this.nomatimUrl + 'lat=' + lat +'&lon=' + lon + '&format=json';
    return this.http.get<any>(url);
  }

  verifyPassword(inputPassword: string): Observable<any> {
    const API_URL = `${this.REST_API}/verify-password`;
    return this.http.post(API_URL, { inputPassword }, { headers: this.httpHeaders })
      .pipe(
        map((res: any) => res || {}),
        catchError(this.handleError)
      );
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
}
