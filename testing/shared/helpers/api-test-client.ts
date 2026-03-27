/**
 * API Test Client - Helper for API testing
 * 
 * Provides a fluent interface for making authenticated API requests
 * with built-in response time tracking and error handling.
 */

export interface APIResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  data: T;
  responseTime: number;
  ok: boolean;
}

export interface APIClientStats {
  totalRequests: number;
  avgResponseTime: number;
  errorCount: number;
  successCount: number;
}

export class APITestClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestCount: number = 0;
  private responseTimes: number[] = [];
  private errorCount: number = 0;
  private successCount: number = 0;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    };
  }

  /**
   * Set default header
   */
  setHeader(name: string, value: string): this {
    this.defaultHeaders[name] = value;
    return this;
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string): this {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    return this;
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    method: string,
    path: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
      query?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    this.requestCount++;

    const { data, headers, query, timeout = 30000 } = options;

    // Build URL with query params
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const queryParams = new URLSearchParams(query).toString();
      url += `${url.includes('?') ? '&' : '?'}${queryParams}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const apiResponse: APIResponse<T> = {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        data: responseData as T,
        responseTime,
        ok: response.status >= 200 && response.status < 300,
      };

      if (apiResponse.ok) {
        this.successCount++;
      } else {
        this.errorCount++;
      }

      return apiResponse;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);
      this.errorCount++;

      throw new APIError(
        error instanceof Error ? error.message : 'Request failed',
        method,
        path,
        responseTime
      );
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    path: string,
    options?: { headers?: Record<string, string>; query?: Record<string, string> }
  ): Promise<APIResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  /**
   * POST request
   */
  async post<T = any>(
    path: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<APIResponse<T>> {
    return this.request<T>('POST', path, { ...options, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    path: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<APIResponse<T>> {
    return this.request<T>('PUT', path, { ...options, data });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    path: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<APIResponse<T>> {
    return this.request<T>('PATCH', path, { ...options, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    path: string,
    options?: { headers?: Record<string, string> }
  ): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Get client statistics
   */
  getStats(): APIClientStats {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;

    return {
      totalRequests: this.requestCount,
      avgResponseTime,
      errorCount: this.errorCount,
      successCount: this.successCount,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.requestCount = 0;
    this.responseTimes = [];
    this.errorCount = 0;
    this.successCount = 0;
  }
}

/**
 * API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public method: string,
    public path: string,
    public responseTime: number
  ) {
    super(`${method} ${path}: ${message}`);
    this.name = 'APIError';
  }
}

/**
 * Create authenticated client
 */
export function createAPIClient(baseUrl: string, authToken?: string): APITestClient {
  return new APITestClient(baseUrl, authToken);
}
