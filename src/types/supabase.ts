export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'in_conversation'
  | 'proposal_sent'
  | 'won'
  | 'lost';

export type ContactChannel = 'email' | 'phone' | 'whatsapp' | 'linkedin' | 'other';

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          email: string | null;
          phone: string | null;
          contact_channel: ContactChannel | null;
          status: LeadStatus;
          notes: string | null;
          next_action: string | null;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_channel?: ContactChannel | null;
          status?: LeadStatus;
          notes?: string | null;
          next_action?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          contact_channel?: ContactChannel | null;
          status?: LeadStatus;
          notes?: string | null;
          next_action?: string | null;
          follow_up_date?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
