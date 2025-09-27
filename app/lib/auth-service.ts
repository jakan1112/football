// lib/auth-service.ts
import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_login: string | null;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<AdminUser | null> {
  try {
    console.log('Verifying admin credentials for:', email);
    
    // Get admin user from database
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    if (!admin) {
      console.error('Admin not found:', email);
      return null;
    }

    console.log('Found admin:', admin.email);
    console.log('Stored password:', admin.password);
    console.log('Provided password:', password);

    // Simple password comparison (for now)
    const isValidPassword = admin.password === password;
    
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.error('Invalid password for admin:', email);
      return null;
    }

    // Update last login time
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    return {
      id: admin.id,
      email: admin.email,
      created_at: admin.created_at,
      last_login: admin.last_login
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

export async function createAdminUser(email: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .insert([{ email, password }]);

    return !error;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

// Session management (keep the same)
export function setAdminSession(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
  }
}

export function getAdminSession(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('admin_token_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    
    clearAdminSession();
  }
  return null;
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
  }
}

export function generateAdminToken(adminId: string): string {
  return btoa(JSON.stringify({
    adminId,
    timestamp: Date.now(),
    expiry: Date.now() + 24 * 60 * 60 * 1000
  }));
}

export function verifyAdminToken(token: string): string | null {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.expiry > Date.now()) {
      return decoded.adminId;
    }
  } catch (error) {
    console.error('Error verifying admin token:', error);
  }
  return null;
}

// Add this to auth-service.ts
export async function testAdminConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    console.log('Admin connection test:', { data, error });
    return !error;
  } catch (error) {
    console.error('Admin connection test failed:', error);
    return false;
  }
}