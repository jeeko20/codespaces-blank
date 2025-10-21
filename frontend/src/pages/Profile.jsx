import React from 'react';
import { Mail, Calendar, Award, BookOpen, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { userProfile, resources, quizzes, discussions } from '../utils/mockData';

const Profile = () => {
  const stats = [
    { label: 'Ressources partagées', value: userProfile.resourcesShared, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Quiz créés', value: userProfile.quizzesCreated, icon: Award, color: 'text-green-600' },
    { label: 'Flashcards créés', value: userProfile.flashcardsCreated, icon: Award, color: 'text-purple-600' },
    { label: 'Discussions', value: userProfile.discussionsStarted, icon: MessageSquare, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {new Date(userProfile.joined).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{userProfile.bio}</p>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Badge className="bg-blue-600 text-white flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>{userProfile.reputation} points de réputation</span>
                  </Badge>
                </div>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700">
                Modifier le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="resources" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="resources">Mes ressources</TabsTrigger>
            <TabsTrigger value="quiz">Mes quiz</TabsTrigger>
            <TabsTrigger value="discussions">Mes discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="mt-6">
            <div className="space-y-4">
              {resources.slice(0, 3).map(resource => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.subject} · {new Date(resource.date).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{resource.likes} likes</span>
                        <span>{resource.views} vues</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <div className="space-y-4">
              {quizzes.slice(0, 3).map(quiz => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.subject} · {quiz.questions} questions · {quiz.attempts} tentatives
                        </CardDescription>
                      </div>
                      <Badge>{quiz.difficulty}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="discussions" className="mt-6">
            <div className="space-y-4">
              {discussions.slice(0, 3).map(discussion => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{discussion.title}</CardTitle>
                        <CardDescription>
                          {discussion.subject} · {discussion.replies} réponses · {discussion.views} vues
                        </CardDescription>
                      </div>
                      {discussion.solved && (
                        <Badge className="bg-green-100 text-green-800">Résolu</Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
