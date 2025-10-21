# Contracts - Eudushare Platform

## Vue d'ensemble
Cette plateforme éducative permet aux étudiants de partager des ressources, créer des quiz/flashcards, poser des questions dans la communauté, et recevoir des notifications en temps réel.

## 1. API Contracts

### Authentication APIs
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/auth/me` - Récupérer profil utilisateur connecté
- `POST /api/auth/logout` - Déconnexion

### User Profile APIs
- `GET /api/users/:userId` - Récupérer profil utilisateur
- `PUT /api/users/:userId` - Mettre à jour profil
- `GET /api/users/:userId/stats` - Statistiques utilisateur

### Subjects APIs
- `GET /api/subjects` - Liste des matières
- `GET /api/subjects/:subjectId` - Détails d'une matière

### Resources APIs
- `GET /api/resources` - Liste des ressources (avec filtres)
- `POST /api/resources` - Créer une nouvelle ressource
- `GET /api/resources/:resourceId` - Détails d'une ressource
- `PUT /api/resources/:resourceId` - Modifier une ressource
- `DELETE /api/resources/:resourceId` - Supprimer une ressource
- `POST /api/resources/:resourceId/like` - Liker une ressource
- `POST /api/resources/upload` - Upload fichier

### Quiz APIs
- `GET /api/quizzes` - Liste des quiz
- `POST /api/quizzes` - Créer un nouveau quiz
- `GET /api/quizzes/:quizId` - Détails d'un quiz
- `PUT /api/quizzes/:quizId` - Modifier un quiz
- `DELETE /api/quizzes/:quizId` - Supprimer un quiz
- `POST /api/quizzes/:quizId/attempt` - Tenter un quiz

### Flashcards APIs
- `GET /api/flashcards` - Liste des flashcards
- `POST /api/flashcards` - Créer un nouveau set de flashcards
- `GET /api/flashcards/:flashcardId` - Détails d'un set de flashcards
- `PUT /api/flashcards/:flashcardId` - Modifier un set
- `DELETE /api/flashcards/:flashcardId` - Supprimer un set

### Community/Discussion APIs
- `GET /api/discussions` - Liste des discussions (avec filtres)
- `POST /api/discussions` - Créer une nouvelle discussion
- `GET /api/discussions/:discussionId` - Détails d'une discussion
- `PUT /api/discussions/:discussionId` - Modifier une discussion
- `DELETE /api/discussions/:discussionId` - Supprimer une discussion
- `POST /api/discussions/:discussionId/reply` - Répondre à une discussion
- `PUT /api/discussions/:discussionId/solve` - Marquer comme résolu

### Notifications APIs
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/:notifId/read` - Marquer comme lu
- `DELETE /api/notifications/:notifId` - Supprimer une notification

## 2. Data Models (MongoDB Collections)

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String (URL),
  bio: String,
  joined: Date,
  reputation: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Subjects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String (URL),
  description: String,
  color: String,
  createdAt: Date
}
```

### Resources Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: ObjectId (ref: Subjects),
  author: ObjectId (ref: Users),
  type: String (pdf, video, etc.),
  fileUrl: String,
  likes: Number,
  views: Number,
  likedBy: [ObjectId] (ref: Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Quizzes Collection
```javascript
{
  _id: ObjectId,
  title: String,
  subject: ObjectId (ref: Subjects),
  author: ObjectId (ref: Users),
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  duration: Number (minutes),
  difficulty: String (Facile, Moyen, Difficile),
  attempts: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Flashcards Collection
```javascript
{
  _id: ObjectId,
  title: String,
  subject: ObjectId (ref: Subjects),
  author: ObjectId (ref: Users),
  cards: [{
    front: String,
    back: String
  }],
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Discussions Collection
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  subject: ObjectId (ref: Subjects),
  author: ObjectId (ref: Users),
  replies: [{
    author: ObjectId (ref: Users),
    content: String,
    createdAt: Date
  }],
  views: Number,
  solved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: Users),
  type: String (quiz, resource, message, flashcard),
  title: String,
  message: String,
  link: String,
  read: Boolean,
  createdAt: Date
}
```

## 3. Mock Data à remplacer

Fichier: `/app/frontend/src/utils/mockData.js`

Données mockées actuellement:
- `subjects` - Sera remplacé par appel API `/api/subjects`
- `resources` - Sera remplacé par appel API `/api/resources`
- `quizzes` - Sera remplacé par appel API `/api/quizzes`
- `flashcards` - Sera remplacé par appel API `/api/flashcards`
- `discussions` - Sera remplacé par appel API `/api/discussions`
- `notifications` - Sera remplacé par appel API `/api/notifications`
- `userProfile` - Sera remplacé par appel API `/api/auth/me`

## 4. Frontend Integration Plan

### Étapes d'intégration:

1. **Créer un contexte d'authentification** (`AuthContext.jsx`)
   - Gérer l'état de l'utilisateur connecté
   - Stocker le token JWT dans localStorage
   - Fournir les fonctions login/logout/register

2. **Créer un service API** (`services/api.js`)
   - Axios instance avec base URL
   - Intercepteur pour ajouter le token JWT
   - Fonctions pour toutes les API calls

3. **Remplacer les mock data**
   - Dans chaque composant, remplacer `import { data } from mockData` par des appels API
   - Utiliser useState/useEffect pour charger les données
   - Gérer les états de chargement et erreurs

4. **Implémenter les formulaires**
   - Formulaire de connexion/inscription
   - Formulaire de création de ressources
   - Formulaire de création de quiz/flashcards
   - Formulaire de création de discussions

5. **Notifications en temps réel**
   - Utiliser polling pour vérifier les nouvelles notifications
   - Mettre à jour le badge de notification

## 5. Backend Implementation Order

1. **Phase 1: Setup & Auth**
   - Configuration MongoDB
   - Modèles de base (User, Subject)
   - APIs d'authentification (register, login, me)
   - Middleware d'authentification JWT

2. **Phase 2: Core Features**
   - Modèles Resources, Quizzes, Flashcards
   - APIs CRUD pour resources, quizzes, flashcards
   - Upload de fichiers

3. **Phase 3: Community**
   - Modèle Discussions
   - APIs discussions et réponses
   - Système de résolution

4. **Phase 4: Notifications**
   - Modèle Notifications
   - APIs notifications
   - Création automatique de notifications lors d'actions

5. **Phase 5: Advanced Features**
   - Système de likes
   - Compteurs de vues
   - Statistiques utilisateur
   - Système de réputation

## 6. File Upload Strategy

Pour gérer les uploads de fichiers (PDF, images, etc.):
- Utiliser `multer` pour le traitement des fichiers
- Stocker les fichiers dans `/app/backend/uploads`
- Servir les fichiers statiques via FastAPI
- Valider type et taille des fichiers

## 7. Security Considerations

- Hash des mots de passe avec bcrypt
- Validation des inputs
- Protection CSRF
- Rate limiting pour les APIs
- Validation des types de fichiers uploadés
- Sanitization des contenus HTML

## 8. Frontend State Management

- Utiliser React Context pour l'authentification
- useState/useEffect pour les données API
- Gérer les états de chargement avec des spinners
- Afficher des messages d'erreur avec toast
- Optimistic updates pour une meilleure UX
