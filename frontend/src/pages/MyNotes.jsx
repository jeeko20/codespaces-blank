import React, { useState } from 'react';
import { Plus, FileText, Video, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const MyNotes = () => {
  const [notes] = useState([
    {
      id: 1,
      title: 'Introduction à React',
      subject: 'JavaScript',
      type: 'note',
      content: 'Mes notes sur les bases de React...',
      date: '2025-01-15',
      views: 45
    },
    {
      id: 2,
      title: 'Quiz CSS Flexbox',
      subject: 'CSS',
      type: 'quiz',
      questions: 10,
      date: '2025-01-14',
      attempts: 23
    },
    {
      id: 3,
      title: 'Flashcards HTML',
      subject: 'HTML',
      type: 'flashcard',
      cardCount: 15,
      date: '2025-01-13',
      views: 67
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes notes</h1>
            <p className="text-xl text-gray-600">Gérez toutes vos ressources personnelles</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Créer une note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle note</DialogTitle>
                <DialogDescription>
                  Créez et partagez vos notes avec la communauté
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" placeholder="Titre de votre note" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Matière</Label>
                  <select 
                    id="subject"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>Sélectionnez une matière</option>
                    <option>HTML</option>
                    <option>CSS</option>
                    <option>JavaScript</option>
                    <option>C++</option>
                    <option>Python</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Contenu</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Écrivez votre note ici..." 
                    className="min-h-[200px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file">Fichier (optionnel)</Label>
                  <Input id="file" type="file" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Annuler</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Créer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map(note => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{note.subject}</Badge>
                      <Badge>
                        {note.type === 'note' && 'Note'}
                        {note.type === 'quiz' && 'Quiz'}
                        {note.type === 'flashcard' && 'Flashcard'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{note.title}</CardTitle>
                    <CardDescription>
                      Créé le {new Date(note.date).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {note.type === 'note' && (
                      <p className="text-sm text-gray-600 mb-4">{note.content}</p>
                    )}
                    {note.type === 'quiz' && (
                      <p className="text-sm text-gray-600 mb-4">
                        {note.questions} questions · {note.attempts} tentatives
                      </p>
                    )}
                    {note.type === 'flashcard' && (
                      <p className="text-sm text-gray-600 mb-4">
                        {note.cardCount} cartes · {note.views} vues
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.filter(n => n.type === 'note').map(note => (
                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{note.subject}</Badge>
                      <Badge>Note</Badge>
                    </div>
                    <CardTitle className="text-xl">{note.title}</CardTitle>
                    <CardDescription>
                      Créé le {new Date(note.date).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{note.content}</p>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun quiz créé</p>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun flashcard créé</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyNotes;
