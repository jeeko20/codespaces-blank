# Eudushare - Guide de Déploiement

## 📋 Vue d'ensemble

Eudushare est une plateforme éducative collaborative permettant aux étudiants de:
- Partager des ressources (PDF, vidéos)
- Créer des quiz et flashcards
- Participer à des discussions
- Recevoir des notifications en temps réel
- Gérer leur profil et statistiques

## 🏗️ Architecture

**Frontend**: React 19 + Tailwind CSS + shadcn/ui
**Backend**: Supabase (PostgreSQL + Auth + Storage)
**Stockage de fichiers**: Cloudinary
**Déploiement**: Votre propre hébergement

## 📦 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd eudushare
cd frontend
```

### 2. Installer les dépendances
```bash
yarn install
```

### 3. Configuration des variables d'environnement

Créez un fichier `.env` à la racine de `/frontend` en copiant `.env.example`:

```bash
cp .env.example .env
```

Puis remplissez les valeurs:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre_clé_anon_ici

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=votre_cloud_name
REACT_APP_CLOUDINARY_API_KEY=votre_api_key
REACT_APP_CLOUDINARY_UPLOAD_PRESET=votre_preset

# Backend URL
REACT_APP_BACKEND_URL=http://localhost:3000
```

## 🗄️ Configuration Supabase

### 1. Créer un projet Supabase

Allez sur [supabase.com](https://supabase.com) et créez un nouveau projet.

### 2. Créer les tables

Exécutez les scripts SQL suivants dans l'éditeur SQL de Supabase:

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des matières
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  color TEXT,
  resource_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des ressources
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'pdf', 'video', etc.
  file_url TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des quiz
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]',
  duration INTEGER, -- en minutes
  difficulty TEXT, -- 'Facile', 'Moyen', 'Difficile'
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des flashcards
CREATE TABLE flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cards JSONB NOT NULL DEFAULT '[]',
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des discussions
CREATE TABLE discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  solved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses aux discussions
CREATE TABLE discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'quiz', 'resource', 'message', 'flashcard'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des likes
CREATE TABLE resource_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

-- Trigger pour créer un profil automatiquement après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indices pour améliorer les performances
CREATE INDEX idx_resources_subject ON resources(subject_id);
CREATE INDEX idx_resources_author ON resources(author_id);
CREATE INDEX idx_quizzes_subject ON quizzes(subject_id);
CREATE INDEX idx_quizzes_author ON quizzes(author_id);
CREATE INDEX idx_discussions_subject ON discussions(subject_id);
CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### 3. Configurer les politiques de sécurité (RLS)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour resources
CREATE POLICY "Resources are viewable by everyone"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create resources"
  ON resources FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  USING (auth.uid() = author_id);

-- Politiques similaires pour quiz, flashcards, discussions
-- (Répéter le pattern ci-dessus pour chaque table)

-- Politiques pour notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4. Insérer les matières par défaut

```sql
INSERT INTO subjects (name, icon, description, color) VALUES
  ('HTML', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', 'Apprenez les bases du développement web avec HTML.', '#E34F26'),
  ('CSS', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', 'Améliorez l''apparence de vos pages web avec CSS.', '#1572B6'),
  ('JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', 'Rendez vos pages web dynamiques avec JavaScript.', '#F7DF1E'),
  ('C++', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg', 'Apprenez la programmation orientée objet avec C++.', '#00599C'),
  ('Python', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', 'Découvrez la puissance et la simplicité de Python.', '#3776AB'),
  ('Base de données', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', 'SQL, NoSQL et conception de bases de données.', '#47A248'),
  ('Systèmes d''exploitation', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', 'Découvrez le fonctionnement des OS et leur gestion.', '#FCC624'),
  ('Algorithmes', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', 'Complexité algorithmique et structures de données.', '#F05032');
```

## ☁️ Configuration Cloudinary

### 1. Créer un compte Cloudinary

Allez sur [cloudinary.com](https://cloudinary.com) et créez un compte gratuit.

### 2. Créer un Upload Preset

1. Dans votre dashboard Cloudinary, allez dans **Settings** > **Upload**
2. Scroll jusqu'à **Upload presets**
3. Cliquez sur **Add upload preset**
4. Configurez:
   - **Signing Mode**: Unsigned (pour upload direct depuis le frontend)
   - **Folder**: eudushare (optionnel)
   - Activez les transformations si nécessaire
5. Sauvegardez et notez le nom du preset

### 3. Récupérer vos clés

Dans votre dashboard:
- **Cloud name**: visible en haut à gauche
- **API Key**: dans Settings > Security
- **Upload Preset**: celui que vous venez de créer

## 🚀 Lancement en développement

```bash
yarn start
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Build pour production

```bash
yarn build
```

Les fichiers de production seront dans le dossier `build/`

## 🌐 Déploiement

### Option 1: Vercel

1. Installez Vercel CLI: `npm i -g vercel`
2. Dans le dossier frontend: `vercel`
3. Suivez les instructions
4. Ajoutez vos variables d'environnement dans le dashboard Vercel

### Option 2: Netlify

1. Installez Netlify CLI: `npm i -g netlify-cli`
2. Dans le dossier frontend: `netlify deploy --prod`
3. Ajoutez vos variables d'environnement dans le dashboard Netlify

### Option 3: Serveur traditionnel

1. Build: `yarn build`
2. Servez les fichiers du dossier `build/` avec nginx ou apache
3. Configuration nginx exemple:

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Structure des fichiers

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Composants shadcn
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Gestion authentification
│   ├── hooks/
│   │   └── use-toast.js
│   ├── lib/
│   │   ├── supabase.js      # Client Supabase
│   │   └── cloudinary.js    # Upload Cloudinary
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Community.jsx
│   │   ├── Resources.jsx
│   │   ├── Quiz.jsx
│   │   ├── MyNotes.jsx
│   │   ├── Profile.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── utils/
│   │   └── mockData.js      # Données de test
│   ├── App.js
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## 🔐 Sécurité

**Important**: Ne commitez JAMAIS votre fichier `.env` avec les vraies clés!

Ajoutez toujours `.env` dans votre `.gitignore`:

```
.env
.env.local
.env.production
```

## 📝 Fonctionnalités implémentées

✅ Interface complète (10 pages)
✅ Système d'authentification (Supabase Auth)
✅ Upload de fichiers (Cloudinary)
✅ Design responsive avec animations
✅ Composants UI modernes (shadcn)
✅ Navigation et routing
✅ Système de notifications
✅ Gestion de profil utilisateur

## 🎨 Personnalisation

### Changer les couleurs

Éditez `/frontend/src/index.css` et modifiez les variables CSS:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Bleu par défaut */
  /* Autres couleurs... */
}
```

### Ajouter une nouvelle page

1. Créez le composant dans `src/pages/`
2. Ajoutez la route dans `src/App.js`
3. Ajoutez le lien dans `src/components/Navbar.jsx`

## 🐛 Débogage

### Problème de connexion Supabase

Vérifiez:
- URL Supabase correcte dans `.env`
- Clé anon key valide
- RLS activé et politiques configurées

### Problème d'upload Cloudinary

Vérifiez:
- Upload preset en mode "unsigned"
- Cloud name correct
- CORS activé dans les settings Cloudinary

## 📞 Support

Pour toute question ou problème:
- Email: contact@eudushare.com
- GitHub Issues: [lien vers votre repo]

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails

---

**Développé avec ❤️ pour la communauté étudiante**
