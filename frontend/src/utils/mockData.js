// Mock data for the educational platform

export const subjects = [
  {
    id: 1,
    name: 'HTML',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    resourceCount: 4,
    description: 'Apprenez les bases du développement web avec HTML.',
    color: '#E34F26'
  },
  {
    id: 2,
    name: 'CSS',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    resourceCount: 30,
    description: 'Améliorez l\'apparence de vos pages web avec CSS.',
    color: '#1572B6'
  },
  {
    id: 3,
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    resourceCount: 24,
    description: 'Rendez vos pages web dynamiques avec JavaScript.',
    color: '#F7DF1E'
  },
  {
    id: 4,
    name: 'C++',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    resourceCount: 20,
    description: 'Apprenez la programmation orientée objet avec C++.',
    color: '#00599C'
  },
  {
    id: 5,
    name: 'Python',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    resourceCount: 35,
    description: 'Découvrez la puissance et la simplicité de Python.',
    color: '#3776AB'
  },
  {
    id: 6,
    name: 'Base de données',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    resourceCount: 19,
    description: 'SQL, NoSQL et conception de bases de données.',
    color: '#47A248'
  },
  {
    id: 7,
    name: 'Systèmes d\'exploitation',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',
    resourceCount: 15,
    description: 'Découvrez le fonctionnement des OS et leur gestion.',
    color: '#FCC624'
  },
  {
    id: 8,
    name: 'Algorithmes',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    resourceCount: 27,
    description: 'Complexité algorithmique et structures de données.',
    color: '#F05032'
  }
];

export const resources = [
  {
    id: 1,
    title: 'Introduction à HTML5',
    subject: 'HTML',
    subjectId: 1,
    author: 'Marie Dupont',
    authorAvatar: 'https://ui-avatars.io/api/?name=Marie+Dupont&background=3B82F6&color=fff',
    date: '2025-01-15',
    type: 'pdf',
    likes: 45,
    views: 230,
    description: 'Guide complet sur les bases de HTML5 et ses nouvelles fonctionnalités.'
  },
  {
    id: 2,
    title: 'CSS Flexbox et Grid',
    subject: 'CSS',
    subjectId: 2,
    author: 'Jean Martin',
    authorAvatar: 'https://ui-avatars.io/api/?name=Jean+Martin&background=8B5CF6&color=fff',
    date: '2025-01-14',
    type: 'pdf',
    likes: 67,
    views: 340,
    description: 'Maîtrisez les layouts modernes avec Flexbox et Grid.'
  },
  {
    id: 3,
    title: 'JavaScript ES6+',
    subject: 'JavaScript',
    subjectId: 3,
    author: 'Sophie Laurent',
    authorAvatar: 'https://ui-avatars.io/api/?name=Sophie+Laurent&background=EC4899&color=fff',
    date: '2025-01-13',
    type: 'video',
    likes: 89,
    views: 520,
    description: 'Les nouvelles fonctionnalités de JavaScript moderne.'
  },
  {
    id: 4,
    title: 'Pointeurs en C++',
    subject: 'C++',
    subjectId: 4,
    author: 'Pierre Dubois',
    authorAvatar: 'https://ui-avatars.io/api/?name=Pierre+Dubois&background=10B981&color=fff',
    date: '2025-01-12',
    type: 'pdf',
    likes: 34,
    views: 180,
    description: 'Comprendre et utiliser les pointeurs efficacement.'
  }
];

export const quizzes = [
  {
    id: 1,
    title: 'Quiz HTML Débutant',
    subject: 'HTML',
    subjectId: 1,
    author: 'Marie Dupont',
    authorAvatar: 'https://ui-avatars.io/api/?name=Marie+Dupont&background=3B82F6&color=fff',
    questions: 10,
    duration: 15,
    difficulty: 'Facile',
    attempts: 234,
    date: '2025-01-15'
  },
  {
    id: 2,
    title: 'Quiz CSS Avancé',
    subject: 'CSS',
    subjectId: 2,
    author: 'Jean Martin',
    authorAvatar: 'https://ui-avatars.io/api/?name=Jean+Martin&background=8B5CF6&color=fff',
    questions: 15,
    duration: 20,
    difficulty: 'Difficile',
    attempts: 156,
    date: '2025-01-14'
  },
  {
    id: 3,
    title: 'JavaScript Functions',
    subject: 'JavaScript',
    subjectId: 3,
    author: 'Sophie Laurent',
    authorAvatar: 'https://ui-avatars.io/api/?name=Sophie+Laurent&background=EC4899&color=fff',
    questions: 12,
    duration: 18,
    difficulty: 'Moyen',
    attempts: 189,
    date: '2025-01-13'
  }
];

export const flashcards = [
  {
    id: 1,
    title: 'Balises HTML Essentielles',
    subject: 'HTML',
    subjectId: 1,
    author: 'Marie Dupont',
    authorAvatar: 'https://ui-avatars.io/api/?name=Marie+Dupont&background=3B82F6&color=fff',
    cardCount: 25,
    date: '2025-01-15',
    views: 340
  },
  {
    id: 2,
    title: 'Propriétés CSS',
    subject: 'CSS',
    subjectId: 2,
    author: 'Jean Martin',
    authorAvatar: 'https://ui-avatars.io/api/?name=Jean+Martin&background=8B5CF6&color=fff',
    cardCount: 40,
    date: '2025-01-14',
    views: 290
  },
  {
    id: 3,
    title: 'Méthodes JavaScript',
    subject: 'JavaScript',
    subjectId: 3,
    author: 'Sophie Laurent',
    authorAvatar: 'https://ui-avatars.io/api/?name=Sophie+Laurent&background=EC4899&color=fff',
    cardCount: 30,
    date: '2025-01-13',
    views: 410
  }
];

export const discussions = [
  {
    id: 1,
    title: 'Comment centrer une div en CSS ?',
    author: 'Thomas Bernard',
    authorAvatar: 'https://ui-avatars.io/api/?name=Thomas+Bernard&background=F59E0B&color=fff',
    subject: 'CSS',
    subjectId: 2,
    replies: 12,
    views: 156,
    date: '2025-01-15',
    lastActivity: '2025-01-15T14:30:00',
    solved: true
  },
  {
    id: 2,
    title: 'Différence entre let et const en JavaScript',
    author: 'Claire Petit',
    authorAvatar: 'https://ui-avatars.io/api/?name=Claire+Petit&background=6366F1&color=fff',
    subject: 'JavaScript',
    subjectId: 3,
    replies: 8,
    views: 203,
    date: '2025-01-15',
    lastActivity: '2025-01-15T16:20:00',
    solved: true
  },
  {
    id: 3,
    title: 'Problème avec les pointeurs en C++',
    author: 'Lucas Moreau',
    authorAvatar: 'https://ui-avatars.io/api/?name=Lucas+Moreau&background=EF4444&color=fff',
    subject: 'C++',
    subjectId: 4,
    replies: 15,
    views: 189,
    date: '2025-01-14',
    lastActivity: '2025-01-15T10:15:00',
    solved: false
  },
  {
    id: 4,
    title: 'Meilleures pratiques pour les requêtes SQL',
    author: 'Emma Rousseau',
    authorAvatar: 'https://ui-avatars.io/api/?name=Emma+Rousseau&background=14B8A6&color=fff',
    subject: 'Base de données',
    subjectId: 6,
    replies: 20,
    views: 312,
    date: '2025-01-14',
    lastActivity: '2025-01-15T09:45:00',
    solved: true
  }
];

export const notifications = [
  {
    id: 1,
    type: 'quiz',
    title: 'Nouveau quiz créé',
    message: 'Marie Dupont a créé un nouveau quiz: "Quiz HTML Débutant"',
    date: '2025-01-15T15:30:00',
    read: false,
    link: '/quiz/1'
  },
  {
    id: 2,
    type: 'resource',
    title: 'Nouvelle ressource partagée',
    message: 'Jean Martin a partagé: "CSS Flexbox et Grid"',
    date: '2025-01-15T14:20:00',
    read: false,
    link: '/resources/2'
  },
  {
    id: 3,
    type: 'message',
    title: 'Nouveau commentaire',
    message: 'Sophie Laurent a commenté votre discussion',
    date: '2025-01-15T13:10:00',
    read: true,
    link: '/discussions/1'
  },
  {
    id: 4,
    type: 'flashcard',
    title: 'Nouveau flashcard créé',
    message: 'Pierre Dubois a créé: "Pointeurs en C++"',
    date: '2025-01-15T11:00:00',
    read: true,
    link: '/flashcards/4'
  }
];

export const userProfile = {
  name: 'Utilisateur Demo',
  email: 'demo@eudushare.com',
  avatar: 'https://ui-avatars.io/api/?name=User+Demo&background=3B82F6&color=fff',
  bio: 'Étudiant en informatique passionné par le développement web.',
  joined: '2024-09-01',
  resourcesShared: 12,
  quizzesCreated: 5,
  flashcardsCreated: 8,
  discussionsStarted: 15,
  reputation: 245
};

export const features = [
  {
    icon: 'Library',
    title: 'Bibliothèque de ressources',
    description: 'Accédez à une vaste collection de notes, tutoriels et projets partagés par la communauté.'
  },
  {
    icon: 'Users',
    title: 'Communauté active',
    description: 'Rejoignez des forums de discussion, collaborez sur des projets et échangez avec d\'autres étudiants.'
  },
  {
    icon: 'Share2',
    title: 'Partage facile',
    description: 'Téléchargez et partagez vos propres notes et ressources en quelques clics.'
  },
  {
    icon: 'Brain',
    title: 'Quiz interactifs',
    description: 'Créez et participez à des quiz pour tester vos connaissances et progresser.'
  },
  {
    icon: 'CreditCard',
    title: 'Flashcards',
    description: 'Mémorisez efficacement avec des flashcards personnalisées et partagées.'
  },
  {
    icon: 'Bell',
    title: 'Notifications',
    description: 'Restez informé des nouvelles ressources, quiz et messages de la communauté.'
  }
];
