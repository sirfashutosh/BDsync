export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  teamId?: string | null; // Nullable for admin
  photoURL?: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

export interface MeetingAnalysis {
  summary: string;
  action_items: { task: string; owner: string }[];
  suggestions: string;
}

export interface Meeting {
  id: string;
  teamId: string;
  date: string; // ISO string
  rawNotes: string;
  analysis?: MeetingAnalysis | null;
  createdAt: number;
}
