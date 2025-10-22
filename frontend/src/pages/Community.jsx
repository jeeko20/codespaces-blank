import React, { useState, useEffect } from 'react';
import { Search, Plus, MessageSquare, Eye, CheckCircle2, Send, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { discussionAPI, subjectAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Community = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('global');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subject_id: '',
    group_type: 'global'
  });
  const [creating, setCreating] = useState(false);

  // Load discussions and subjects
  useEffect(() => {
    loadData();
  }, [groupFilter, selectedSubject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (groupFilter !== 'global') {
        filters.group_type = groupFilter;
        if (groupFilter === 'department' && user?.department) {
          filters.department = user.department;
        } else if (groupFilter === 'faculty' && user?.faculty) {
          filters.faculty = user.faculty;
        } else if (groupFilter === 'year' && user?.year_of_study) {
          filters.year = user.year_of_study;
        }
      }
      if (selectedSubject !== 'all') {
        filters.subject_id = selectedSubject;
      }

      const [discussionsData, subjectsData] = await Promise.all([
        discussionAPI.getAll(filters),
        subjectAPI.getAll()
      ]);
      setDiscussions(discussionsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les discussions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Non connecté',
        description: 'Vous devez être connecté pour créer une discussion',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);
    try {
      await discussionAPI.create(formData);
      toast({
        title: 'Discussion créée!',
        description: 'Votre discussion a été publiée avec succès'
      });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        content: '',
        subject_id: '',
        group_type: 'global'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de créer la discussion',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleViewDiscussion = async (discussion) => {
    try {
      const fullDiscussion = await discussionAPI.getById(discussion.id);
      setSelectedDiscussion(fullDiscussion);
      setViewDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la discussion',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || !selectedDiscussion) return;

    try {
      const newComment = await discussionAPI.addComment(selectedDiscussion.id, { content: commentText });
      setSelectedDiscussion(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));
      setCommentText('');
      toast({
        title: 'Commentaire ajouté',
        description: 'Votre commentaire a été publié'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive'
      });
    }
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGroupBadge = (groupType) => {
    switch (groupType) {
      case 'global': return <Badge variant="secondary">🌍 Global</Badge>;
      case 'department': return <Badge variant="secondary">🏢 Département</Badge>;
      case 'faculty': return <Badge variant="secondary">🎓 Faculté</Badge>;
      case 'year': return <Badge variant="secondary">📚 Année</Badge>;
      default: return <Badge variant="secondary">Groupe</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Communauté</h1>
            <p className="text-gray-600 mt-2">
              {filteredDiscussions.length} discussion{filteredDiscussions.length !== 1 ? 's' : ''} active{filteredDiscussions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {isAuthenticated && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Créer une discussion</DialogTitle>
                  <DialogDescription>
                    Posez une question ou lancez un débat avec la communauté
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateDiscussion} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Comment résoudre ce problème d'algorithmique ?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contenu *</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Décrivez votre question ou sujet en détail..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Matière (optionnel)</Label>
                    <Select 
                      value={formData.subject_id} 
                      onValueChange={(value) => setFormData({...formData, subject_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucune matière</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.icon} {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type de groupe *</Label>
                    <Select 
                      value={formData.group_type} 
                      onValueChange={(value) => setFormData({...formData, group_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">🌍 Global (Toute l'université)</SelectItem>
                        <SelectItem value="department">🏢 Mon département {user?.department && `(${user.department})`}</SelectItem>
                        <SelectItem value="faculty">🎓 Ma faculté {user?.faculty && `(${user.faculty})`}</SelectItem>
                        <SelectItem value="year">📚 Mon année {user?.year_of_study && `(${user.year_of_study})`}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={creating} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {creating ? 'Publication...' : 'Publier'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Tabs value={groupFilter} onValueChange={setGroupFilter} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">🌍 Global</TabsTrigger>
            <TabsTrigger value="department">🏢 Département</TabsTrigger>
            <TabsTrigger value="faculty">🎓 Faculté</TabsTrigger>
            <TabsTrigger value="year">📚 Année</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Rechercher une discussion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.icon} {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des discussions...</p>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSubject !== 'all' 
                ? 'Aucune discussion trouvée avec ces critères'
                : 'Aucune discussion pour le moment'}
            </p>
            {isAuthenticated && (
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Lancer la première discussion
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDiscussion(discussion)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={discussion.author_avatar} />
                          <AvatarFallback>{discussion.author_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{discussion.author_name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2">{discussion.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {discussion.content}
                      </CardDescription>
                    </div>
                    {discussion.solved && (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 flex-wrap">
                    {getGroupBadge(discussion.group_type)}
                    {discussion.subject_name && (
                      <Badge variant="outline">{discussion.subject_name}</Badge>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 ml-auto">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {discussion.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {discussion.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Discussion Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            {selectedDiscussion && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedDiscussion.author_avatar} />
                      <AvatarFallback>{selectedDiscussion.author_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{selectedDiscussion.author_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(selectedDiscussion.created_at), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                    {selectedDiscussion.solved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Résolu
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-2xl">{selectedDiscussion.title}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getGroupBadge(selectedDiscussion.group_type)}
                    {selectedDiscussion.subject_name && (
                      <Badge variant="outline">{selectedDiscussion.subject_name}</Badge>
                    )}
                  </div>
                  
                  {/* Comments Section */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">
                      Commentaires ({selectedDiscussion.comments?.length || 0})
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      {selectedDiscussion.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author_avatar} />
                            <AvatarFallback>{comment.author_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{comment.author_name}</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {isAuthenticated ? (
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Ajouter un commentaire..."
                          className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!commentText.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Connectez-vous pour commenter
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Community;
