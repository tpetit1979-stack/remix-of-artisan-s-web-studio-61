export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_monthly: {
        Row: {
          form_submissions: number | null
          month: string
          monthly_score: number | null
          phone_clicks: number | null
          tenant_id: string
          visitors: number | null
        }
        Insert: {
          form_submissions?: number | null
          month: string
          monthly_score?: number | null
          phone_clicks?: number | null
          tenant_id: string
          visitors?: number | null
        }
        Update: {
          form_submissions?: number | null
          month?: string
          monthly_score?: number | null
          phone_clicks?: number | null
          tenant_id?: string
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_monthly_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_read: boolean | null
          message: string | null
          name: string
          phone: string | null
          service_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          name: string
          phone?: string | null
          service_id?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          name?: string
          phone?: string | null
          service_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio: {
        Row: {
          city: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          is_published: boolean | null
          service_id: string | null
          sort_order: number | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          service_id?: string | null
          sort_order?: number | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          service_id?: string | null
          sort_order?: number | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          city: string
          city_slug: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          service_id: string
          tenant_id: string
        }
        Insert: {
          city: string
          city_slug: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          service_id: string
          tenant_id: string
        }
        Update: {
          city?: string
          city_slug?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          service_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_areas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          seo_description_template: string | null
          seo_title_template: string | null
          slug: string
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          seo_description_template?: string | null
          seo_title_template?: string | null
          slug: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          seo_description_template?: string | null
          seo_title_template?: string | null
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          ai_analysis: Json | null
          booking_button_label: string | null
          booking_enabled: boolean
          booking_provider: string | null
          booking_url: string | null
          border_radius: number | null
          cta_text: string | null
          favicon_url: string | null
          font_family: string | null
          gradient_style: string | null
          header_style: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          logo_url: string | null
          opening_hours: Json | null
          primary_color: string | null
          seo_meta_description: string | null
          seo_meta_title: string | null
          social_links: Json | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          booking_button_label?: string | null
          booking_enabled?: boolean
          booking_provider?: string | null
          booking_url?: string | null
          border_radius?: number | null
          cta_text?: string | null
          favicon_url?: string | null
          font_family?: string | null
          gradient_style?: string | null
          header_style?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          primary_color?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          social_links?: Json | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          booking_button_label?: string | null
          booking_enabled?: boolean
          booking_provider?: string | null
          booking_url?: string | null
          border_radius?: number | null
          cta_text?: string | null
          favicon_url?: string | null
          font_family?: string | null
          gradient_style?: string | null
          header_style?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          logo_url?: string | null
          opening_hours?: Json | null
          primary_color?: string | null
          seo_meta_description?: string | null
          seo_meta_title?: string | null
          social_links?: Json | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          domaine: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          meta_domaine: string | null
          organisme: string | null
          qualification_code: string | null
          qualification_name: string | null
          tenant_id: string
          updated_at: string | null
          url_qualification: string | null
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          domaine?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          meta_domaine?: string | null
          organisme?: string | null
          qualification_code?: string | null
          qualification_name?: string | null
          tenant_id: string
          updated_at?: string | null
          url_qualification?: string | null
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          domaine?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          meta_domaine?: string | null
          organisme?: string | null
          qualification_code?: string | null
          qualification_name?: string | null
          tenant_id?: string
          updated_at?: string | null
          url_qualification?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_certifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_media: {
        Row: {
          alt_text: string | null
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          public_url: string
          sort_order: number | null
          source_template_media_id: string | null
          storage_path: string
          target_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          public_url: string
          sort_order?: number | null
          source_template_media_id?: string | null
          storage_path: string
          target_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          public_url?: string
          sort_order?: number | null
          source_template_media_id?: string | null
          storage_path?: string
          target_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_media_source_template_media_id_fkey"
            columns: ["source_template_media_id"]
            isOneToOne: false
            referencedRelation: "public_trade_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_media_source_template_media_id_fkey"
            columns: ["source_template_media_id"]
            isOneToOne: false
            referencedRelation: "trade_media_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_partners: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          sort_order: number
          tenant_id: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          tenant_id: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          tenant_id?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_partners_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_team_members: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          photo_url: string | null
          role_title: string
          sort_order: number
          storage_path: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role_title: string
          sort_order?: number
          storage_path?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          role_title?: string
          sort_order?: number
          storage_path?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_trade_activations: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          source: string
          tenant_id: string
          trade_template_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          source?: string
          tenant_id: string
          trade_template_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          source?: string
          tenant_id?: string
          trade_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_trade_activations_tenant_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_trade_activations_trade_fkey"
            columns: ["trade_template_id"]
            isOneToOne: false
            referencedRelation: "trade_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          created_at: string | null
          domain: string | null
          email: string | null
          google_place_id: string | null
          google_rating: number | null
          google_rating_updated_at: string | null
          google_review_count: number | null
          has_lignia: boolean | null
          id: string
          is_active: boolean | null
          lignia_activated_at: string | null
          lignia_tenant_id: string | null
          phone: string | null
          seo_boost_text: string | null
          siret: string | null
          slug: string
          tagline: string | null
          trade_template_id: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          created_at?: string | null
          domain?: string | null
          email?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_updated_at?: string | null
          google_review_count?: number | null
          has_lignia?: boolean | null
          id?: string
          is_active?: boolean | null
          lignia_activated_at?: string | null
          lignia_tenant_id?: string | null
          phone?: string | null
          seo_boost_text?: string | null
          siret?: string | null
          slug: string
          tagline?: string | null
          trade_template_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          created_at?: string | null
          domain?: string | null
          email?: string | null
          google_place_id?: string | null
          google_rating?: number | null
          google_rating_updated_at?: string | null
          google_review_count?: number | null
          has_lignia?: boolean | null
          id?: string
          is_active?: boolean | null
          lignia_activated_at?: string | null
          lignia_tenant_id?: string | null
          phone?: string | null
          seo_boost_text?: string | null
          siret?: string | null
          slug?: string
          tagline?: string | null
          trade_template_id?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_trade_template_id_fkey"
            columns: ["trade_template_id"]
            isOneToOne: false
            referencedRelation: "trade_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      trade_media_library: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_path: string
          is_active: boolean
          media_type: string
          sort_order: number
          title: string | null
          trade_template_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_path: string
          is_active?: boolean
          media_type: string
          sort_order?: number
          title?: string | null
          trade_template_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_path?: string
          is_active?: boolean
          media_type?: string
          sort_order?: number
          title?: string | null
          trade_template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_media_library_trade_template_id_fkey"
            columns: ["trade_template_id"]
            isOneToOne: false
            referencedRelation: "trade_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_service_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          name: string
          priority_score: number
          seo_description_template: string | null
          seo_intent: string | null
          seo_title_template: string | null
          slug: string
          sort_order: number | null
          trade_template_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          priority_score?: number
          seo_description_template?: string | null
          seo_intent?: string | null
          seo_title_template?: string | null
          slug: string
          sort_order?: number | null
          trade_template_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          priority_score?: number
          seo_description_template?: string | null
          seo_intent?: string | null
          seo_title_template?: string | null
          slug?: string
          sort_order?: number | null
          trade_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_service_templates_trade_template_id_fkey"
            columns: ["trade_template_id"]
            isOneToOne: false
            referencedRelation: "trade_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_templates: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          trade_category_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          trade_category_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          trade_category_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_templates_trade_category_id_fkey"
            columns: ["trade_category_id"]
            isOneToOne: false
            referencedRelation: "trade_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_trade_media: {
        Row: {
          alt_text: string | null
          id: string | null
          image_path: string | null
          media_type: string | null
          sort_order: number | null
          trade_template_id: string | null
        }
        Insert: {
          alt_text?: string | null
          id?: string | null
          image_path?: string | null
          media_type?: string | null
          sort_order?: number | null
          trade_template_id?: string | null
        }
        Update: {
          alt_text?: string | null
          id?: string | null
          image_path?: string | null
          media_type?: string | null
          sort_order?: number | null
          trade_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_media_library_trade_template_id_fkey"
            columns: ["trade_template_id"]
            isOneToOne: false
            referencedRelation: "trade_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      is_tenant_member: { Args: { _tenant_id: string }; Returns: boolean }
      seed_trade_service_template: {
        Args: {
          _description: string
          _is_featured: boolean
          _name: string
          _priority_score: number
          _seo_description_template: string
          _seo_intent: string
          _seo_title_template: string
          _slug: string
          _sort_order: number
          _trade_slug: string
        }
        Returns: undefined
      }
      set_primary_trade: {
        Args: { _tenant_id: string; _trade_template_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "tenant_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "tenant_admin"],
    },
  },
} as const
