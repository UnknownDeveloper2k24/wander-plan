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
      activities: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          description: string | null
          end_time: string
          estimated_steps: number | null
          id: string
          itinerary_id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          name: string
          notes: string | null
          priority: number | null
          review_score: number | null
          start_time: string
          status: string
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time: string
          estimated_steps?: number | null
          id?: string
          itinerary_id: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          name: string
          notes?: string | null
          priority?: number | null
          review_score?: number | null
          start_time: string
          status?: string
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          end_time?: string
          estimated_steps?: number | null
          id?: string
          itinerary_id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          name?: string
          notes?: string | null
          priority?: number | null
          review_score?: number | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_votes: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
          vote: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
          vote: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_votes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      disruption_events: {
        Row: {
          description: string | null
          detected_at: string
          event_type: string
          id: string
          new_itinerary: Json | null
          old_itinerary: Json | null
          replan_applied: boolean | null
          resolved: boolean | null
          severity: string | null
          trip_id: string
        }
        Insert: {
          description?: string | null
          detected_at?: string
          event_type: string
          id?: string
          new_itinerary?: Json | null
          old_itinerary?: Json | null
          replan_applied?: boolean | null
          resolved?: boolean | null
          severity?: string | null
          trip_id: string
        }
        Update: {
          description?: string | null
          detected_at?: string
          event_type?: string
          id?: string
          new_itinerary?: Json | null
          old_itinerary?: Json | null
          replan_applied?: boolean | null
          resolved?: boolean | null
          severity?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disruption_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          cost_breakdown: Json | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          regret_score: number | null
          trip_id: string
          updated_at: string
          variant_id: string | null
          version: number | null
        }
        Insert: {
          cost_breakdown?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          regret_score?: number | null
          trip_id: string
          updated_at?: string
          variant_id?: string | null
          version?: number | null
        }
        Update: {
          cost_breakdown?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          regret_score?: number | null
          trip_id?: string
          updated_at?: string
          variant_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          sender_id: string
          trip_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_id: string
          trip_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          phone_number: string | null
          preferences: Json | null
          travel_history: Json | null
          travel_personality: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string
          phone_number?: string | null
          preferences?: Json | null
          travel_history?: Json | null
          travel_personality?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          phone_number?: string | null
          preferences?: Json | null
          travel_history?: Json | null
          travel_personality?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      trip_memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          trip_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          trip_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_memberships_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget_total: number | null
          country: string | null
          created_at: string
          currency: string | null
          destination: string
          end_date: string
          id: string
          image_url: string | null
          name: string
          organizer_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          budget_total?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          destination: string
          end_date: string
          id?: string
          image_url?: string | null
          name: string
          organizer_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          budget_total?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          destination?: string
          end_date?: string
          id?: string
          image_url?: string | null
          name?: string
          organizer_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_trip_id_from_activity: {
        Args: { p_itinerary_id: string }
        Returns: string
      }
      get_trip_id_from_vote: {
        Args: { p_activity_id: string }
        Returns: string
      }
      is_trip_member: { Args: { p_trip_id: string }; Returns: boolean }
      is_trip_organizer: { Args: { p_trip_id: string }; Returns: boolean }
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
