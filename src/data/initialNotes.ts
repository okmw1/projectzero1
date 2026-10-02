import { StudentNote, NoteColor, PhotoCard, AuthorizedTeacher } from '../types';

export const INITIAL_STUDENT_NOTES: StudentNote[] = [
  {
    id: 'note-math-1',
    subject: 'GENERAL MATHEMATICS',
    message: '“You made every wrong answer feel like the beginning of a better idea. Thank you for helping me be brave enough to raise my hand.”',
    studentName: '@projectastra',
    grade: 'Grade 11',
    color: 'blush',
    likes: 28,
    createdAt: 1727800000000,
  },
  {
    id: 'note-sci-2',
    subject: 'GENERAL SCIENCE',
    message: '“You taught us to stay curious about the world — even the messy, surprising parts. Your class makes me want to keep asking why.”',
    studentName: 'Manta',
    grade: 'Grade 11',
    color: 'sky',
    likes: 34,
    createdAt: 1727796400000,
  },
  {
    id: 'note-comm-3',
    subject: 'EFFECTIVE COMMUNICATION',
    message: '“You helped me find the confidence to tell my own story. Thank you for showing us that every voice deserves to be heard.”',
    studentName: '@hmsbismarck',
    grade: 'Grade 11',
    color: 'lilac',
    likes: 42,
    createdAt: 1727792800000,
  },
  {
    id: 'note-comp-4',
    subject: 'CREATIVE COMPOSITION',
    message: '“You gave my thoughts a place to shine and taught me my voice mattered. Thank you for painting our classroom with so much heart.”',
    studentName: '@captainpalm',
    grade: 'Grade 12',
    color: 'mint',
    likes: 39,
    createdAt: 1727789200000,
  },
  {
    id: 'note-phil-5',
    subject: 'INTRODUCTION OF PHILOSOPHY',
    message: '“You clapped for every attempt and taught us that practice can sound like progress. Thank you for helping us find our rhythm.”',
    studentName: '@smallneko',
    grade: 'Grade 12',
    color: 'coral',
    likes: 25,
    createdAt: 1727785600000,
  },
  {
    id: 'note-fil-6',
    subject: 'FILIPINO',
    message: '“Salamat po for helping us love our language, our stories, and where we come from. Your lessons stay with us.”',
    studentName: 'Skoll',
    grade: 'Grade 12',
    color: 'sunshine',
    likes: 51,
    createdAt: 1727782000000,
  },
];

export const INITIAL_AUTHORIZED_TEACHERS: AuthorizedTeacher[] = [
  {
    id: 'teacher-auth-1',
    name: 'Ms. Rivera',
    subject: 'General Mathematics',
    accessCode: 'rivera2026',
    status: 'approved',
    requestedAt: '2026-10-01',
  },
  {
    id: 'teacher-auth-2',
    name: 'Mr. Harrison',
    subject: 'General Science',
    accessCode: 'science2026',
    status: 'approved',
    requestedAt: '2026-10-01',
  },
  {
    id: 'teacher-auth-3',
    name: 'Prof. Castillo',
    subject: 'Philosophy',
    accessCode: 'castillo2026',
    status: 'approved',
    requestedAt: '2026-10-01',
  },
];

export const INITIAL_PHOTO_CARDS: PhotoCard[] = [
  {
    id: 'photo-2',
    src: '/src/assets/images/teacher_with_students_warm_1790936123987.jpg',
    alt: 'Teacher working happily with students at desk',
    caption: 'Workshop & project hours',
    scale: 1,
    rotation: -1,
  },
  {
    id: 'photo-4',
    src: '/src/assets/images/classroom_chalkboard_notes_1790936621086.jpg',
    alt: 'Green chalkboard with handwritten notes',
    caption: 'Words to remember',
    scale: 1,
    rotation: 1,
  },
];

export interface ColorScheme {
  id: NoteColor;
  label: string;
  bg: string;
  border: string;
  headerText: string;
  bodyText: string;
  authorText: string;
  swatchBg: string;
}

export const NOTE_COLOR_MAP: Record<NoteColor, ColorScheme> = {
  blush: {
    id: 'blush',
    label: 'Blush',
    bg: '#FCECEB',
    border: '#F6CDCA',
    headerText: '#873E3B',
    bodyText: '#262221',
    authorText: '#4A3B3A',
    swatchBg: '#F8D1CE',
  },
  sky: {
    id: 'sky',
    label: 'Sky',
    bg: '#D8ECFD',
    border: '#B6D7F8',
    headerText: '#2C5C8C',
    bodyText: '#1D2833',
    authorText: '#324759',
    swatchBg: '#BFDEFC',
  },
  mint: {
    id: 'mint',
    label: 'Mint',
    bg: '#D7F3E3',
    border: '#B2E7C6',
    headerText: '#246B46',
    bodyText: '#1B2C21',
    authorText: '#2E4C38',
    swatchBg: '#C2EED4',
  },
  sunshine: {
    id: 'sunshine',
    label: 'Sunshine',
    bg: '#FDF2B5',
    border: '#F1DE79',
    headerText: '#7A6414',
    bodyText: '#302A14',
    authorText: '#4D421B',
    swatchBg: '#FCE788',
  },
  lilac: {
    id: 'lilac',
    label: 'Lilac',
    bg: '#ECE8FD',
    border: '#D0C9FA',
    headerText: '#54469B',
    bodyText: '#231E3B',
    authorText: '#443A6D',
    swatchBg: '#DCD6FB',
  },
  coral: {
    id: 'coral',
    label: 'Coral',
    bg: '#FDE2D2',
    border: '#F8BFA5',
    headerText: '#9A4C2E',
    bodyText: '#36231B',
    authorText: '#5C3829',
    swatchBg: '#FAC9B2',
  },
};
