export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      beerdle_daily_seeds: {
        Row: {
          created_at: string | null;
          id: string;
          seed: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          seed: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          seed?: number;
        };
        Relationships: [];
      };
      beerdle_scores: {
        Row: {
          created_at: string | null;
          game_date: string;
          id: number;
          score: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          game_date: string;
          id?: number;
          score: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          game_date?: string;
          id?: number;
          score?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
      card_counts: {
        Row: {
          card_rank: string;
          card_suit: string;
          count: number;
        };
        Insert: {
          card_rank: string;
          card_suit: string;
          count?: number;
        };
        Update: {
          card_rank?: string;
          card_suit?: string;
          count?: number;
        };
        Relationships: [];
      };
      party_bus_players: {
        Row: {
          created_at: string | null;
          game_completed: boolean | null;
          game_state: Json | null;
          id: string;
          nickname: string;
          room_id: string | null;
          score: number | null;
        };
        Insert: {
          created_at?: string | null;
          game_completed?: boolean | null;
          game_state?: Json | null;
          id?: string;
          nickname: string;
          room_id?: string | null;
          score?: number | null;
        };
        Update: {
          created_at?: string | null;
          game_completed?: boolean | null;
          game_state?: Json | null;
          id?: string;
          nickname?: string;
          room_id?: string | null;
          score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'party_bus_players_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'party_bus_rooms';
            referencedColumns: ['id'];
          },
        ];
      };
      party_bus_rooms: {
        Row: {
          created_at: string | null;
          game_started: boolean;
          host_nickname: string;
          id: string;
          room_code: string;
          show_dancing_uzbek: boolean;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          game_started?: boolean;
          host_nickname: string;
          id?: string;
          room_code: string;
          show_dancing_uzbek?: boolean;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          game_started?: boolean;
          host_nickname?: string;
          id?: string;
          room_code?: string;
          show_dancing_uzbek?: boolean;
          status?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          country: string | null;
          created_at: string;
          id: string;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          id: string;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          created_at: string;
          id: number;
          score: number;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          score: number;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          score?: number;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_old_rooms: { Args: never; Returns: undefined };
      get_country_medal_table: {
        Args: never;
        Returns: {
          country: string;
          wins: number;
          avg_drinks: number;
        }[];
      };
      get_or_create_daily_seed: {
        Args: never;
        Returns: {
          day_number: number;
          game_date: string;
          seed: number;
        }[];
      };
      increment_card_count: {
        Args: { card_suit_input: string; card_value_input: string };
        Returns: undefined;
      };
      increment_card_counts_bulk: {
        Args: { card_suits: string[]; card_values: string[] };
        Returns: undefined;
      };
      save_beerdle_score: {
        Args: { p_game_date: string; p_score: number; p_user_id: string };
        Returns: {
          already_completed: boolean;
          final_score: number;
          saved: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
