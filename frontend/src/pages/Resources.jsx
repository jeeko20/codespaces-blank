import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Heart, Eye, Filter } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';
import { resourceAPI, subjectAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const Resources = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    type: 'pdf',
    file_url: '',
    thumbnail_url: ''
  });
  const [uploading, setUploading] = useState(false);

  // Load resources and subjects
  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesData, subjectsData] = await Promise.all([
        resourceAPI.getAll({ subject_id: selectedSubject === 'all' ? undefined : selectedSubject }),
        subjectAPI.getAll()
      ]);
      setResources(resourcesData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les ressources',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Non connecté',
        description: 'Vous devez être connecté pour partager une ressource',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      await resourceAPI.create(formData);
      toast({
        title: 'Ressource partagée!',
        description: 'Votre ressource a été partagée avec succès'
      });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        type: 'pdf',
        file_url: '',
        thumbnail_url: ''
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.detail || 'Impossible de partager la ressource',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (resourceId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Non connecté',
        description: 'Vous devez être connecté pour aimer une ressource',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await resourceAPI.like(resourceId);
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, likes: result.likes, liked_by: result.liked ? [...r.liked_by, user.id] : r.liked_by.filter(id => id !== user.id) }
          : r
      ));
    } catch (error) {
      console.error('Failed to like resource:', error);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Matière inconnue';
  };

  const getSubjectColor = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#3B82F6';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Ressources</h1>
            <p className="text-gray-600 mt-2">
              {filteredResources.length} ressource{filteredResources.length !== 1 ? 's' : ''} disponible{filteredResources.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {isAuthenticated && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Partager une ressource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Partager une nouvelle ressource</DialogTitle>
                  <DialogDescription>
                    Partagez vos notes, PDF, vidéos ou tout autre contenu éducatif
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Cours d'algorithmique"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Décrivez votre ressource..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Matière *</Label>
                    <Select 
                      value={formData.subject_id} 
                      onValueChange={(value) => setFormData({...formData, subject_id: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.icon} {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type de ressource *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL du fichier (Cloudinary) *</Label>
                    <Input
                      value={formData.file_url}
                      onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                      placeholder="https://res.cloudinary.com/..."
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Uploadez votre fichier sur Cloudinary et collez l'URL ici
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL de la miniature (optionnel)</Label>
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={uploading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {uploading ? 'Partage en cours...' : 'Partager'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Rechercher une ressource..."
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

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des ressources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSubject !== 'all' 
                ? 'Aucune ressource trouvée avec ces critères'
                : 'Aucune ressource disponible pour le moment'}
            </p>
            {isAuthenticated && (
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Partager la première ressource
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const isLiked = isAuthenticated && resource.liked_by?.includes(user?.id);
              
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  {resource.thumbnail_url && (
                    <div className="w-full h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={resource.thumbnail_url} 
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: `${getSubjectColor(resource.subject_id)}20`, color: getSubjectColor(resource.subject_id) }}
                      >
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {resource.description || 'Pas de description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="outline" style={{ borderColor: getSubjectColor(resource.subject_id) }}>
                          {getSubjectName(resource.subject_id)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Par {resource.author_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {resource.views}
                          </span>
                          <button 
                            onClick={() => handleLike(resource.id)}
                            className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
                            disabled={!isAuthenticated}
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                            {resource.likes}
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        asChild
                      >
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
