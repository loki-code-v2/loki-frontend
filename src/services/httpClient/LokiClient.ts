import { server$ } from "@builder.io/qwik-city";

interface RequestHeaders {
  [key: string]: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestInit;
}

interface RequestOptions {
  method: string;
  url: string;
  body?: any; // Adjusting for non-GET requests
  headers?: RequestHeaders;
  isRouteProtected?: boolean;
}

class LokiAPIClient {
  private baseURL: string;
  private static instance: LokiAPIClient;

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  public static getInstance(baseURL: string = ""): LokiAPIClient {
    if (!LokiAPIClient.instance) {
      LokiAPIClient.instance = new LokiAPIClient(baseURL);
    }
    return LokiAPIClient.instance;
  }

  private async prepareRequest<T>({
    method,
    url,
    isRouteProtected = true,
    body,
    headers = {},
  }: RequestOptions): Promise<ApiResponse<T>> {
    try {
      if (isRouteProtected) {
        const getToken = server$(async function () {
          const token = this.cookie.get("__session");
          return token?.value;
        });
        const token = await getToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const fullUrl = `${this.baseURL}${url}`;
      const fetchOptions: RequestInit = {
        method,
        headers: new Headers({
          "Content-Type": "application/json",
          ...headers,
        }),
        body: method !== "GET" ? JSON.stringify(body) : null,
      };

      const response = await fetch(fullUrl, fetchOptions);

      // This is my attempt at solving the constant 401 errors.
      if (response.status === 401) {
        // Billing failures are app errors, not auth failures — don't hijack navigation.
        if (!url.includes("/stripe")) {
          // Redirect to the login page on the client side
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get("Content-Type");
      let data;
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text")) {
        data = await response.text();
      } else {
        data = await response.blob(); // For binary data like images
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: fetchOptions,
      };
    } catch (error) {
      throw new Error(`Error in request: ${error}`);
    }
  }

  public async get<T>(
    url: string,
    headers?: RequestHeaders,
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.prepareRequest<T>({
      method: "GET",
      url,
      isRouteProtected,
      headers,
    });
  }

  // POST, DELETE, PUT, PATCH methods would be similarly simplified, e.g.:
  public post<T>(
    url: string,
    body?: any,
    headers?: RequestHeaders,
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.prepareRequest<T>({
      method: "POST",
      url,
      isRouteProtected,
      body,
      headers,
    });
  }

  // Similar for DELETE, PUT, PATCH

  public delete<T>(
    url: string,
    headers?: RequestHeaders,
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.prepareRequest<T>({
      method: "DELETE",
      url,
      isRouteProtected,
      headers,
    });
  }

  public put<T>(
    url: string,
    body: any,
    headers?: RequestHeaders,
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.prepareRequest<T>({
      method: "PUT",
      url,
      isRouteProtected,
      body,
      headers,
    });
  }

  public patch<T>(
    url: string,
    body: any,
    headers?: RequestHeaders,
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    return this.prepareRequest<T>({
      method: "PATCH",
      url,
      isRouteProtected,
      body,
      headers,
    });
  }

  /**
   * Post data with a file upload.
   * @param {string} url The URL path to send the request to.
   * @param {FormData} formData The FormData object containing the file and any other form data.
   * @param {RequestHeaders} [headers] Additional headers for the request.
   * @returns {Promise<ApiResponse<T>>} The response from the server.
   */
  public async postWithFile<T>(
    url: string,
    formData: FormData,
    headers: RequestHeaders = {},
    isRouteProtected: boolean = true
  ): Promise<ApiResponse<T>> {
    if (isRouteProtected) {
      const getToken = server$(async function () {
        const token = this.cookie.get("__session");
        return token?.value;
      });
      const token = await getToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fullUrl = `${this.baseURL}${url}`;
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: new Headers(headers), // Note: Do not set Content-Type for FormData
      body: formData,
    };

    const response = await fetch(fullUrl, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Assuming the response is JSON. Adjust if your API returns something else.
    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: fetchOptions,
    };
  }
}

export const LokiClient = LokiAPIClient.getInstance(
  import.meta.env.VITE_LOKI_API_URL
);
