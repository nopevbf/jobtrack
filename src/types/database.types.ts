export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Screening'
  | 'HR Interview'
  | 'Technical Test'
  | 'User Interview'
  | 'Final Interview'
  | 'Offering'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'
  | 'No Response';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Top Priority';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
export type WorkArrangement = 'Remote' | 'On-site' | 'Hybrid';

export interface Database {
  public: {
    Tables: {
      app_owner: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          default_currency: string;
          date_format: string;
          notification_preferences: {
            browser_notifications: boolean;
            follow_up_lead_days: number;
          };
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: 'light' | 'dark' | 'system';
          default_currency?: string;
          date_format?: string;
          notification_preferences?: Json;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: 'light' | 'dark' | 'system';
          default_currency?: string;
          date_format?: string;
          notification_preferences?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "app_owner";
            referencedColumns: ["user_id"];
          }
        ];
      };
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          job_position: string;
          company_website: string | null;
          job_url: string | null;
          job_source: string | null;
          employment_type: string | null;
          work_arrangement: string | null;
          location: string | null;
          application_date: string;
          status: ApplicationStatus;
          priority: PriorityLevel;
          expected_salary: number | null;
          offered_salary: number | null;
          currency: string;
          recruiter_name: string | null;
          recruiter_email: string | null;
          recruiter_phone: string | null;
          follow_up_date: string | null;
          job_description: string | null;
          notes: string | null;
          resume_version: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          job_position: string;
          company_website?: string | null;
          job_url?: string | null;
          job_source?: string | null;
          employment_type?: string | null;
          work_arrangement?: string | null;
          location?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          priority?: PriorityLevel;
          expected_salary?: number | null;
          offered_salary?: number | null;
          currency?: string;
          recruiter_name?: string | null;
          recruiter_email?: string | null;
          recruiter_phone?: string | null;
          follow_up_date?: string | null;
          job_description?: string | null;
          notes?: string | null;
          resume_version?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_position?: string;
          company_website?: string | null;
          job_url?: string | null;
          job_source?: string | null;
          employment_type?: string | null;
          work_arrangement?: string | null;
          location?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          priority?: PriorityLevel;
          expected_salary?: number | null;
          offered_salary?: number | null;
          currency?: string;
          recruiter_name?: string | null;
          recruiter_email?: string | null;
          recruiter_phone?: string | null;
          follow_up_date?: string | null;
          job_description?: string | null;
          notes?: string | null;
          resume_version?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "app_owner";
            referencedColumns: ["user_id"];
          }
        ];
      };
      application_status_history: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          previous_status: string | null;
          new_status: string;
          notes: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          previous_status?: string | null;
          new_status: string;
          notes?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          previous_status?: string | null;
          new_status?: string;
          notes?: string | null;
          changed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "job_applications";
            referencedColumns: ["id"];
          }
        ];
      };
      recruitment_events: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          event_type: string;
          title: string;
          start_datetime: string;
          end_datetime: string | null;
          location_or_link: string | null;
          reminder_at: string | null;
          is_completed: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          event_type: string;
          title: string;
          start_datetime: string;
          end_datetime?: string | null;
          location_or_link?: string | null;
          reminder_at?: string | null;
          is_completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          event_type?: string;
          title?: string;
          start_datetime?: string;
          end_datetime?: string | null;
          location_or_link?: string | null;
          reminder_at?: string | null;
          is_completed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recruitment_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "job_applications";
            referencedColumns: ["id"];
          }
        ];
      };
      application_notes: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "job_applications";
            referencedColumns: ["id"];
          }
        ];
      };
      application_attachments: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          file_name: string;
          storage_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          file_name?: string;
          storage_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_attachments_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "job_applications";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_app_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
