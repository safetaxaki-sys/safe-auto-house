export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "driver";
export type DriverStatus = "active" | "frozen" | "fired";
export type VehicleKind = "fuel" | "electric" | "hybrid" | "gas";
export type PostAudience = "home" | "personal";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          tax_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email: string;
          tax_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      drivers: {
        Row: {
          id: string;
          user_id: string | null;
          admin_id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string;
          age: number | null;
          plate: string;
          status: DriverStatus;
          vehicle_type: VehicleKind;
          photo_url: string | null;
          identity_number: string;
          license_number: string;
          special_license: string;
          tax_number: string;
          freenow_email: string;
          bolt_email: string;
          uber_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          admin_id: string;
          first_name: string;
          last_name: string;
          phone?: string;
          email?: string;
          age?: number | null;
          plate?: string;
          status?: DriverStatus;
          vehicle_type?: VehicleKind;
          photo_url?: string | null;
          identity_number?: string;
          license_number?: string;
          special_license?: string;
          tax_number?: string;
          freenow_email?: string;
          bolt_email?: string;
          uber_email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["drivers"]["Insert"]>;
      };
      driver_days: {
        Row: {
          id: string;
          driver_id: string;
          work_date: string;
          week_start: string;
          freenow: number;
          bolt: number;
          uber: number;
          street: number;
          z_report: number;
          fuel_cost: number;
          electric_km: number;
          saved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          work_date: string;
          week_start: string;
          freenow?: number;
          bolt?: number;
          uber?: number;
          street?: number;
          z_report?: number;
          fuel_cost?: number;
          electric_km?: number;
          saved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["driver_days"]["Insert"]>;
      };
      announcements: {
        Row: {
          id: string;
          admin_id: string;
          driver_id: string | null;
          audience: PostAudience;
          message: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          driver_id?: string | null;
          audience?: PostAudience;
          message: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      driver_status: DriverStatus;
      vehicle_kind: VehicleKind;
      post_audience: PostAudience;
    };
    CompositeTypes: Record<string, never>;
  };
};
