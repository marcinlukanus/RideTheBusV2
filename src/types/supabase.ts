export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      card_counts: {
        Row: {
          card_rank: string
          card_suit: string
          count: number
        }
        Insert: {
          card_rank: string
          card_suit: string
          count?: number
        }
        Update: {
          card_rank?: string
          card_suit?: string
          count?: number
        }
        Relationships: []
      }
      party_bus_players: {
        Row: {
          created_at: string | null
          game_completed: boolean | null
          game_state: Json | null
          id: string
          nickname: string
          room_id: string | null
          score: number | null
        }
        Insert: {
          created_at?: string | null
          game_completed?: boolean | null
          game_state?: Json | null
          id?: string
          nickname: string
          room_id?: string | null
          score?: number | null
        }
        Update: {
          created_at?: string | null
          game_completed?: boolean | null
          game_state?: Json | null
          id?: string
          nickname?: string
          room_id?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "party_bus_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "party_bus_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      party_bus_rooms: {
        Row: {
          created_at: string | null
          game_started: boolean
          host_nickname: string
          id: string
          room_code: string
          show_dancing_uzbek: boolean
          status: string | null
        }
        Insert: {
          created_at?: string | null
          game_started?: boolean
          host_nickname: string
          id?: string
          room_code: string
          show_dancing_uzbek?: boolean
          status?: string | null
        }
        Update: {
          created_at?: string | null
          game_started?: boolean
          host_nickname?: string
          id?: string
          room_code?: string
          show_dancing_uzbek?: boolean
          status?: string | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          created_at: string
          id: number
          score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          score: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rooms: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_card_count: {
        Args: {
          card_value_input: string
          card_suit_input: string
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
