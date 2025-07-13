export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      airline_partnerships: {
        Row: {
          airline_name: string
          airports: string[] | null
          commission_rate: number | null
          contact_person: string
          created_at: string | null
          email: string
          headquarters: string | null
          iata_code: string | null
          id: string
          partnership_type: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          airline_name: string
          airports?: string[] | null
          commission_rate?: number | null
          contact_person: string
          created_at?: string | null
          email: string
          headquarters?: string | null
          iata_code?: string | null
          id?: string
          partnership_type?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          airline_name?: string
          airports?: string[] | null
          commission_rate?: number | null
          contact_person?: string
          created_at?: string | null
          email?: string
          headquarters?: string | null
          iata_code?: string | null
          id?: string
          partnership_type?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      airline_profiles: {
        Row: {
          airline_name: string
          commission_rate: number | null
          contact_person: string | null
          contact_position: string | null
          contract_details: Json | null
          created_at: string | null
          destinations_served: string[] | null
          email_address: string | null
          fleet_size: number | null
          iata_code: string | null
          id: string
          office_address: string | null
          partnership_type: string | null
          phone_number: string | null
          preferred_airports: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          airline_name: string
          commission_rate?: number | null
          contact_person?: string | null
          contact_position?: string | null
          contract_details?: Json | null
          created_at?: string | null
          destinations_served?: string[] | null
          email_address?: string | null
          fleet_size?: number | null
          iata_code?: string | null
          id?: string
          office_address?: string | null
          partnership_type?: string | null
          phone_number?: string | null
          preferred_airports?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          airline_name?: string
          commission_rate?: number | null
          contact_person?: string | null
          contact_position?: string | null
          contract_details?: Json | null
          created_at?: string | null
          destinations_served?: string[] | null
          email_address?: string | null
          fleet_size?: number | null
          iata_code?: string | null
          id?: string
          office_address?: string | null
          partnership_type?: string | null
          phone_number?: string | null
          preferred_airports?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          code: string
          country: string
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          timezone: string | null
        }
        Insert: {
          city: string
          code: string
          country: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          timezone?: string | null
        }
        Update: {
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          timezone?: string | null
        }
        Relationships: []
      }
      driver_profiles: {
        Row: {
          availability_schedule: Json | null
          background_check_status: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          experience_years: number | null
          id: string
          insurance_policy_number: string | null
          license_expiry: string | null
          license_number: string | null
          preferred_airports: string[] | null
          updated_at: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          background_check_status?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          experience_years?: number | null
          id?: string
          insurance_policy_number?: string | null
          license_expiry?: string | null
          license_number?: string | null
          preferred_airports?: string[] | null
          updated_at?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          background_check_status?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          experience_years?: number | null
          id?: string
          insurance_policy_number?: string | null
          license_expiry?: string | null
          license_number?: string | null
          preferred_airports?: string[] | null
          updated_at?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          airport_id: string | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          documents: Json | null
          id: string
          is_available: boolean | null
          license_expiry: string
          license_number: string
          rating: number | null
          status: Database["public"]["Enums"]["driver_status"] | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          vehicle_color: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          vehicle_year: number
        }
        Insert: {
          airport_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          documents?: Json | null
          id?: string
          is_available?: boolean | null
          license_expiry: string
          license_number: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_color?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          vehicle_year: number
        }
        Update: {
          airport_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          documents?: Json | null
          id?: string
          is_available?: boolean | null
          license_expiry?: string
          license_number?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_color?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "drivers_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
        ]
      }
      garage_profiles: {
        Row: {
          business_license: string | null
          business_name: string
          capacity: number | null
          certification_documents: Json | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          insurance_details: Json | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          operating_hours: Json | null
          services_offered: string[] | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_license?: string | null
          business_name: string
          capacity?: number | null
          certification_documents?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          insurance_details?: Json | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          operating_hours?: Json | null
          services_offered?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_license?: string | null
          business_name?: string
          capacity?: number | null
          certification_documents?: Json | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          insurance_details?: Json | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          operating_hours?: Json | null
          services_offered?: string[] | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      otps: {
        Row: {
          attempts: number | null
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          is_used: boolean | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_used?: boolean | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string
          provider_reference: string | null
          ride_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method: string
          provider_reference?: string | null
          ride_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string
          provider_reference?: string | null
          ride_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_verified: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ride_tracking: {
        Row: {
          driver_latitude: number | null
          driver_longitude: number | null
          id: string
          passenger_latitude: number | null
          passenger_longitude: number | null
          ride_id: string
          status: string | null
          timestamp: string | null
        }
        Insert: {
          driver_latitude?: number | null
          driver_longitude?: number | null
          id?: string
          passenger_latitude?: number | null
          passenger_longitude?: number | null
          ride_id: string
          status?: string | null
          timestamp?: string | null
        }
        Update: {
          driver_latitude?: number | null
          driver_longitude?: number | null
          id?: string
          passenger_latitude?: number | null
          passenger_longitude?: number | null
          ride_id?: string
          status?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_tracking_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          airport_id: string
          completion_time: string | null
          created_at: string | null
          currency: string | null
          destination_latitude: number
          destination_location: string
          destination_longitude: number
          distance_km: number | null
          driver_id: string | null
          estimated_duration: number | null
          fare_amount: number
          id: string
          passenger_count: number | null
          passenger_id: string
          pickup_latitude: number
          pickup_location: string
          pickup_longitude: number
          pickup_time: string | null
          qr_code: string | null
          rating: number | null
          review: string | null
          scheduled_time: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["ride_status"] | null
          updated_at: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          airport_id: string
          completion_time?: string | null
          created_at?: string | null
          currency?: string | null
          destination_latitude: number
          destination_location: string
          destination_longitude: number
          distance_km?: number | null
          driver_id?: string | null
          estimated_duration?: number | null
          fare_amount: number
          id?: string
          passenger_count?: number | null
          passenger_id: string
          pickup_latitude: number
          pickup_location: string
          pickup_longitude: number
          pickup_time?: string | null
          qr_code?: string | null
          rating?: number | null
          review?: string | null
          scheduled_time?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          updated_at?: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          airport_id?: string
          completion_time?: string | null
          created_at?: string | null
          currency?: string | null
          destination_latitude?: number
          destination_location?: string
          destination_longitude?: number
          distance_km?: number | null
          driver_id?: string | null
          estimated_duration?: number | null
          fare_amount?: number
          id?: string
          passenger_count?: number | null
          passenger_id?: string
          pickup_latitude?: number
          pickup_location?: string
          pickup_longitude?: number
          pickup_time?: string | null
          qr_code?: string | null
          rating?: number | null
          review?: string | null
          scheduled_time?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["ride_status"] | null
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rides_airport_id_fkey"
            columns: ["airport_id"]
            isOneToOne: false
            referencedRelation: "airports"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          currency: string | null
          end_date: string | null
          features: Json | null
          id: string
          price: number
          start_date: string | null
          status: string | null
          type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          price: number
          start_date?: string | null
          status?: string | null
          type: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          price?: number
          start_date?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      driver_status: "pending" | "approved" | "suspended" | "active" | "offline"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      ride_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      subscription_type: "basic" | "premium" | "enterprise"
      user_role: "passenger" | "driver" | "airline_admin" | "super_admin"
      vehicle_type: "sedan" | "suv" | "luxury" | "van" | "bus"
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
      driver_status: ["pending", "approved", "suspended", "active", "offline"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      ride_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      subscription_type: ["basic", "premium", "enterprise"],
      user_role: ["passenger", "driver", "airline_admin", "super_admin"],
      vehicle_type: ["sedan", "suv", "luxury", "van", "bus"],
    },
  },
} as const
