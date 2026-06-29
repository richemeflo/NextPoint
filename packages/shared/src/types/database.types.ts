export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      availability_ranges: {
        Row: {
          coach_id: string
          created_at: string
          deleted_at: string | null
          ends_at: string
          id: string
          location: string
          recurrence_ends_on: string | null
          recurrence_type: Database["public"]["Enums"]["availability_recurrence_type"]
          slot_duration_minutes: number
          starts_at: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          deleted_at?: string | null
          ends_at: string
          id?: string
          location: string
          recurrence_ends_on?: string | null
          recurrence_type?: Database["public"]["Enums"]["availability_recurrence_type"]
          slot_duration_minutes: number
          starts_at: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          deleted_at?: string | null
          ends_at?: string
          id?: string
          location?: string
          recurrence_ends_on?: string | null
          recurrence_type?: Database["public"]["Enums"]["availability_recurrence_type"]
          slot_duration_minutes?: number
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          availability_range_id: string
          coach_id: string
          created_at: string
          deleted_at: string | null
          duration_minutes: number
          ends_at: string
          id: string
          location: string
          starts_at: string
          status: Database["public"]["Enums"]["availability_slot_status"]
          updated_at: string
        }
        Insert: {
          availability_range_id: string
          coach_id: string
          created_at?: string
          deleted_at?: string | null
          duration_minutes: number
          ends_at: string
          id?: string
          location: string
          starts_at: string
          status?: Database["public"]["Enums"]["availability_slot_status"]
          updated_at?: string
        }
        Update: {
          availability_range_id?: string
          coach_id?: string
          created_at?: string
          deleted_at?: string | null
          duration_minutes?: number
          ends_at?: string
          id?: string
          location?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["availability_slot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_availability_range_id_fkey"
            columns: ["availability_range_id"]
            isOneToOne: false
            referencedRelation: "availability_ranges"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          bio: string
          created_at: string
          display_name: string
          email: string
          phone: string
          preferred_language: Database["public"]["Enums"]["app_language"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bio: string
          created_at?: string
          display_name: string
          email: string
          phone: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string
          display_name?: string
          email?: string
          phone?: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_packs: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          included_sessions: number
          remaining_sessions: number | null
          status: Database["public"]["Enums"]["lesson_pack_status"]
          student_id: string
          updated_at: string
          used_sessions: number
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          included_sessions: number
          remaining_sessions?: number | null
          status?: Database["public"]["Enums"]["lesson_pack_status"]
          student_id: string
          updated_at?: string
          used_sessions?: number
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          included_sessions?: number
          remaining_sessions?: number | null
          status?: Database["public"]["Enums"]["lesson_pack_status"]
          student_id?: string
          updated_at?: string
          used_sessions?: number
        }
        Relationships: []
      }
      pricing_rate_students: {
        Row: {
          created_at: string
          pricing_rate_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          pricing_rate_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          pricing_rate_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rate_students_pricing_rate_id_fkey"
            columns: ["pricing_rate_id"]
            isOneToOne: false
            referencedRelation: "pricing_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rates: {
        Row: {
          amount_cents: number
          applicability_contexts: string[]
          coach_id: string
          created_at: string
          currency: string
          deleted_at: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          label: string
          lesson_type: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          applicability_contexts?: string[]
          coach_id: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          label: string
          lesson_type: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          applicability_contexts?: string[]
          coach_id?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          label?: string
          lesson_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_activation_tokens: {
        Row: {
          consumed_at: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          revoked_at: string | null
          student_id: string
          token_hash: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          revoked_at?: string | null
          student_id: string
          token_hash: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          revoked_at?: string | null
          student_id?: string
          token_hash?: string
        }
        Relationships: []
      }
      student_coach_relationships: {
        Row: {
          association_method: string
          coach_id: string
          created_at: string
          id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          association_method?: string
          coach_id: string
          created_at?: string
          id?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          association_method?: string
          coach_id?: string
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_history_events: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          event_type: Database["public"]["Enums"]["student_history_event_type"]
          id: string
          occurred_at: string
          source_id: string | null
          status: Database["public"]["Enums"]["student_history_event_status"]
          student_id: string
          title: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          event_type: Database["public"]["Enums"]["student_history_event_type"]
          id?: string
          occurred_at: string
          source_id?: string | null
          status: Database["public"]["Enums"]["student_history_event_status"]
          student_id: string
          title: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["student_history_event_type"]
          id?: string
          occurred_at?: string
          source_id?: string | null
          status?: Database["public"]["Enums"]["student_history_event_status"]
          student_id?: string
          title?: string
        }
        Relationships: []
      }
      student_private_notes: {
        Row: {
          coach_id: string
          content: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          content: string
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["student_account_status"]
          age: number
          created_at: string
          email: string
          full_name: string
          padel_level: number
          phone: string
          preferred_language: Database["public"]["Enums"]["app_language"]
          sex: Database["public"]["Enums"]["student_sex"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["student_account_status"]
          age: number
          created_at?: string
          email: string
          full_name: string
          padel_level: number
          phone: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          sex?: Database["public"]["Enums"]["student_sex"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["student_account_status"]
          age?: number
          created_at?: string
          email?: string
          full_name?: string
          padel_level?: number
          phone?: string
          preferred_language?: Database["public"]["Enums"]["app_language"]
          sex?: Database["public"]["Enums"]["student_sex"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_lesson_pack: {
        Args: { p_included_sessions: number; p_student_id: string }
        Returns: {
          coach_id: string
          created_at: string
          id: string
          included_sessions: number
          remaining_sessions: number | null
          status: Database["public"]["Enums"]["lesson_pack_status"]
          student_id: string
          updated_at: string
          used_sessions: number
        }
        SetofOptions: {
          from: "*"
          to: "lesson_packs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_student_to_single_coach: {
        Args: { student_user_id: string }
        Returns: undefined
      }
      claim_student_activation_token: {
        Args: { p_token_hash: string }
        Returns: {
          consumed_at: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          revoked_at: string | null
          student_id: string
          token_hash: string
        }
        SetofOptions: {
          from: "*"
          to: "student_activation_tokens"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_manual_student_provisioning: {
        Args: {
          p_age: number
          p_coach_id: string
          p_email: string
          p_full_name: string
          p_padel_level: number
          p_phone: string
          p_sex: Database["public"]["Enums"]["student_sex"]
          p_student_id: string
        }
        Returns: {
          account_status: Database["public"]["Enums"]["student_account_status"]
          age: number
          created_at: string
          email: string
          full_name: string
          padel_level: number
          phone: string
          preferred_language: Database["public"]["Enums"]["app_language"]
          sex: Database["public"]["Enums"]["student_sex"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "student_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      consume_lesson_pack_session: {
        Args: { p_pack_id: string }
        Returns: {
          coach_id: string
          created_at: string
          id: string
          included_sessions: number
          remaining_sessions: number | null
          status: Database["public"]["Enums"]["lesson_pack_status"]
          student_id: string
          updated_at: string
          used_sessions: number
        }
        SetofOptions: {
          from: "*"
          to: "lesson_packs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_availability_range: {
        Args: {
          p_ends_at: string
          p_location: string
          p_recurrence_ends_on: string
          p_recurrence_type: Database["public"]["Enums"]["availability_recurrence_type"]
          p_slot_duration_minutes: number
          p_starts_at: string
        }
        Returns: {
          coach_id: string
          created_at: string
          deleted_at: string | null
          ends_at: string
          id: string
          location: string
          recurrence_ends_on: string | null
          recurrence_type: Database["public"]["Enums"]["availability_recurrence_type"]
          slot_duration_minutes: number
          starts_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "availability_ranges"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_student_activation_token: {
        Args: {
          p_coach_id: string
          p_expires_at: string
          p_student_id: string
          p_token_hash: string
        }
        Returns: {
          consumed_at: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          revoked_at: string | null
          student_id: string
          token_hash: string
        }
        SetofOptions: {
          from: "*"
          to: "student_activation_tokens"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_pricing_rate: { Args: { p_rate_id: string }; Returns: undefined }
      finalize_student_activation: {
        Args: { p_student_id: string; p_token_id: string }
        Returns: undefined
      }
      normalize_student_email: { Args: { value: string }; Returns: string }
      normalize_student_phone: { Args: { value: string }; Returns: string }
      rollback_student_activation_claim: {
        Args: { p_token_id: string }
        Returns: undefined
      }
      save_pricing_rate: {
        Args: {
          p_amount_cents: number
          p_applicability_contexts: string[]
          p_currency: string
          p_duration_minutes: number
          p_is_active: boolean
          p_label: string
          p_lesson_type: string
          p_rate_id: string
          p_target_student_ids: string[]
        }
        Returns: {
          amount_cents: number
          applicability_contexts: string[]
          coach_id: string
          created_at: string
          currency: string
          deleted_at: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          label: string
          lesson_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "pricing_rates"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_student_private_note: {
        Args: { p_content: string; p_student_id: string }
        Returns: {
          coach_id: string
          content: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "student_private_notes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_language: "fr" | "en" | "es"
      app_role: "coach" | "eleve"
      availability_recurrence_type: "none" | "daily" | "weekly"
      availability_slot_status: "available" | "booked" | "cancelled"
      lesson_pack_status: "active" | "exhausted"
      student_account_status:
        | "pending_activation"
        | "active"
        | "suspended"
        | "deleted"
      student_history_event_status:
        | "pending"
        | "confirmed"
        | "refused"
        | "expired"
        | "cancelled"
        | "modified"
        | "active"
        | "exhausted"
      student_history_event_type:
        | "booking_requested"
        | "lesson_confirmed"
        | "booking_cancelled"
        | "booking_modified"
        | "lesson_pack_assigned"
        | "lesson_pack_consumed"
      student_sex: "female" | "male" | "other" | "not_specified"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_language: ["fr", "en", "es"],
      app_role: ["coach", "eleve"],
      availability_recurrence_type: ["none", "daily", "weekly"],
      availability_slot_status: ["available", "booked", "cancelled"],
      lesson_pack_status: ["active", "exhausted"],
      student_account_status: [
        "pending_activation",
        "active",
        "suspended",
        "deleted",
      ],
      student_history_event_status: [
        "pending",
        "confirmed",
        "refused",
        "expired",
        "cancelled",
        "modified",
        "active",
        "exhausted",
      ],
      student_history_event_type: [
        "booking_requested",
        "lesson_confirmed",
        "booking_cancelled",
        "booking_modified",
        "lesson_pack_assigned",
        "lesson_pack_consumed",
      ],
      student_sex: ["female", "male", "other", "not_specified"],
    },
  },
} as const

