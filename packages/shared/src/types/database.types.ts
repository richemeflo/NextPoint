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
      booking_participants: {
        Row: {
          booking_id: string
          created_at: string
          student_id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          student_id: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          availability_slot_id?: string | null
          cancelled_at?: string | null
          coach_id: string
          coach_refusal_comment?: string | null
          created_at?: string
          decided_at?: string | null
          duration_minutes: number
          ends_at: string
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          lesson_type: string
          location: string
          modified_at?: string | null
          origin?: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_comment?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          availability_slot_id?: string | null
          cancelled_at?: string | null
          coach_id?: string
          coach_refusal_comment?: string | null
          created_at?: string
          decided_at?: string | null
          duration_minutes?: number
          ends_at?: string
          expired_at?: string | null
          expires_at?: string | null
          id?: string
          lesson_type?: string
          location?: string
          modified_at?: string | null
          origin?: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          student_comment?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pricing_rate_id_fkey"
            columns: ["pricing_rate_id"]
            isOneToOne: false
            referencedRelation: "pricing_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_message_threads: {
        Row: {
          booking_id: string
          coach_id: string
          coach_read_at: string | null
          created_at: string
          id: string
          last_message_at: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          coach_id: string
          coach_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          coach_id?: string
          coach_read_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_message_threads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "coach_message_threads"
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
      notification_push_delivery_attempts: {
        Row: {
          created_at: string
          error_code: string | null
          id: string
          notification_id: string
          provider: Database["public"]["Enums"]["push_provider"] | null
          push_token_id: string | null
          recipient_id: string
          status: Database["public"]["Enums"]["push_delivery_status"]
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          id?: string
          notification_id: string
          provider?: Database["public"]["Enums"]["push_provider"] | null
          push_token_id?: string | null
          recipient_id: string
          status: Database["public"]["Enums"]["push_delivery_status"]
        }
        Update: {
          created_at?: string
          error_code?: string | null
          id?: string
          notification_id?: string
          provider?: Database["public"]["Enums"]["push_provider"] | null
          push_token_id?: string | null
          recipient_id?: string
          status?: Database["public"]["Enums"]["push_delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_push_delivery_attempts_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_push_delivery_attempts_push_token_id_fkey"
            columns: ["push_token_id"]
            isOneToOne: false
            referencedRelation: "notification_push_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_push_preferences: {
        Row: {
          created_at: string
          permission_status: Database["public"]["Enums"]["push_permission_status"]
          provider: Database["public"]["Enums"]["push_provider"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          permission_status?: Database["public"]["Enums"]["push_permission_status"]
          provider?: Database["public"]["Enums"]["push_provider"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          permission_status?: Database["public"]["Enums"]["push_permission_status"]
          provider?: Database["public"]["Enums"]["push_provider"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_push_tokens: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          last_seen_at: string
          provider: Database["public"]["Enums"]["push_provider"]
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          provider: Database["public"]["Enums"]["push_provider"]
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string
          provider?: Database["public"]["Enums"]["push_provider"]
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          booking_id: string | null
          created_at: string
          id: string
          link_id: string | null
          link_type:
            | Database["public"]["Enums"]["notification_link_type"]
            | null
          metadata: Json
          read_at: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
        }
        Insert: {
          body: string
          booking_id?: string | null
          created_at?: string
          id?: string
          link_id?: string | null
          link_type?:
            | Database["public"]["Enums"]["notification_link_type"]
            | null
          metadata?: Json
          read_at?: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Update: {
          body?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          link_id?: string | null
          link_type?:
            | Database["public"]["Enums"]["notification_link_type"]
            | null
          metadata?: Json
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
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
      add_booking_history: {
        Args: {
          p_booking: Database["public"]["Tables"]["bookings"]["Row"]
          p_description: string
          p_event_type: Database["public"]["Enums"]["student_history_event_type"]
          p_status: Database["public"]["Enums"]["student_history_event_status"]
          p_title: string
        }
        Returns: undefined
      }
      add_booking_participants: {
        Args: {
          p_booking_id: string
          p_participant_ids: string[]
          p_requester_id: string
        }
        Returns: undefined
      }
      approve_booking: {
        Args: { p_booking_id: string }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assert_active_student_for_coach: {
        Args: { p_coach_id: string; p_student_id: string }
        Returns: undefined
      }
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
      cancel_booking: {
        Args: { p_booking_id: string }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
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
      create_app_notification: {
        Args: {
          p_body: string
          p_booking_id: string
          p_link_id: string
          p_link_type: Database["public"]["Enums"]["notification_link_type"]
          p_metadata?: Json
          p_recipient_id: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: {
          body: string
          booking_id: string | null
          created_at: string
          id: string
          link_id: string | null
          link_type:
            | Database["public"]["Enums"]["notification_link_type"]
            | null
          metadata: Json
          read_at: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
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
      create_coach_booking: {
        Args: {
          p_duration_minutes: number
          p_lesson_type: string
          p_location: string
          p_recurrence_ends_on: string
          p_starts_at: string
          p_student_ids: string[]
        }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: false
          isSetofReturn: true
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
      delete_availability_slot: {
        Args: { p_apply_to_series: boolean; p_slot_id: string }
        Returns: number
      }
      delete_pricing_rate: { Args: { p_rate_id: string }; Returns: undefined }
      expire_pending_bookings: { Args: never; Returns: number }
      finalize_student_activation: {
        Args: { p_student_id: string; p_token_id: string }
        Returns: undefined
      }
      get_requestable_booking_participants: {
        Args: never
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
        }[]
        SetofOptions: {
          from: "*"
          to: "student_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_coach_message_thread_read: {
        Args: { p_thread_id: string }
        Returns: {
          booking_id: string
          coach_id: string
          coach_read_at: string | null
          created_at: string
          id: string
          last_message_at: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "coach_message_threads"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: {
          body: string
          booking_id: string | null
          created_at: string
          id: string
          link_id: string | null
          link_type:
            | Database["public"]["Enums"]["notification_link_type"]
            | null
          metadata: Json
          read_at: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "notifications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      modify_booking: {
        Args: {
          p_booking_id: string
          p_duration_minutes: number
          p_location: string
          p_starts_at: string
        }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_student_email: { Args: { value: string }; Returns: string }
      normalize_student_phone: { Args: { value: string }; Returns: string }
      refuse_booking: {
        Args: { p_booking_id: string; p_refusal_comment: string }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_booking: {
        Args: {
          p_lesson_type: string
          p_participant_ids: string[]
          p_slot_id: string
          p_student_comment: string
        }
        Returns: {
          availability_slot_id: string | null
          cancelled_at: string | null
          coach_id: string
          coach_refusal_comment: string | null
          created_at: string
          decided_at: string | null
          duration_minutes: number
          ends_at: string
          expired_at: string | null
          expires_at: string | null
          id: string
          lesson_type: string
          location: string
          modified_at: string | null
          origin: Database["public"]["Enums"]["booking_origin"]
          pricing_rate_id: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          student_comment: string | null
          student_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
      select_booking_pricing_rate: {
        Args: {
          p_coach_id: string
          p_duration_minutes: number
          p_lesson_type: string
          p_student_id: string
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
      send_coach_message: {
        Args: { p_body: string; p_thread_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          sender_id: string
          thread_id: string
        }
        SetofOptions: {
          from: "*"
          to: "coach_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_availability_slot: {
        Args: {
          p_apply_to_series: boolean
          p_duration_minutes: number
          p_ends_at: string
          p_location: string
          p_slot_id: string
          p_starts_at: string
        }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "availability_slots"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_push_notification_preference: {
        Args: {
          p_device_id: string
          p_permission_status: Database["public"]["Enums"]["push_permission_status"]
          p_provider: Database["public"]["Enums"]["push_provider"]
          p_token: string
        }
        Returns: {
          created_at: string
          permission_status: Database["public"]["Enums"]["push_permission_status"]
          provider: Database["public"]["Enums"]["push_provider"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "notification_push_preferences"
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
      booking_origin: "student_request" | "coach_created"
      booking_status:
        | "pending"
        | "confirmed"
        | "refused"
        | "expired"
        | "cancelled"
        | "modified"
      lesson_pack_status: "active" | "exhausted"
      notification_link_type: "booking"
      notification_type:
        | "booking_requested"
        | "booking_approved"
        | "booking_refused"
        | "booking_cancelled"
        | "booking_modified"
      push_delivery_status: "pending" | "sent" | "failed" | "skipped"
      push_permission_status:
        | "granted"
        | "denied"
        | "undetermined"
        | "unavailable"
      push_provider: "expo" | "web" | "none"
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
      booking_origin: ["student_request", "coach_created"],
      booking_status: [
        "pending",
        "confirmed",
        "refused",
        "expired",
        "cancelled",
        "modified",
      ],
      lesson_pack_status: ["active", "exhausted"],
      notification_link_type: ["booking"],
      notification_type: [
        "booking_requested",
        "booking_approved",
        "booking_refused",
        "booking_cancelled",
        "booking_modified",
      ],
      push_delivery_status: ["pending", "sent", "failed", "skipped"],
      push_permission_status: [
        "granted",
        "denied",
        "undetermined",
        "unavailable",
      ],
      push_provider: ["expo", "web", "none"],
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
