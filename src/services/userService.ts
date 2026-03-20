import { supabase } from './supabaseClient';

export type UserRole = 'super_admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  subscription_period: number; // in months: 1, 3, 6, 9, 12
  subscription_end: string | null;
  created_at: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile]);

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all profiles:', error);
    return [];
  }
  return data || [];
};
