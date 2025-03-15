export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      party_bus_players: {
        Row: {
          created_at: string;
          game_state: Json;
          id: string;
          nickname: string;
          room_id: string;
        };
        Insert: {
          created_at?: string;
          game_state: Json;
          id?: string;
          nickname: string;
          room_id: string;
        };
        Update: {
          created_at?: string;
          game_state?: Json;
          id?: string;
          nickname?: string;
          room_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'party_bus_players_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'party_bus_rooms';
            referencedColumns: ['id'];
          }
        ];
      };
      party_bus_rooms: {
        Row: {
          created_at: string;
          id: string;
          room_code: string;
          host_nickname: string;
          game_started: boolean;
          show_dancing_uzbek: boolean;
        };
        Insert: {
          created_at?: string;
          id?: string;
          room_code: string;
          host_nickname: string;
          game_started?: boolean;
          show_dancing_uzbek?: boolean;
        };
        Update: {
          created_at?: string;
          id?: string;
          room_code?: string;
          host_nickname?: string;
          game_started?: boolean;
          show_dancing_uzbek?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
