import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';

// Mock ApiService
class MockApiService {
  getData(githubId: string) {
    return of({
      public_repos: 5
    });
  }

  getRepoData(githubId: string, pageNumber: number, per_page: number) {
    const repos = Array(per_page).fill({
      languages_url: 'mock_languages_url'
    });
    return of(repos);
  }

  getTechStackData(languages_url: string) {
    return of({
      JavaScript: 100,
      TypeScript: 100
    });
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: ApiService, useClass: MockApiService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);

    component.mainLoader = {
      nativeElement: {
        style: {
          display: ''
        }
      }
    } as ElementRef;

    component.msgNoRepo = {
      nativeElement: {
        style: {
          display: ''
        }
      }
    } as ElementRef;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should create pages correctly', () => {
    component.user_total_repo = 10;
    component.repo_limit = 6;
    component.createPage();
    expect(component.totalPages.length).toBe(1);
  });

  it('should fetch and cache repo data correctly', async () => {
    component.githubId = 'testuser';
    const repoData = await component.fetchRepoData(1);
    expect(repoData.length).toBe(6);
    expect(repoData[0].languages).toEqual(['JavaScript', 'TypeScript']);
    expect(component.cachedRepoData[1]).toBe(repoData);
  });

  it('should handle error in fetchRepoData correctly', async () => {
    spyOn(apiService, 'getRepoData').and.returnValue(throwError(new HttpErrorResponse({ error: 'Error fetching repo data' })));
    component.githubId = 'testuser';
    const repoData = await component.fetchRepoData(1);
    expect(repoData).toEqual([]);
  });

  it('should show repo data from cache', async () => {
    component.githubId = 'testuser';
    component.cachedRepoData[1] = [{ name: 'Repo1' }];
    await component.showRepo(1);
    expect(component.repoData).toEqual([{ name: 'Repo1' }]);
  });

  it('should fetch and show repo data if not in cache', async () => {
    component.githubId = 'testuser';
    await component.showRepo(1);
    expect(component.repoData.length).toBe(6); 
    expect(component.repoData[0].languages).toEqual(['JavaScript', 'TypeScript']);
  });

  it('should save GitHub ID and fetch user data', async () => {
    component.githubId = 'testuser';
    component.repo_limit = 10;
    await component.saveGithubId();
    expect(component.userData.public_repos).toBe(5);
  });

  it('should change page correctly', async () => {
    component.totalPages = [1, 2, 3];
    spyOn(component, 'showRepo').and.stub();
    component.changePage(2);
    expect(component.page).toBe(2);
    expect(component.showRepo).toHaveBeenCalledWith(2);
  });

  it('should alert on invalid GitHub ID or repo limit', () => {
    spyOn(window, 'alert');
    component.githubId = '';
    component.saveGithubId();
    expect(window.alert).toHaveBeenCalledWith('Enter GitHub user ID');

    component.githubId = 'testuser';
    component.repo_limit = 101;
    component.saveGithubId();
    expect(window.alert).toHaveBeenCalledWith('Repo limit must be within 1 to 100');
  });
});
