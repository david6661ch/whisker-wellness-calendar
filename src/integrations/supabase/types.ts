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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      care_events: {
        Row: {
          created_at: string
          date: string
          details: Json
          id: string
          kind: string
          pet_id: string | null
          points: number
          source_key: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          details?: Json
          id?: string
          kind: string
          pet_id?: string | null
          points: number
          source_key: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          details?: Json
          id?: string
          kind?: string
          pet_id?: string | null
          points?: number
          source_key?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          address: string
          created_at: string
          emergency: boolean
          favorite: boolean
          id: string
          name: string
          notes: string
          pet_id: string | null
          phone: string
          relationship: string
          user_id: string
        }
        Insert: {
          address?: string
          created_at?: string
          emergency?: boolean
          favorite?: boolean
          id?: string
          name: string
          notes?: string
          pet_id?: string | null
          phone: string
          relationship: string
          user_id?: string
        }
        Update: {
          address?: string
          created_at?: string
          emergency?: boolean
          favorite?: boolean
          id?: string
          name?: string
          notes?: string
          pet_id?: string | null
          phone?: string
          relationship?: string
          user_id?: string
        }
        Relationships: []
      }
      memorial_pets: {
        Row: {
          before_signup: boolean
          bio: string
          birth_date: string | null
          breed: string
          created_at: string
          death_date: string
          dedication: string
          id: string
          linked_pet_id: string | null
          memories_text: string
          name: string
          photo_path: string | null
          species: string
          user_id: string
        }
        Insert: {
          before_signup?: boolean
          bio?: string
          birth_date?: string | null
          breed?: string
          created_at?: string
          death_date: string
          dedication?: string
          id?: string
          linked_pet_id?: string | null
          memories_text?: string
          name: string
          photo_path?: string | null
          species: string
          user_id?: string
        }
        Update: {
          before_signup?: boolean
          bio?: string
          birth_date?: string | null
          breed?: string
          created_at?: string
          death_date?: string
          dedication?: string
          id?: string
          linked_pet_id?: string | null
          memories_text?: string
          name?: string
          photo_path?: string | null
          species?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_albums: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_items: {
        Row: {
          album_id: string | null
          created_at: string
          description: string
          favorite: boolean
          id: string
          media_path: string
          media_type: string
          memory_date: string
          pet_ids: string[]
          title: string
          user_id: string
        }
        Insert: {
          album_id?: string | null
          created_at?: string
          description?: string
          favorite?: boolean
          id?: string
          media_path: string
          media_type?: string
          memory_date: string
          pet_ids?: string[]
          title: string
          user_id?: string
        }
        Update: {
          album_id?: string | null
          created_at?: string
          description?: string
          favorite?: boolean
          id?: string
          media_path?: string
          media_type?: string
          memory_date?: string
          pet_ids?: string[]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "memory_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          notes: string
          pet_id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          notes?: string
          pet_id: string
          user_id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: []
      }
      visited_places: {
        Row: {
          address: string
          category: string
          created_at: string
          description: string
          good_treatment: boolean | null
          id: string
          lat: number
          lng: number
          name: string
          pet_friendly: boolean | null
          pet_ids: string[]
          photo_path: string | null
          rating: number | null
          recommended: boolean | null
          review: string
          user_id: string
          visit_date: string
          water_available: boolean | null
        }
        Insert: {
          address?: string
          category?: string
          created_at?: string
          description?: string
          good_treatment?: boolean | null
          id?: string
          lat: number
          lng: number
          name: string
          pet_friendly?: boolean | null
          pet_ids?: string[]
          photo_path?: string | null
          rating?: number | null
          recommended?: boolean | null
          review?: string
          user_id?: string
          visit_date: string
          water_available?: boolean | null
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          description?: string
          good_treatment?: boolean | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          pet_friendly?: boolean | null
          pet_ids?: string[]
          photo_path?: string | null
          rating?: number | null
          recommended?: boolean | null
          review?: string
          user_id?: string
          visit_date?: string
          water_available?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_care_event: {
        Args: {
          p_daily_points: number
          p_daily_sources: string[]
          p_date: string
          p_details: Json
          p_kind: string
          p_pet: string
          p_points: number
          p_source: string
          p_title: string
          p_user: string
          p_weekly_points: number
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
