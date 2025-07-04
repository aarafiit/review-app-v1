import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from "@angular/common/http";
import {environment} from "../../../environment/environment.development";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private apiUrl = environment.apiUrl;
  private reviewsSubject = new BehaviorSubject<any>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  // Add search loading state
  private searchLoadingSubject = new BehaviorSubject<boolean>(false);
  public searchLoading$ = this.searchLoadingSubject.asObservable();

  constructor( private http: HttpClient) { }

  getAnalyticsData(searchParam?: string): Observable<HttpResponse<any[]>>{
    let params = new HttpParams();
    if(searchParam){
      params = params.set("searchParam", searchParam);
    }
    return this.http.get<any[]>(this.apiUrl+"/analytics", {params, observe: "response"})
  }
}
