'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';
import Image from 'next/image'; // Added for user images

// Define the new interface for User Favorites
interface UserFavorite {
  id: string; // This is the ID of the UserFavorite record itself
  favoritedUser: {
    id: string; // This is the actual ID of the favorited user
    name?: string | null;
    image?: string | null;
    // Consider adding professions or other relevant details if returned by API and needed for display
  };
}

export default function FavoritosPage() {
  const { data: session } = useSession();
  // Renamed state variables
  const [userFavorites, setUserFavorites] = useState<UserFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Renamed function and updated API endpoint
    const fetchUserFavorites = async () => {
      setIsLoading(true); // Ensure loading state is true at the start of fetch
      try {
        const response = await fetch('/api/user-favorites'); // Changed endpoint
        
        if (!response.ok) {
          throw new Error('Erro ao buscar usuários favoritos');
        }
        
        const data = await response.json();
        setUserFavorites(data || []); // Ensure data is an array, or default to empty
      } catch (error) {
        console.error('Erro ao buscar usuários favoritos:', error);
        toast.error('Não foi possível carregar seus usuários favoritos');
        setUserFavorites([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch only if session is available, otherwise, AuthGuard should handle it
    if (session) {
      fetchUserFavorites();
    } else {
      // Handle case where session is not yet available but might become so
      // For now, this might mean a flicker or relying on AuthGuard to redirect.
      // Alternatively, disable fetching or show a specific message.
      // Let's assume AuthGuard handles unauthenticated state.
      setIsLoading(false); // Stop loading if no session
    }
  }, [session]); // Depend on session to refetch if it changes

  // Renamed function and updated logic
  const removeUserFavorite = async (favoritedUserIdToDelete: string): Promise<void> => {
    try {
      // The API expects the ID of the user being unfavorited
      const response = await fetch(`/api/user-favorites/${favoritedUserIdToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        // Attempt to parse error message from backend if available
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Erro ao remover usuário dos favoritos');
      }
      
      // Update the local state by filtering out the unfavorited user
      setUserFavorites((prev: UserFavorite[]) => 
        prev.filter((fav: UserFavorite) => fav.favoritedUser.id !== favoritedUserIdToDelete)
      );
      
      toast.success('Usuário removido dos favoritos');
    } catch (error) {
      console.error('Erro ao remover usuário dos favoritos:', error);
      toast.error(error instanceof Error ? error.message : 'Não foi possível remover o usuário dos favoritos');
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 mb-8">Meus Usuários Favoritos</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando favoritos...</p> {/* Kept generic loading message */}
          </div>
        ) : userFavorites.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-8 text-center">
            {/* User icon example (FontAwesome-like, needs actual SVG or library) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h3 className="text-xl font-medium text-secondary-900 mb-2">Nenhum usuário favorito</h3>
            <p className="text-secondary-600 mb-6">
              Você ainda não adicionou nenhum usuário aos favoritos.
            </p>
            {/* Link to a page where users can be found */}
            <Link href="/buscar-profissionais" className="btn-primary py-2 px-4">
              Encontrar Profissionais
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userFavorites.map((favorite) => (
              <div key={favorite.id} className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 flex flex-col items-center text-center">
                  <Image 
                    src={favorite.favoritedUser.image || '/img/avatar_placeholder.png'} 
                    alt={favorite.favoritedUser.name || 'Avatar'} 
                    width={96} // Equivalent to h-24 w-24
                    height={96}
                    className="rounded-full object-cover mb-4"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/avatar_placeholder.png'; }}
                  />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-1">{favorite.favoritedUser.name || 'Nome não disponível'}</h3>
                  {/* Optionally, add more details like profession here if available */}
                  {/* <p className="text-sm text-primary-600">Profession Placeholder</p> */}
                </div>
                <div className="mt-auto p-4 border-t border-gray-200 flex flex-col space-y-2">
                  <Link href={`/perfil/${favorite.favoritedUser.id}`} className="btn-outline w-full text-center py-2 px-3 text-sm">
                    Ver Perfil
                  </Link>
                  <button
                    onClick={() => removeUserFavorite(favorite.favoritedUser.id)}
                    className="btn-danger-outline w-full py-2 px-3 text-sm" // Assuming a danger outline style
                  >
                    Remover dos Favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
