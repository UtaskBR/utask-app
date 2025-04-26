'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';

export default function FavoritosPage() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar favoritos');
        }
        
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        toast.error('Não foi possível carregar seus favoritos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, []);

  const removeFavorite = async (favoriteId) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao remover favorito');
      }
      
      // Atualizar o estado local
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast.success('Removido dos favoritos');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Não foi possível remover dos favoritos');
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">Meus Favoritos</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-medium text-secondary-900 mb-2">Nenhum favorito</h3>
            <p className="text-secondary-600 mb-6">
              Você ainda não adicionou nenhum serviço aos favoritos.
            </p>
            <Link href="/explorar" className="btn-primary py-2 px-4">
              Explorar Serviços
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="h-40 bg-secondary-200 flex items-center justify-center">
                  <span className="text-secondary-400">Imagem do Serviço</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-secondary-900">{favorite.service.title}</h3>
                    {favorite.service.value ? (
                      <span className="text-primary-600 font-bold">
                        R$ {favorite.service.value.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-secondary-600 text-sm">
                        Aberto a propostas
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-2 text-secondary-600 line-clamp-2">{favorite.service.description}</p>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {favorite.service.creator.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary-900">{favorite.service.creator.name}</p>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-sm text-secondary-600">{favorite.service.creator.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {favorite.service.profession && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {favorite.service.profession.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-between">
                    <Link href={`/servicos/${favorite.service.id}`} className="btn-primary py-2 px-4">
                      Ver Detalhes
                    </Link>
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
