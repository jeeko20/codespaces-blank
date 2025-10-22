import React from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600">
            Une question, une suggestion ? N'hésitez pas à nous contacter !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:jeekothebest@gmail.com" className="text-blue-600 hover:underline font-medium">
                jeekothebest@gmail.com
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Nous répondons généralement sous 24-48 heures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Téléphone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="tel:+50933970083" className="text-blue-600 hover:underline font-medium">
                +509 3397 0083
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Disponible du lundi au vendredi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" placeholder="Sujet de votre message" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Écrivez votre message ici..." 
                  className="min-h-[200px]"
                />
              </div>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
