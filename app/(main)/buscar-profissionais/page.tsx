'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; 

interface Profession {
  id: string;
  name: string;
}

interface AppEstado {
  sigla: string;
  nome: string;
}

interface AppMunicipio {
  id: number; 
  nome: string;
}

interface UserProfile {
  id: string;
  name?: string | null; 
  image?: string | null;
  professions: string[];
  averageRating: number | null;
}

export default function BuscarProfissionaisPage() {
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('');
  const [nameQuery, setNameQuery] = useState<string>('');
  const [isLoadingProfessions, setIsLoadingProfessions] = useState<boolean>(true);

  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [statesList, setStatesList] = useState<AppEstado[]>([]);
  const [citiesList, setCitiesList] = useState<AppMunicipio[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isLoadingStates, setIsLoadingStates] = useState<boolean>(true);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfessionsData = async () => {
      setIsLoadingProfessions(true);
      try {
        const response = await fetch('/api/professions');
        if (!response.ok) {
          throw new Error('Falha ao buscar profissões');
        }
        const data = await response.json();
        setProfessions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingProfessions(false);
      }
    };
    fetchProfessionsData();
  }, []);

  useEffect(() => {
    setIsLoadingStates(true);
    fetch('/api/localidades/estados')
      .then(res => res.json())
      .then((data: AppEstado[]) => {
        setStatesList(data);
      })
      .catch(err => {
        console.error("Failed to fetch states for filters", err);
      })
      .finally(() => setIsLoadingStates(false));
  }, []);

  const fetchCitiesForFilter = async (uf: string) => {
    if (!uf) {
      setCitiesList([]);
      return;
    }
    setIsLoadingCities(true);
    try {
      const res = await fetch(`/api/localidades/estados/${uf}`); // Corrected API path
      if (!res.ok) {
        const errorText = await res.text(); 
        console.error(`[BuscarProfissionais] API error fetching cities for ${uf}: ${res.status} - ${errorText}`);
        throw new Error(`Falha ao buscar cidades: ${res.status}`);
      }
      const data: AppMunicipio[] = await res.json();
      setCitiesList(Array.isArray(data) ? data : []); 
    } catch (err) {
      console.error(`[BuscarProfissionais] Failed to fetch cities for filter for ${uf}:`, err);
      setCitiesList([]); 
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleStateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedCity(''); 
    if (newState) {
      fetchCitiesForFilter(newState);
    } else {
      setCitiesList([]);
    }
  };

  const fetchProfessionals = async (
    currentProfessionId: string,
    currentNameQuery: string,
    currentState: string, 
    currentCity: string    
  ) => {
    setIsSearching(true);
    setSearchError(null);

    const params = new URLSearchParams();
    if (currentProfessionId) {
      params.append('professionId', currentProfessionId);
    }
    if (currentNameQuery) {
      params.append('name', currentNameQuery);
    }
    if (currentState) { 
      params.append('state', currentState);
    }
    if (currentCity) { 
      params.append('city', currentCity);
    }

    try {
      const response = await fetch(`/api/users/search?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar profissionais');
      }
      const data: UserProfile[] = await response.json();
      setSearchResults(data);
    } catch (error: any) {
      console.error('Erro ao buscar profissionais:', error);
      setSearchError(error.message || 'Ocorreu um erro desconhecido.');
      setSearchResults([]); 
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isLoadingProfessions && !isLoadingStates) { 
         fetchProfessionals(selectedProfessionId, nameQuery, selectedState, selectedCity);
      }
    }, 500); 

    return () => {
      clearTimeout(handler); 
    };
  }, [selectedProfessionId, nameQuery, selectedState, selectedCity, isLoadingProfessions, isLoadingStates]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">
        Encontrar Profissionais
      </h1>

      <div className="mb-8 bg-white shadow-md rounded-lg p-6"> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
          <div>
            <label htmlFor="professionId" className="block text-sm font-medium text-secondary-700">
              Profissão
            </label>
            <select
              id="professionId"
              name="professionId"
              value={selectedProfessionId}
              onChange={(e) => setSelectedProfessionId(e.target.value)}
              className="input-field mt-1 w-full"
              disabled={isLoadingProfessions}
            >
              <option value="">{isLoadingProfessions ? "Carregando..." : "Todas as Profissões"}</option>
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nameQuery" className="block text-sm font-medium text-secondary-700">
              Nome do Profissional
            </label>
            <input
              type="text"
              id="nameQuery"
              name="nameQuery"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              className="input-field mt-1 w-full"
              placeholder="Digite o nome para buscar..."
            />
          </div>

          <div>
            <label htmlFor="selectedState" className="block text-sm font-medium text-secondary-700">
              Estado
            </label>
            <select
              id="selectedState"
              name="selectedState"
              value={selectedState}
              onChange={handleStateFilterChange}
              className="input-field mt-1 w-full"
              disabled={isLoadingStates}
            >
              <option value="">{isLoadingStates ? 'Carregando...' : 'Todos os Estados'}</option>
              {statesList.map(s => (
                <option key={s.sigla} value={s.sigla}>{s.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="selectedCity" className="block text-sm font-medium text-secondary-700">
              Cidade
            </label>
            <select
              id="selectedCity"
              name="selectedCity"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field mt-1 w-full"
              disabled={!selectedState || isLoadingCities || citiesList.length === 0}
            >
              <option value="">
                {isLoadingCities ? 'Carregando...' : (!selectedState ? 'Selecione um estado' : (citiesList.length === 0 ? 'Nenhuma cidade' : 'Todas as Cidades'))}
              </option>
              {citiesList.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      <div className="mt-8">
        {isSearching && <p className="text-center text-secondary-700 text-lg">Buscando profissionais...</p>}
        {searchError && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">Erro ao buscar: {searchError}</p>}

        {!isSearching && !searchError && searchResults.length === 0 && (selectedProfessionId || nameQuery || selectedState || selectedCity) && (
          <p className="text-center text-secondary-600 text-lg p-4 bg-blue-50 rounded-md">
            Nenhum profissional encontrado com os critérios selecionados.
          </p>
        )}
        {!isSearching && !searchError && searchResults.length === 0 && !selectedProfessionId && !nameQuery && !selectedState && !selectedCity && !isLoadingProfessions && !isLoadingStates && (
           <p className="text-center text-secondary-600 text-lg p-4 bg-gray-50 rounded-md">
            Use os filtros acima para encontrar profissionais.
          </p>
        )}

        {!isSearching && !searchError && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((user) => (
              <Link href={`/perfil/${user.id}`} key={user.id} legacyBehavior>
                <a className="card block bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow overflow-hidden transform hover:-translate-y-1">
                  <div className="p-5 flex flex-col items-center text-center">
                    <img
                      src={user.image || '/placeholder-avatar.png'}
                      alt={user.name || 'Avatar do profissional'}
                      className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-primary-100 shadow"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-avatar.png'; }}
                    />
                    <h3 className="text-xl font-semibold text-secondary-900 mb-1 leading-tight">
                      {user.name || 'Nome não disponível'}
                    </h3>
                    {user.professions && user.professions.length > 0 && (
                      <p className="text-sm text-primary-600 mb-2 h-10 overflow-hidden flex items-center justify-center" title={user.professions.join(', ')}>
                        {user.professions.join(', ').length > 60 ? user.professions.join(', ').substring(0,57) + '...' : user.professions.join(', ')}
                      </p>
                    )}
                    <div className="text-sm text-amber-500 flex items-center">
                      {user.averageRating !== null ? (
                        <>
                          <span className="font-bold mr-1">{user.averageRating.toFixed(1)}</span>
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 .5l2.939 5.455 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        </>
                      ) : (
                        <span className="text-xs text-secondary-500">Nenhuma avaliação</span>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
