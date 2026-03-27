/**
 * Authentication Service
 * Xử lý đăng nhập, đăng ký, đăng xuất — theo đúng Swagger API Backend
 *
 * Backend: http://160.250.186.97:3000/api-docs
 */

import axiosClient from '@/api/axiosClient';
import { AUTH_ENDPOINTS } from '@/api/endpoints';
import { AUTH_CONFIG } from '@/config';

// ============================================
// Types — theo đúng schema backend
// ============================================

export interface LoginCredentials {
    email: string;
    password: string;
    clientInfo?: {
        deviceId?: string;
        deviceName?: string;
        userAgent?: string;
    };
}

export interface LoginPhoneCredentials {
    phone: string;
    password: string;
    clientInfo?: {
        deviceId?: string;
        deviceName?: string;
    };
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface RegisterPhoneData {
    name: string;
    phone: string;
    password: string;
}

// Backend trả về: { success, data: { access_token, refresh_token, account_id, role } }
export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        access_token: string;
        refresh_token: string;
        account_id: string;
        role: string;
    };
}

// ============================================
// Đăng nhập bằng Email
// ============================================
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        // Backend yêu cầu device_id (not-null constraint trên user_sessions)
        const deviceId = credentials.clientInfo?.deviceId
            || `web_${navigator?.userAgent?.slice(0, 32).replace(/\s/g, '_') || 'browser'}_${Date.now()}`;
        const response = await axiosClient.post(AUTH_ENDPOINTS.LOGIN_EMAIL, {
            email: credentials.email,
            password: credentials.password,
            device_id: deviceId,
            device_name: credentials.clientInfo?.deviceName || 'Web Browser',
            user_agent: credentials.clientInfo?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        });

        if (response.data.success && response.data.data) {
            const { access_token, refresh_token, account_id, role } = response.data.data;

            localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, access_token);
            localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify({
                id: account_id,
                email: credentials.email,
                fullName: credentials.email.split('@')[0], // Backend chưa trả fullName
                role: role.toLowerCase(),
            }));
        }

        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng nhập thất bại',
        };
    }
};

// ============================================
// Đăng nhập bằng SĐT
// ============================================
export const loginByPhone = async (credentials: LoginPhoneCredentials): Promise<AuthResponse> => {
    try {
        const deviceId = credentials.clientInfo?.deviceId
            || `web_${navigator?.userAgent?.slice(0, 32).replace(/\s/g, '_') || 'browser'}_${Date.now()}`;
        const response = await axiosClient.post(AUTH_ENDPOINTS.LOGIN_PHONE, {
            phone: credentials.phone,
            password: credentials.password,
            device_id: deviceId,
            device_name: credentials.clientInfo?.deviceName || 'Web Browser',
        });

        if (response.data.success && response.data.data) {
            const { access_token, refresh_token, account_id, role } = response.data.data;

            localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, access_token);
            localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refresh_token);
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify({
                id: account_id,
                phone: credentials.phone,
                fullName: credentials.phone,
                role: role.toLowerCase(),
            }));
        }

        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng nhập thất bại',
        };
    }
};

// ============================================
// Đăng ký bằng Email
// ============================================
export const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.REGISTER_EMAIL, {
            email: data.email,
            password: data.password,
            name: data.name,
        });
        return { success: true, message: response.data?.message || 'Đăng ký thành công' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng ký thất bại',
        };
    }
};

// ============================================
// Đăng ký bằng SĐT
// ============================================
export const registerByPhone = async (data: RegisterPhoneData): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.REGISTER_PHONE, {
            phone: data.phone,
            password: data.password,
            name: data.name,
        });
        return { success: true, message: response.data?.message || 'Đăng ký thành công' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đăng ký thất bại',
        };
    }
};

// ============================================
// Đăng xuất
// ============================================
export const logout = async (): Promise<void> => {
    try {
        const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        if (refreshToken) {
            await axiosClient.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
        }
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
    } finally {
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }
};

// ============================================
// Xác thực Email (OTP)
// ============================================
export const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { email, code });
        return { success: true, message: response.data?.message || 'Xác thực thành công' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Mã xác thực không đúng hoặc hết hạn',
        };
    }
};

// ============================================
// Quên mật khẩu
// ============================================
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
        return { success: true, message: response.data?.message || 'Email đặt lại mật khẩu đã được gửi' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gửi email thất bại',
        };
    }
};

// ============================================
// Đặt lại mật khẩu
// ============================================
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
        return { success: true, message: response.data?.message || 'Đặt lại mật khẩu thành công' };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đặt lại mật khẩu thất bại',
        };
    }
};

// ============================================
// Mở khóa tài khoản
// ============================================
export const unlockAccount = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await axiosClient.post(AUTH_ENDPOINTS.UNLOCK_ACCOUNT, { email });
        return { success: true, message: response.data?.message };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Mở khóa thất bại',
        };
    }
};

// ============================================
// Session Management
// ============================================
export const getSessions = async () => {
    try {
        const response = await axiosClient.get(AUTH_ENDPOINTS.SESSIONS);
        return response.data;
    } catch (error: any) {
        return { success: false, sessions: [] };
    }
};

export const logoutOtherSessions = async () => {
    try {
        await axiosClient.delete(AUTH_ENDPOINTS.SESSIONS_DELETE_OTHER);
        return { success: true };
    } catch (error: any) {
        return { success: false };
    }
};

// Backward compatibility
export const logoutAllSessions = logoutOtherSessions;

export const deleteSession = async (sessionId: string) => {
    try {
        await axiosClient.delete(AUTH_ENDPOINTS.SESSION_DELETE(sessionId));
        return { success: true };
    } catch (error: any) {
        return { success: false };
    }
};

// ============================================
// 1.3.7 User Context — lấy role/menu/quyền
// ============================================

/** GET /api/auth/me/roles — Lấy danh sách vai trò của user đang đăng nhập */
export const getMyRoles = async (): Promise<any> => {
    try {
        const response = await axiosClient.get(AUTH_ENDPOINTS.ME_ROLES);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy vai trò thất bại');
    }
};

/** GET /api/auth/me/menus — Lấy danh sách menu hiển thị của user đang đăng nhập */
export const getMyMenus = async (): Promise<any> => {
    try {
        const response = await axiosClient.get(AUTH_ENDPOINTS.ME_MENUS);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy menu thất bại');
    }
};

/** GET /api/auth/me/permissions — Lấy danh sách quyền thao tác của user đang đăng nhập */
export const getMyPermissions = async (): Promise<any> => {
    try {
        const response = await axiosClient.get(AUTH_ENDPOINTS.ME_PERMISSIONS);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Lấy quyền thất bại');
    }
};

// ============================================
// Helpers
// ============================================
export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    return !!token;
};
