import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Extend the RequestInit type to handle our custom body types
type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: any;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  pathOrUrl: string,
  options?: RequestOptions,
): Promise<T> {
  const method = options?.method || 'GET';
  
  const headers = {
    ...(options?.headers || {})
  } as Record<string, string>;

  // Add authentication token to every request if available
  const token = localStorage.getItem('token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options?.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const body = headers['Content-Type'] === 'application/json' && options?.body 
    ? JSON.stringify(options.body) 
    : options?.body;

  // Create fetch options without duplicating properties
  const { headers: _, body: __, ...restOptions } = options || {};
  const fetchOptions: RequestInit = {
    method,
    headers,
    body: body as BodyInit,
    credentials: "include",
    ...restOptions
  };
  
  const res = await fetch(pathOrUrl, fetchOptions);

  await throwIfResNotOk(res);
  
  // For HEAD or no content responses
  if (method === 'HEAD' || res.status === 204) {
    return {} as T;
  }
  
  // Try to parse as JSON, fallback to text
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  
  return res.text() as unknown as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add authentication token to headers if available
    const headers: Record<string, string> = {};
    const token = localStorage.getItem('token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
