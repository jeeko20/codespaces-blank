import React from 'react';
import { Target, Users, Heart, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Notre mission',
      description: 'Faciliter l\'apprentissage et le partage de connaissances entre étudiants en informatique.'
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Créer un espace collaboratif où chacun peut contribuer et progresser ensemble.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Animés par la passion de l\'enseignement et du partage de connaissances.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Utiliser les dernières technologies pour offrir la meilleure expérience d\'apprentissage.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">À propos d'Eudushare</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Eudushare est né de la volonté de créer une plateforme collaborative permettant aux étudiants 
            en informatique de partager leurs connaissances, ressources et expériences.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre histoire</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Eudushare a été créé en 2024 par un groupe d'étudiants en informatique qui ont identifié 
              le besoin d'une plateforme centralisée pour partager des ressources éducatives.
            </p>
            <p>
              Nous avons commencé avec une simple idée : permettre aux étudiants de partager leurs notes 
              et tutoriels. Aujourd'hui, Eudushare est devenu une communauté active où des milliers 
              d'étudiants collaborent quotidiennement.
            </p>
            <p>
              Notre plateforme offre désormais des fonctionnalités avancées comme la création de quiz, 
              de flashcards, des forums de discussion, et bien plus encore.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 mb-2">5000+</p>
            <p className="text-xl text-gray-600">Étudiants actifs</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 mb-2">2000+</p>
            <p className="text-xl text-gray-600">Ressources partagées</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 mb-2">500+</p>
            <p className="text-xl text-gray-600">Quiz créés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
