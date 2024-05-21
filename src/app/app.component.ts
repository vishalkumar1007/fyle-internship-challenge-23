import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  userData: any = false;
  repoData: any = [];
  cachedRepoData: { [page: number]: any[] } = {};
  githubId: string = '';
  page: number = 1;
  per_page: number = 6;
  repo_limit: number = 12;
  user_total_repo: any;
  totalPages: number[] = [];

  constructor(private apiService: ApiService) {}
  @ViewChild('mainLoader') mainLoader!: ElementRef;
  @ViewChild('msgNoRepo') msgNoRepo!: ElementRef;

  async createPage() {
    if (this.user_total_repo < this.repo_limit) {
      this.repo_limit = this.user_total_repo;
    }
    
    const total_page = Math.ceil(this.repo_limit / this.per_page);
    this.totalPages = Array(total_page).fill(0).map((x, i) => i + 1);
  }

  async fetchRepoData(pageNumber: number) {
    try {
      this.mainLoader.nativeElement.style.display = 'block';
      const repo = await this.apiService.getRepoData(this.githubId, pageNumber, this.per_page).toPromise();
      if (repo) {
        const repoWithLanguages = await Promise.all(repo.map(async (r: any) => {
          const languages = await this.apiService.getTechStackData(r.languages_url).toPromise();
          return { ...r, languages: Object.keys(languages as object) };
        }));
        this.cachedRepoData[pageNumber] = repoWithLanguages;  
        return repoWithLanguages;
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('Error fetching repository data:', error);
        alert(error.error?.message || 'Unexpected error. Maybe a network problem.');
        this.mainLoader.nativeElement.style.display = 'none';
      }
      return [];
    } finally {
      this.mainLoader.nativeElement.style.display = 'none';
    }
    
    return []; 
  }
  
  async showRepo(pageNumber: number) {
    this.mainLoader.nativeElement.style.display = 'block';
    if (this.cachedRepoData[pageNumber]) {
      this.repoData = this.cachedRepoData[pageNumber]; 
    } else {
      this.repoData = await this.fetchRepoData(pageNumber);
    }
    console.log('Repo data with languages:', this.repoData);
    this.mainLoader.nativeElement.style.display = 'none';
  }

  async saveGithubId() {
    if (this.githubId && this.repo_limit > 0 && this.repo_limit <= 100) {
      try {
        this.msgNoRepo.nativeElement.style.display = 'none';
        this.mainLoader.nativeElement.style.display = 'block';
        const data = await this.apiService.getData(this.githubId).toPromise();
        this.userData = data;
        this.user_total_repo = this.userData.public_repos;
        this.createPage();
        this.showRepo(this.page);
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          console.error('Error fetching user data:', error);
          alert(error.error?.message || 'Unexpected error. Maybe a network problem.');
          this.mainLoader.nativeElement.style.display = 'none';
        }
      }
    } else {
      if (this.githubId === '') {
        alert('Enter GitHub user ID');
      } else {
        alert('Repo limit must be within 1 to 100');
      }
    }
  }

  changePage(pageNumber: number) {
    if (pageNumber > 0 && pageNumber <= this.totalPages.length) {
      this.page = pageNumber;
      this.showRepo(pageNumber);
    }
  }
}
