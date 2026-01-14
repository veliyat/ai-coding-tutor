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
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json
          description: string
          icon: string
          id: string
          slug: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria: Json
          description: string
          icon: string
          id?: string
          slug: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          slug?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          code_submitted: string
          created_at: string | null
          error_message: string | null
          hint_level: number | null
          hint_requested: boolean | null
          id: string
          lesson_id: string | null
          passed: boolean
          student_id: string | null
          test_results: Json | null
          time_spent_seconds: number | null
        }
        Insert: {
          code_submitted: string
          created_at?: string | null
          error_message?: string | null
          hint_level?: number | null
          hint_requested?: boolean | null
          id?: string
          lesson_id?: string | null
          passed: boolean
          student_id?: string | null
          test_results?: Json | null
          time_spent_seconds?: number | null
        }
        Update: {
          code_submitted?: string
          created_at?: string | null
          error_message?: string | null
          hint_level?: number | null
          hint_requested?: boolean | null
          id?: string
          lesson_id?: string | null
          passed?: boolean
          student_id?: string | null
          test_results?: Json | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string | null
          difficulty: string | null
          estimated_minutes: number | null
          exercise: Json | null
          id: string
          module_id: string | null
          prerequisites: string[] | null
          sequence_order: number
          slug: string
          title: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          exercise?: Json | null
          id?: string
          module_id?: string | null
          prerequisites?: string[] | null
          sequence_order: number
          slug: string
          title: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          exercise?: Json | null
          id?: string
          module_id?: string | null
          prerequisites?: string[] | null
          sequence_order?: number
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          sequence_order: number
          slug: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          sequence_order: number
          slug: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          sequence_order?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      student_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          student_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          student_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          access_code: string | null
          age_group: string | null
          auth_user_id: string | null
          avatar_emoji: string | null
          created_at: string | null
          current_level: number | null
          current_skill_level: string | null
          current_streak: number | null
          display_name: string | null
          id: string
          last_active_at: string | null
          last_activity_date: string | null
          learning_goal: string | null
          longest_streak: number | null
          preferred_style: string | null
          prior_experience: string | null
          sound_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          xp_total: number | null
        }
        Insert: {
          access_code?: string | null
          age_group?: string | null
          auth_user_id?: string | null
          avatar_emoji?: string | null
          created_at?: string | null
          current_level?: number | null
          current_skill_level?: string | null
          current_streak?: number | null
          display_name?: string | null
          id: string
          last_active_at?: string | null
          last_activity_date?: string | null
          learning_goal?: string | null
          longest_streak?: number | null
          preferred_style?: string | null
          prior_experience?: string | null
          sound_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          xp_total?: number | null
        }
        Update: {
          access_code?: string | null
          age_group?: string | null
          auth_user_id?: string | null
          avatar_emoji?: string | null
          created_at?: string | null
          current_level?: number | null
          current_skill_level?: string | null
          current_streak?: number | null
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          last_activity_date?: string | null
          learning_goal?: string | null
          longest_streak?: number | null
          preferred_style?: string | null
          prior_experience?: string | null
          sound_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          xp_total?: number | null
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string | null
          started_at: string | null
          status: string | null
          student_id: string | null
          total_attempts: number | null
          total_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          total_attempts?: number | null
          total_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string | null
          total_attempts?: number | null
          total_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_id: string | null
          message_type: string | null
          role: string
          student_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          message_type?: string | null
          role: string
          student_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          message_type?: string | null
          role?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: { p_student_id: string; p_xp_amount: number }
        Returns: {
          level_up: boolean
          new_level: number
          new_xp_total: number
          old_level: number
        }[]
      }
      calculate_level: { Args: { xp: number }; Returns: number }
      cleanup_inactive_profiles: { Args: never; Returns: number }
      get_next_lesson: {
        Args: { p_student_id: string }
        Returns: {
          lesson_id: string
          lesson_slug: string
          lesson_title: string
          module_title: string
        }[]
      }
      update_streak: {
        Args: { p_student_id: string; p_timezone?: string }
        Returns: {
          new_streak: number
          streak_continued: boolean
          streak_started: boolean
        }[]
      }
      upgrade_profile_to_registered: {
        Args: {
          p_access_code: string
          p_auth_user_id: string
          p_display_name: string
          p_profile_id: string
        }
        Returns: boolean
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
    Enums: {},
  },
} as const
