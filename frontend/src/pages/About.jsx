import React from 'react';
import { Target, Users, Heart, Zap, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Notre mission',
      description: 'Créer une boucle universitaire où tout ce qui se passe sur le campus revient vers les étudiants en permanence.'
    },
    {
      icon: Users,
      title: 'Communauté connectée',
      description: 'UnivLoop connecte toute l\'université dans un fil d\'actualité qui boucle en permanence.'
    },
    {
      icon: Heart,
      title: 'Partage',
      description: 'Partagez vos ressources, notes, quiz et flashcards avec toute la communauté universitaire.'
    },
    {
      icon: Zap,
      title: 'En temps réel',
      description: 'Restez informé de toutes les activités du campus grâce aux notifications en temps réel.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section with Developer Photo */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src="https://res.cloudinary.com/ddzx1fktv/image/upload/v1760454872/edushare/ressources/1760358751019.jpg.png" 
              alt="Développeur UnivLoop"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">À propos d'UnivLoop</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            <strong>UnivLoop</strong> - La boucle universitaire : tout ce qui se passe sur le campus 
            tourne en boucle et revient vers les étudiants.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Le fil d'actualité qui boucle en permanence pour connecter toute l'université.
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

        {/* What UnivLoop Does */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ce que fait UnivLoop</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>UnivLoop</strong> est une plateforme collaborative conçue spécialement pour les 
              étudiants universitaires. Elle permet de :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Partager des ressources éducatives (notes, PDF, vidéos, documents)</li>
              <li>Créer et participer à des quiz et flashcards pour réviser</li>
              <li>Rejoindre des groupes selon votre filière et niveau d'études</li>
              <li>Participer aux discussions globales ou spécifiques à votre département</li>
              <li>Recevoir des notifications sur toutes les nouvelles activités du campus</li>
              <li>Créer des catégories personnalisées pour organiser le contenu</li>
            </ul>
            <p className="mt-6">
              Tout le contenu est dynamique et généré par les étudiants eux-mêmes, créant ainsi 
              une véritable boucle d'information au sein de votre université.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Contactez-nous</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6" />
              <a href="mailto:jeekothebest@gmail.com" className="text-lg hover:underline">
                jeekothebest@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6" />
              <a href="tel:+50933970083" className="text-lg hover:underline">
                +509 3397 0083
              </a>
            </div>
          </div>
          <p className="text-center mt-6 text-blue-100">
            Pour toute question, suggestion ou problème technique, n'hésitez pas à nous contacter !
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
