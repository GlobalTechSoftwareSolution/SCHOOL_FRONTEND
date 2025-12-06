/**
 * Authentication utility functions
 */

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for tokens in localStorage
  const accessToken = localStorage.getItem('accessToken');
  const authToken = localStorage.getItem('authToken');
  
  // Check for cookies
  const cookieToken = getCookie('token');
  
  const isAuthenticated = !!(accessToken || authToken || cookieToken);
  console.log('[AUTH UTIL] isAuthenticated check:', isAuthenticated);
  return isAuthenticated;
}

// Get user role from token or localStorage
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get role from localStorage
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      if (parsed.role) {
        console.log('[AUTH UTIL] Role from userInfo:', parsed.role);
        return parsed.role;
      }
    } catch (e) {
      // Failed to parse userInfo
      console.log('[AUTH UTIL] Error parsing userInfo:', e);
    }
  }
  
  // Try to get role from token
  const token = localStorage.getItem('accessToken') || 
                localStorage.getItem('authToken') || 
                getCookie('token');
  
  if (token) {
    const role = parseJwtRole(token);
    console.log('[AUTH UTIL] Role from token:', role);
    if (role) {
      return role;
    }
  }
  
  console.log('[AUTH UTIL] No role found');
  return null;
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper function to parse role from JWT token
function parseJwtRole(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const parsed = JSON.parse(jsonPayload);
    console.log('[AUTH UTIL] Parsed JWT payload:', parsed);
    return parsed.role || null;
  } catch (e) {
    console.log('[AUTH UTIL] Error parsing JWT:', e);
    return null;
  }
}

// Redirect to login page
export function redirectToLogin(callbackUrl?: string): void {
  if (typeof window === 'undefined') return;
  
  const loginPath = callbackUrl 
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login';
    
  console.log('[AUTH UTIL] Redirecting to login:', loginPath);
  window.location.href = loginPath;
}