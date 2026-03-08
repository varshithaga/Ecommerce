import { jwtDecode } from 'jwt-decode';
import { createApiUrl } from '../../access/access.ts';

interface LoginCredentials {
  username: string;
  password: string;
  otp?: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  details?: any;
  userRole?: string;
}

const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(createApiUrl('api/login/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok && data.access) {
      if (credentials.rememberMe) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
      } else {
        // If not remember me, we use sessionStorage so it clears on tab close
        sessionStorage.setItem('access', data.access);
        sessionStorage.setItem('refresh', data.refresh);
        // Clear old localStorage if it exists so there's no conflict
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
      }

      const userRole = jwtDecode<{ role: string }>(data.access).role;

      return {
        success: true,
        data: data,
        message: 'Login successful',
        userRole: userRole,
      };
    } else {
      return {
        success: false,
        error: data.detail || data.message || 'Invalid credentials',
        details: data
      };
    }


  } catch (error: unknown) {
    console.error('Login API Error:', error);
    return {
      success: false,
      error: 'Network error occurred',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};



export default loginUser;