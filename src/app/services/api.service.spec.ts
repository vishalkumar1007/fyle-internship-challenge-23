import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user data', () => {
    const mockUserData = [{ id: 1, name: 'John Doe' }];
    const githubUsername = 'johndoe';

    service.getData(githubUsername).subscribe(data => {
      expect(data).toEqual(mockUserData);
    });

    const req = httpTestingController.expectOne(`https://api.github.com/users/${githubUsername}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUserData);
  });

  it('should fetch user repos', () => {
    const mockRepoData = [{ id: 1, name: 'Repo1' }];
    const githubUsernameForRepo = 'johndoe';
    const page = 1;
    const per_page = 10;

    service.getRepoData(githubUsernameForRepo, page, per_page).subscribe(data => {
      expect(data).toEqual(mockRepoData);
    });

    const req = httpTestingController.expectOne(`https://api.github.com/users/${githubUsernameForRepo}/repos?page=${page}&per_page=${per_page}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRepoData);
  });

  it('should fetch tech stack data', () => {
    const mockTechStackData = [{ id: 1, tech: 'Angular' }];
    const url = 'https://api.example.com/tech-stack';

    service.getTechStackData(url).subscribe(data => {
      expect(data).toEqual(mockTechStackData);
    });

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush(mockTechStackData);
  });
});
