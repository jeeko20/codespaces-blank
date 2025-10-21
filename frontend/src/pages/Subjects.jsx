import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { subjects } from '../utils/mockData';

const Subjects = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Toutes les matières</h1>
          <p className="text-xl text-gray-600">
            Explorez toutes les ressources disponibles organisées par matière
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.id} to={`/subject/${subject.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                <CardHeader>
                  <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100 transition-all mx-auto">
                    <img src={subject.icon} alt={subject.name} className="w-16 h-16" />
                  </div>
                  <CardTitle className="text-xl text-center">{subject.name}</CardTitle>
                  <CardDescription className="text-center">
                    {subject.resourceCount} ressources disponibles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 text-center">{subject.description}</p>
                  <div className="flex flex-col space-y-2">
                    <Badge variant="secondary" className="text-xs justify-center">
                      Mis à jour récemment
                    </Badge>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-300"
                    >
                      Explorer <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
