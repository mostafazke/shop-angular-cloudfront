import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve token', () => {
    const token = 'test-token';
    service.setToken(token);

    expect(service.getToken()).toBe(token);
  });

  it('should remove token', () => {
    service.setToken('test-token');
    service.removeToken();

    expect(service.getToken()).toBeNull();
  });

  it('should generate base64 token', () => {
    const token = service.generateToken('mostafazke', 'TEST_PASSWORD');

    expect(token).toBe('bW9zdGFmYXprZTpURVNUX1BBU1NXT1JE');
  });

  it('should check if token exists', () => {
    expect(service.hasToken()).toBeFalse();
    service.setToken('test-token');

    expect(service.hasToken()).toBeTrue();
  });
});
