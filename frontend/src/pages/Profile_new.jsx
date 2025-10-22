import React, { useState, useEffect } from 'react';
import { User, Mail, Building, GraduationCap, Calendar, Edit2, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    faculty: '',
    year_of_study: '',
    avatar: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profile = await userAPI.getUser(user.id);
      setUserProfile(profile);
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        department: profile.department || '',
        faculty: profile.faculty || '',
        year_of_study: profile.year_of_study || '',
        avatar: profile.avatar || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le profil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== (userProfile[key] || '')) {
          updates[key] = formData[key] || null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await updateProfile(user.id, updates);
        await loadProfile();
      }
      
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        department: userProfile.department || '',
        faculty: userProfile.faculty || '',
        year_of_study: userProfile.year_of_study || '',
        avatar: userProfile.avatar || ''
      });
    }
    setEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Non connecté</CardTitle>
            <CardDescription>
              Vous devez être connecté pour voir votre profil
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <Card className="mb-6">
          <CardHeader className="relative">
            <div className="absolute top-6 right-6">
              {editing ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
            
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-2xl">{userProfile.name[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Nom complet</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label>URL de la photo de profil (Cloudinary)</Label>
                      <Input
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        placeholder="https://res.cloudinary.com/..."
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      <span>{userProfile.email}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Membre depuis {formatDistanceToNow(new Date(userProfile.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{userProfile.resources_count}</p>
                <p className="text-sm text-gray-600">Ressources</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{userProfile.discussions_count}</p>
                <p className="text-sm text-gray-600">Discussions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{userProfile.comments_count}</p>
                <p className="text-sm text-gray-600">Commentaires</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{userProfile.reputation}</p>
                <p className="text-sm text-gray-600">Réputation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations académiques</CardTitle>
            <CardDescription>
              Vos informations académiques et biographie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label>Département</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Ex: Informatique, Médecine, Droit..."
                  />
                </div>
                
                <div>
                  <Label>Faculté</Label>
                  <Input
                    value={formData.faculty}
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    placeholder="Ex: Sciences, Médecine, Lettres..."
                  />
                </div>
                
                <div>
                  <Label>Année d'études</Label>
                  <Select 
                    value={formData.year_of_study} 
                    onValueChange={(value) => setFormData({...formData, year_of_study: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non spécifié</SelectItem>
                      <SelectItem value="L1">Licence 1</SelectItem>
                      <SelectItem value="L2">Licence 2</SelectItem>
                      <SelectItem value="L3">Licence 3</SelectItem>
                      <SelectItem value="M1">Master 1</SelectItem>
                      <SelectItem value="M2">Master 2</SelectItem>
                      <SelectItem value="Doctorat">Doctorat</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Biographie</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Parlez-nous de vous..."
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userProfile.department && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-medium">{userProfile.department}</p>
                    </div>
                  </div>
                )}
                
                {userProfile.faculty && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Faculté</p>
                      <p className="font-medium">{userProfile.faculty}</p>
                    </div>
                  </div>
                )}
                
                {userProfile.year_of_study && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Année d'études</p>
                      <p className="font-medium">{userProfile.year_of_study}</p>
                    </div>
                  </div>
                )}
                
                {!userProfile.department && !userProfile.faculty && !userProfile.year_of_study && (
                  <p className="text-gray-500 text-center py-4">
                    Aucune information académique renseignée
                  </p>
                )}
                
                {userProfile.bio && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Biographie</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
