export type NoteColor = 'blush' | 'sky' | 'mint' | 'sunshine' | 'lilac' | 'coral';

export type UserRole = 'guest' | 'teacher' | 'admin';

export interface UserSession {
  role: UserRole;
  name: string;
  title?: string;
  subject?: string;
}

export interface AuthorizedTeacher {
  id: string;
  name: string;
  subject: string;
  accessCode: string;
  status: 'approved' | 'pending';
  requestedAt?: string;
}

export interface StudentNote {
  id: string;
  subject: string;
  message: string;
  studentName: string;
  grade?: string;
  color: NoteColor;
  isStarred?: boolean;
  likes?: number;
  createdAt?: number | string;
  isTeacherReply?: boolean;
}

export interface PhotoCard {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  scale: number;
  rotation: number;
}

export interface StudentLetter {
  id: string;
  recipientTeacherName: string;
  recipientSubject: string;
  studentName: string;
  grade?: string;
  templateType: 'mentorship' | 'subject' | 'patience' | 'custom';
  title: string;
  body: string;
  createdAt: number;
  isRead: boolean;
  isBookmarked?: boolean;
  pinPreviewToWall?: boolean;
}

export interface LetterTemplate {
  id: 'mentorship' | 'subject' | 'patience';
  title: string;
  subtitle: string;
  icon: string;
  defaultTitle: string;
  bodyTemplate: string;
}
