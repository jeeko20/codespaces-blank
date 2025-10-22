import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Library, Users, Share2, Brain, CreditCard, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { statisticsAPI, subjectAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, subjectsData] = await Promise.all([
          statisticsAPI.getAll(),
          subjectAPI.getAll()
        ]);
        setStats(statsData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const features = [
    {
      icon: Library,
      title: 'Bibliothèque de ressources',
      description: 'Accédez à une vaste collection de notes, tutoriels et projets partagés par la communauté.'
    },
    {
      icon: Users,
      title: 'Communauté active',
      description: 'Rejoignez des forums de discussion, collaborez sur des projets et échangez avec d\'autres étudiants.'
    },
    {
      icon: Share2,
      title: 'Partage facile',
      description: 'Téléchargez et partagez vos propres notes et ressources en quelques clics.'
    },
    {
      icon: Brain,
      title: 'Quiz interactifs',
      description: 'Créez et participez à des quiz pour tester vos connaissances et progresser.'
    },
    {
      icon: CreditCard,
      title: 'Flashcards',
      description: 'Mémorisez efficacement avec des flashcards personnalisées et partagées.'
    },
    {
      icon: Bell,
      title: 'Notifications en temps réel',
      description: 'Restez informé des nouvelles ressources, quiz et messages de la communauté.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[500px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 animate-fade-in" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            UnivLoop - La boucle universitaire
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-up stagger-1">
            Tout ce qui se passe sur le campus revient vers vous en permanence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            {isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 hover:scale-105 transform transition-all duration-300 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl"
                  asChild
                >
                  <Link to="/quiz">Créer un quiz / flashcard</Link>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 hover:scale-105 transform transition-all duration-300 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl"
                  asChild
                >
                  <Link to="/resources">Partager une ressource</Link>
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                className="bg-white text-blue-900 hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl"
              >
                Commencer maintenant
              </Button>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 hover:scale-105 transform transition-all duration-300 border-2 border-white text-white font-semibold px-8 py-6 text-lg backdrop-blur-sm shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to="/community">Rejoindre la communauté</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {stats && (
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">{stats.total_users}</p>
                <p className="text-gray-600">Étudiants</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-600 mb-2">{stats.total_resources}</p>
                <p className="text-gray-600">Ressources</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">{stats.total_discussions}</p>
                <p className="text-gray-600">Discussions</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-600 mb-2">{stats.total_quizzes}</p>
                <p className="text-gray-600">Quiz</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-pink-600 mb-2">{stats.total_flashcards}</p>
                <p className="text-gray-600">Flashcards</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">{stats.total_subjects}</p>
                <p className="text-gray-600">Matières</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subjects Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explorez les matières</h2>
            <p className="text-xl text-gray-600">
              Découvrez toutes les ressources disponibles organisées par matière
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.slice(0, 8).map((subject, index) => (
              <Link
                key={subject.id}
                to={`/resources?subject=${subject.id}`}
                className={`p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover-lift animate-scale-in stagger-${Math.min(index % 6 + 1, 6)}`}
                style={{ backgroundColor: `${subject.color}15` }}
              >
                <div className="text-4xl mb-3">{subject.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: subject.color }}>
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="text-gray-600 text-sm">{subject.description}</p>
                )}
              </Link>
            ))}
          </div>

          {subjects.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to="/subjects">
                  Voir toutes les matières <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Toutes les fonctionnalités</h2>
            <p className="text-xl text-gray-600">
              UnivLoop connecte toute l'université dans une boucle d'information permanente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover-lift animate-scale-in stagger-${Math.min(index % 6 + 1, 6)}`}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 transition-all duration-500 hover:bg-blue-200 hover:rotate-12 hover:scale-110">
                    <Icon className="h-6 w-6 text-blue-600 transition-transform duration-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Rejoignez la communauté</h2>
            <p className="text-xl text-gray-600">
              Échangez avec d'autres étudiants et enrichissez vos connaissances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg hover-lift animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-2xl">Discussions actives</CardTitle>
                <CardDescription>
                  Posez vos questions, participez aux débats et aidez les autres étudiants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/community">
                    Voir les discussions <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover-lift animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-2xl">Partagez vos ressources</CardTitle>
                <CardDescription>
                  Découvrez les dernières ressources partagées par la communauté.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <Link to="/resources">
                    Explorez les partages <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8">
            Rejoignez UnivLoop aujourd'hui et restez connecté à tout ce qui se passe sur votre campus !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/about">En savoir plus</Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                S'inscrire maintenant
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
