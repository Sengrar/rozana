/**
 * Database types, written by hand from supabase/migrations/ (0001, 0002)
 * in the same shape that `supabase gen types typescript` produces.
 * Keep in sync with the migrations. Replace with generated output once the
 * Supabase CLI is set up for this project.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type MemberRole = "merchant_admin" | "merchant_staff" | "delivery" | "customer";
type SubscriptionStatus =
  "trialing" | "active" | "past_due" | "paused" | "cancelled";
type CouponKind = "percent_off" | "amount_off" | "extra_trial_days";

export type Database = {
  public: {
    Tables: {
      coupon_redemptions: {
        Row: {
          coupon_id: string;
          id: string;
          redeemed_at: string;
          tenant_id: string;
        };
        Insert: {
          coupon_id: string;
          id?: string;
          redeemed_at?: string;
          tenant_id: string;
        };
        Update: {
          coupon_id?: string;
          id?: string;
          redeemed_at?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coupon_redemptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          is_active: boolean;
          kind: CouponKind;
          max_redemptions: number | null;
          plan_id: string | null;
          redeemed_count: number;
          valid_from: string;
          valid_until: string | null;
          value: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind: CouponKind;
          max_redemptions?: number | null;
          plan_id?: string | null;
          redeemed_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          value: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          kind?: CouponKind;
          max_redemptions?: number | null;
          plan_id?: string | null;
          redeemed_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "coupons_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      memberships: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          role: MemberRole;
          tenant_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role: MemberRole;
          tenant_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          role?: MemberRole;
          tenant_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          code: string;
          created_at: string;
          features: Json;
          id: string;
          is_public: boolean;
          limits: Json;
          name: string;
          price_month_paise: number;
          price_year_paise: number;
          sort_order: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          features?: Json;
          id?: string;
          is_public?: boolean;
          limits?: Json;
          name: string;
          price_month_paise: number;
          price_year_paise: number;
          sort_order?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          features?: Json;
          id?: string;
          is_public?: boolean;
          limits?: Json;
          name?: string;
          price_month_paise?: number;
          price_year_paise?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: { created_at: string; user_id: string };
        Insert: { created_at?: string; user_id: string };
        Update: { created_at?: string; user_id?: string };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_cycle: string;
          coupon_id: string | null;
          created_at: string;
          current_period_end: string | null;
          id: string;
          notes: string | null;
          plan_id: string;
          status: SubscriptionStatus;
          tenant_id: string;
          trial_ends_at: string | null;
          updated_at: string;
        };
        Insert: {
          billing_cycle?: string;
          coupon_id?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          notes?: string | null;
          plan_id: string;
          status?: SubscriptionStatus;
          tenant_id: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          billing_cycle?: string;
          coupon_id?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          notes?: string | null;
          plan_id?: string;
          status?: SubscriptionStatus;
          tenant_id?: string;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: true;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          business_type: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          phone: string | null;
          settings: Json;
          slug: string;
          theme: Json;
        };
        Insert: {
          business_type?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          phone?: string | null;
          settings?: Json;
          slug: string;
          theme?: Json;
        };
        Update: {
          business_type?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          phone?: string | null;
          settings?: Json;
          slug?: string;
          theme?: Json;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      admin_list_members: {
        Args: { p_tenant: string };
        Returns: {
          membership_id: string;
          user_id: string;
          email: string;
          role: MemberRole;
          is_active: boolean;
          created_at: string;
        }[];
      };
      admin_set_member: {
        Args: { p_tenant: string; p_email: string; p_role: MemberRole };
        Returns: string;
      };
      admin_create_tenant: {
        Args: {
          p_slug: string;
          p_name: string;
          p_plan_code?: string;
          p_trial_days?: number;
        };
        Returns: string;
      };
      has_tenant_role: {
        Args: { p_tenant: string; p_roles: MemberRole[] };
        Returns: boolean;
      };
      is_platform_admin: { Args: never; Returns: boolean };
      is_tenant_member: { Args: { p_tenant: string }; Returns: boolean };
      tenant_by_slug: {
        Args: { p_slug: string };
        Returns: { id: string; slug: string; name: string; theme: Json }[];
      };
    };
    Enums: {
      coupon_kind: CouponKind;
      member_role: MemberRole;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
