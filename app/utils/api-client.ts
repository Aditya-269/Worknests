const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh tokens
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      
      // Better error handling for Django REST Framework responses
      let message = 'An error occurred';
      let errors = errorData;
      
      console.log('API Error Details:', errorData); // Debug log
      
      // Handle field-specific validation errors
      if (errorData.email && Array.isArray(errorData.email)) {
        message = errorData.email[0];
      } else if (errorData.password && Array.isArray(errorData.password)) {
        message = errorData.password[0];
      } else if (errorData.confirm_password && Array.isArray(errorData.confirm_password)) {
        message = errorData.confirm_password[0];
      } else if (errorData.name && Array.isArray(errorData.name)) {
        message = `Name: ${errorData.name[0]}`;
      } else if (errorData.about && Array.isArray(errorData.about)) {
        message = `About: ${errorData.about[0]}`;
      } else if (errorData.resume && Array.isArray(errorData.resume)) {
        message = `Resume: ${errorData.resume[0]}`;
      } else if (errorData.location && Array.isArray(errorData.location)) {
        message = `Location: ${errorData.location[0]}`;
      } else if (errorData.website && Array.isArray(errorData.website)) {
        message = `Website: ${errorData.website[0]}`;
      } else if (errorData.x_account && Array.isArray(errorData.x_account)) {
        message = `X Account: ${errorData.x_account[0]}`;
      } else if (errorData.logo && Array.isArray(errorData.logo)) {
        message = `Logo: ${errorData.logo[0]}`;
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        message = errorData.non_field_errors[0];
      } else if (errorData.detail) {
        message = errorData.detail;
      } else if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData.message) {
        message = errorData.message;
      } else {
        // For complex validation errors, extract the first error message
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey && Array.isArray(errorData[firstErrorKey])) {
          message = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
        } else {
          message = JSON.stringify(errorData);
        }
      }
      
      throw {
        message,
        errors: errorData,
        status: response.status,
      } as ApiError & { status: number };
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      
      throw {
        message: errorData.message || errorData.detail || 'Delete failed',
        errors: errorData,
        status: response.status,
      } as ApiError & { status: number };
    }

    // For DELETE operations, the response might be empty
    // Check if there's content before trying to parse JSON
    const text = await response.text();
    if (text) {
      try {
        return JSON.parse(text);
      } catch {
        return text as any; // Return as string if not valid JSON
      }
    }
    
    return {} as T; // Return empty object if no content
  }
}

export const apiClient = new ApiClient();