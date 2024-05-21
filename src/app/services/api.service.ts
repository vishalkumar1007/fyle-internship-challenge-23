import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, throwError } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private http: HttpClient) {}
  
  getData(githubUsername:string): Observable<any[]> {
    const baseUrl = `https://api.github.com/users/${githubUsername}`; 
    return this.http.get<any[]>(baseUrl); 
  }
  getRepoData(githubUsernameForRepo:string , page:number , per_page:number):Observable<any[]>{
    // const RepoUrl = `https://api.github.com/users/${githubUsernameForRepo}/repos?per_page=${limit}`
    const RepoUrl = `https://api.github.com/users/${githubUsernameForRepo}/repos?page=${page}&per_page=${per_page}`
    return this.http.get<any[]>(RepoUrl);
  }
  getTechStackData(url : string):Observable<any[]>{
    console.log('api url in api server',url);
    return this.http.get<any[]>(url);
  }
}