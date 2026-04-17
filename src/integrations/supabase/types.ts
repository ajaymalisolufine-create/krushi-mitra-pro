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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_enabled: boolean
          redirect_target: string | null
          redirect_type: string
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_enabled?: boolean
          redirect_target?: string | null
          redirect_type?: string
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_enabled?: boolean
          redirect_target?: string | null
          redirect_type?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      dealers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          pincode: string | null
          serving_pincodes: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          pincode?: string | null
          serving_pincodes?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          pincode?: string | null
          serving_pincodes?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      farmer_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          email: string | null
          id: string
          phone: string | null
          screen_name: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          screen_name?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          screen_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_logs: {
        Row: {
          created_at: string | null
          failed_records: number | null
          file_name: string
          id: string
          status: string | null
          successful_records: number | null
          total_records: number | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          failed_records?: number | null
          file_name: string
          id?: string
          status?: string | null
          successful_records?: number | null
          total_records?: number | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          failed_records?: number | null
          file_name?: string
          id?: string
          status?: string | null
          successful_records?: number | null
          total_records?: number | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          language: string | null
          phone: string | null
          screen_name: string
          selected_crop: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          language?: string | null
          phone?: string | null
          screen_name: string
          selected_crop?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          language?: string | null
          phone?: string | null
          screen_name?: string
          selected_crop?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          external_url: string | null
          id: string
          image_url: string | null
          published_at: string
          source: string | null
          status: string
          title: string
          translations: Json | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string | null
          status?: string
          title: string
          translations?: Json | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          source?: string | null
          status?: string
          title?: string
          translations?: Json | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          message: string
          popup_enabled: boolean | null
          push_enabled: boolean | null
          redirect_target: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_type: string | null
          target_value: string | null
          title: string
          translations: Json | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          popup_enabled?: boolean | null
          push_enabled?: boolean | null
          redirect_target?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string | null
          target_value?: string | null
          title: string
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          popup_enabled?: boolean | null
          push_enabled?: boolean | null
          redirect_target?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_type?: string | null
          target_value?: string | null
          title?: string
          translations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          created_at: string
          email: string | null
          expires_at: string
          id: string
          otp_code: string
          phone: string | null
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          otp_code: string
          phone?: string | null
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      product_enquiries: {
        Row: {
          city: string | null
          created_at: string
          district: string | null
          id: string
          language: string | null
          name: string | null
          notes: string | null
          phone: string | null
          pincode: string | null
          product_id: string | null
          product_name: string
          selected_crops: string[] | null
          source_id: string | null
          source_title: string | null
          source_type: string
          state: string | null
          status: string
          user_id: string | null
          village: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          product_id?: string | null
          product_name: string
          selected_crops?: string[] | null
          source_id?: string | null
          source_title?: string | null
          source_type?: string
          state?: string | null
          status?: string
          user_id?: string | null
          village?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          district?: string | null
          id?: string
          language?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          pincode?: string | null
          product_id?: string | null
          product_name?: string
          selected_crops?: string[] | null
          source_id?: string | null
          source_title?: string | null
          source_type?: string
          state?: string | null
          status?: string
          user_id?: string | null
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_import_temp: {
        Row: {
          available_states: string | null
          batch_id: string
          benefits: string | null
          best_seller: boolean | null
          category: string | null
          created_at: string | null
          description_en: string | null
          description_hi: string | null
          description_mr: string | null
          dosage: string | null
          error_message: string | null
          id: string
          import_status: string | null
          mrp: number | null
          product_image: string | null
          product_name: string
          recommended_crops: string | null
          status: string | null
          tagline: string | null
          trending_product: boolean | null
        }
        Insert: {
          available_states?: string | null
          batch_id: string
          benefits?: string | null
          best_seller?: boolean | null
          category?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          dosage?: string | null
          error_message?: string | null
          id?: string
          import_status?: string | null
          mrp?: number | null
          product_image?: string | null
          product_name: string
          recommended_crops?: string | null
          status?: string | null
          tagline?: string | null
          trending_product?: boolean | null
        }
        Update: {
          available_states?: string | null
          batch_id?: string
          benefits?: string | null
          best_seller?: boolean | null
          category?: string | null
          created_at?: string | null
          description_en?: string | null
          description_hi?: string | null
          description_mr?: string | null
          dosage?: string | null
          error_message?: string | null
          id?: string
          import_status?: string | null
          mrp?: number | null
          product_image?: string | null
          product_name?: string
          recommended_crops?: string | null
          status?: string | null
          tagline?: string | null
          trending_product?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available_states: string[] | null
          benefits: string[] | null
          category: string
          created_at: string
          crops: string[] | null
          description: string | null
          dosage: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_best_seller: boolean
          is_trending: boolean
          mrp: number
          name: string
          status: string
          tagline: string | null
          translations: Json | null
          updated_at: string
        }
        Insert: {
          available_states?: string[] | null
          benefits?: string[] | null
          category?: string
          created_at?: string
          crops?: string[] | null
          description?: string | null
          dosage?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_best_seller?: boolean
          is_trending?: boolean
          mrp?: number
          name: string
          status?: string
          tagline?: string | null
          translations?: Json | null
          updated_at?: string
        }
        Update: {
          available_states?: string[] | null
          benefits?: string[] | null
          category?: string
          created_at?: string
          crops?: string[] | null
          description?: string | null
          dosage?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_best_seller?: boolean
          is_trending?: boolean
          mrp?: number
          name?: string
          status?: string
          tagline?: string | null
          translations?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discount: string | null
          external_url: string | null
          id: string
          image_url: string | null
          status: string
          title: string
          translations: Json | null
          updated_at: string
          valid_from: string
          valid_until: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          status?: string
          title: string
          translations?: Json | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          status?: string
          title?: string
          translations?: Json | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          city: string | null
          created_at: string
          district: string | null
          email: string | null
          first_install_at: string | null
          id: string
          language: string
          last_active_at: string | null
          name: string | null
          phone: string | null
          pincode: string | null
          selected_crop: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          first_install_at?: string | null
          id?: string
          language?: string
          last_active_at?: string | null
          name?: string | null
          phone?: string | null
          pincode?: string | null
          selected_crop?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          first_install_at?: string | null
          id?: string
          language?: string
          last_active_at?: string | null
          name?: string | null
          phone?: string | null
          pincode?: string | null
          selected_crop?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      videos: {
        Row: {
          category: string | null
          created_at: string
          crop: string | null
          duration: string | null
          id: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
          views: number | null
          youtube_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          crop?: string | null
          duration?: string | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          views?: number | null
          youtube_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          crop?: string | null
          duration?: string | null
          id?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          views?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
