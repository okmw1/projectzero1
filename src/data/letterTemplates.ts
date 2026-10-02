import { LetterTemplate } from '../types';

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'mentorship',
    title: 'Mentorship & Guidance',
    subtitle: 'For teachers who shaped your character, values, and life path',
    icon: '🌟',
    defaultTitle: 'A Tribute to Your Guidance Beyond the Classroom',
    bodyTemplate: `Dear [Teacher's Name],

As Teacher's Day arrives, I wanted to take a moment to write you this letter not just as your student, but as someone whose perspective on life has been profoundly shaped by your presence.

Beyond our daily syllabus, what I cherish most is the wisdom and integrity you brought into our room. You always reminded us that character matters far more than grades, and that how we treat each other in difficult moments is the true measure of our learning. Whenever I felt uncertain about the path ahead, your quiet encouragement gave me the grounded courage to move forward.

Thank you for being more than an instructor. Thank you for being a mentor whose lessons will continue to echo long after I graduate.

With deepest respect and gratitude,
[Your Name]`,
  },
  {
    id: 'subject',
    title: 'Subject Inspiration',
    subtitle: 'For teachers who brought math, science, or language to vibrant life',
    icon: '💡',
    defaultTitle: 'Thank You for Showing Us the Beauty in Learning',
    bodyTemplate: `Dear [Teacher's Name],

Before stepping into your [Subject] class, I used to see lessons as just another subject to study for an exam. You completely transformed how I see the world.

Your passion for teaching is contagious. You turn complicated concepts into thrilling discoveries, and you welcome every question with excitement. You taught us that curiosity is not something to be rushed, and that making mistakes is simply the first step of real discovery.

Thank you for your tireless energy, your infectious passion, and for making our classroom one of my favorite places to learn every single day.

With heartfelt admiration,
[Your Name]`,
  },
  {
    id: 'patience',
    title: 'Patient Encouragement',
    subtitle: 'For moments when learning felt hard and they refused to give up on you',
    icon: '🌱',
    defaultTitle: 'For Your Unwavering Patience and Belief in Me',
    bodyTemplate: `Dear [Teacher's Name],

I am writing this letter to express something I may not have said out loud during class: thank you for never giving up on me.

There were days when I struggled to keep up, when self-doubt made me want to shrink back and remain silent. You always noticed when I needed that gentle extra moment. Your patience, your kindness, and the way you broke down hard problems without ever making me feel less capable gave me confidence I didn't know I had.

You believed in my potential before I could see it in myself. That faith has meant the world to me.

Forever grateful for your kindness,
[Your Name]`,
  },
];
