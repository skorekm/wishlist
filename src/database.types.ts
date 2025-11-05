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
      currencies: {
        Row: {
          code: string
          currency: string
          entity: string
          id: number
          minor_unit: string | null
          numeric: string | null
          withdrawal_date: string | null
        }
        Insert: {
          code: string
          currency: string
          entity: string
          id?: number
          minor_unit?: string | null
          numeric?: string | null
          withdrawal_date?: string | null
        }
        Update: {
          code?: string
          currency?: string
          entity?: string
          id?: number
          minor_unit?: string | null
          numeric?: string | null
          withdrawal_date?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          description: string
          id: number
          name: string
        }
        Insert: {
          description: string
          id?: number
          name: string
        }
        Update: {
          description?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          reservation_code: string
          reserver_email: string | null
          reserver_name: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          user_id: string | null
          wishlist_item_id: number
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: number
          reservation_code: string
          reserver_email?: string | null
          reserver_name?: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          user_id?: string | null
          wishlist_item_id: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: number
          reservation_code?: string
          reserver_email?: string | null
          reserver_name?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          user_id?: string | null
          wishlist_item_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservations_wishlist_item_id_fkey"
            columns: ["wishlist_item_id"]
            isOneToOne: false
            referencedRelation: "wishlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          created_at: string
          created_by: string
          id: number
          last_accessed_at: string | null
          revoked_at: string | null
          share_token: string
          wishlist_id: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: number
          last_accessed_at?: string | null
          revoked_at?: string | null
          share_token?: string
          wishlist_id: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          last_accessed_at?: string | null
          revoked_at?: string | null
          share_token?: string
          wishlist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "share_links_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          author_id: string
          category: string | null
          created_at: string
          currency: number
          id: number
          link: string | null
          name: string
          notes: string | null
          price: number
          priority: Database["public"]["Enums"]["priority"]
          updated_at: string
          wishlist_id: number
        }
        Insert: {
          author_id: string
          category?: string | null
          created_at?: string
          currency: number
          id?: number
          link?: string | null
          name: string
          notes?: string | null
          price: number
          priority: Database["public"]["Enums"]["priority"]
          updated_at?: string
          wishlist_id: number
        }
        Update: {
          author_id?: string
          category?: string | null
          created_at?: string
          currency?: number
          id?: number
          link?: string | null
          name?: string
          notes?: string | null
          price?: number
          priority?: Database["public"]["Enums"]["priority"]
          updated_at?: string
          wishlist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_permissions: {
        Row: {
          created_at: string
          created_by: string
          id: number
          permission_id: number
          user_id: string
          wishlist_id: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: number
          permission_id: number
          user_id: string
          wishlist_id: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: number
          permission_id?: number
          user_id?: string
          wishlist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_permissions_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          event_date: string | null
          id: number
          name: string
          updated_at: string
          uuid: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: number
          name: string
          updated_at?: string
          uuid?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: number
          name?: string
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority: "low" | "medium" | "high"
      reservation_status: "reserved" | "purchased" | "cancelled"
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
      priority: ["low", "medium", "high"],
      reservation_status: ["reserved", "purchased", "cancelled"],
    },
  },
} as const

