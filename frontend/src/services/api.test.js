import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api, { registerUser, loginUser } from './api';

describe('API Client', () => {
  let mock;

  beforeEach(() => {
    // This sets the mock adapter on the default instance
    mock = new MockAdapter(api);
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('Axios Interceptor', () => {
    it('should attach Authorization header when studyos_token is present in localStorage', async () => {
      const token = 'test-token-123';
      localStorage.setItem('studyos_token', token);

      mock.onGet('/test-auth').reply((config) => {
        return [200, { headerAttached: config.headers.Authorization === `Bearer ${token}` }];
      });

      const response = await api.get('/test-auth');
      expect(response.data.headerAttached).toBe(true);
    });

    it('should attach Authorization header when access_token is present in localStorage', async () => {
      const token = 'test-token-access-456';
      localStorage.setItem('access_token', token);

      mock.onGet('/test-auth-2').reply((config) => {
        return [200, { headerAttached: config.headers.Authorization === `Bearer ${token}` }];
      });

      const response = await api.get('/test-auth-2');
      expect(response.data.headerAttached).toBe(true);
    });

    it('should not attach Authorization header when no token is present', async () => {
      mock.onGet('/test-auth-none').reply((config) => {
        return [200, { hasAuthHeader: !!config.headers.Authorization }];
      });

      const response = await api.get('/test-auth-none');
      expect(response.data.hasAuthHeader).toBe(false);
    });
  });

  describe('registerUser', () => {
    it('should register a user successfully and store token', async () => {
      const mockResponse = { access_token: 'new-reg-token', user: { id: 1, email: 'test@example.com' } };

      mock.onPost('/auth/register').reply(200, mockResponse);

      const data = await registerUser('test@example.com', 'password123');

      expect(data).toEqual(mockResponse);
      expect(localStorage.getItem('studyos_token')).toBe('new-reg-token');

      // Verify the payload sent
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle registration without token gracefully', async () => {
      const mockResponse = { user: { id: 1, email: 'test@example.com' } };

      mock.onPost('/auth/register').reply(200, mockResponse);

      const data = await registerUser('test@example.com', 'password123');

      expect(data).toEqual(mockResponse);
      expect(localStorage.getItem('studyos_token')).toBeNull();
    });

    it('should throw an error on registration failure', async () => {
      mock.onPost('/auth/register').reply(400, { detail: 'Email already registered' });

      await expect(registerUser('test@example.com', 'password123')).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully and store token', async () => {
      const mockResponse = { access_token: 'new-login-token', user: { id: 1, email: 'test@example.com' } };

      mock.onPost('/auth/login').reply(200, mockResponse);

      const data = await loginUser('test@example.com', 'password123');

      expect(data).toEqual(mockResponse);
      expect(localStorage.getItem('studyos_token')).toBe('new-login-token');

      // Verify the payload sent
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle login without token gracefully', async () => {
      const mockResponse = { user: { id: 1, email: 'test@example.com' } };

      mock.onPost('/auth/login').reply(200, mockResponse);

      const data = await loginUser('test@example.com', 'password123');

      expect(data).toEqual(mockResponse);
      expect(localStorage.getItem('studyos_token')).toBeNull();
    });

    it('should throw an error on login failure', async () => {
      mock.onPost('/auth/login').reply(401, { detail: 'Incorrect username or password' });

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow();
    });
  });
});
