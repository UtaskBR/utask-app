'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ExplorarPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    profession: '',
    minValue: '',
    maxValue: '',
    sortBy: 'recent'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar profissões
        const professionsResponse = await fetch('/api/professions');
        const professionsData = await professionsResponse.json();
        setProfessions(professionsData);
        
        // Carregar serviços
        await fetchServices();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      let url = '/api/services?';
      
      if (filters.profession) {
        url += `profession=${filters.profession}&`;
      }
      
      if (filters.minValue) {
        url += `minValue=${filters.minValue}&`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Ordenar os serviços
      let sortedServices = [...data];
      if (filters.sortBy === 'recent') {
        sortedServices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (filters.sortBy === 'price-low') {
        sortedServices.sort((a, b) => (a.value || 0) - (b.value || 0));
      } else if (filters.sortBy === 'price-high') {
        sortedServices.sort((a, b) => (b.value || 0) - (a.value || 0));
      }
      
      setServices(sortedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = (e) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Explorar Serviços</h1>
        <p className="mt-2 text-secondary-600">
          Encontre serviços disponíveis ou publique o seu
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Filtros</h2>
            
            <form onSubmit={applyFilters} className="space-y-4">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-secondary-700">
                  Categoria
                </label>
                <select
                  id="profession"
                  name="profession"
                  className="input-field mt-1"
                  value={filters.profession}
                  onChange={handleFilterChange}
                >
                  <option value="">Todas as categorias</option>
                  {professions.map((profession) => (
                    <option key={profession.id} value={profession.id}>
                      {profession.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="minValue" className="block text-sm font-medium text-secondary-700">
                  Valor Mínimo (R$)
                </label>
                <input
                  id="minValue"
                  name="minValue"
                  type="number"
                  min="0"
                  className="input-field mt-1"
                  value={filters.minValue}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-secondary-700">
                  Ordenar por
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  className="input-field mt-1"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary py-2"
              >
                Aplicar Filtros
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <Link href="/criar-servico" className="w-full btn-outline py-2 flex justify-center items-center">
                Publicar Serviço
              </Link>
            </div>
          </div>
        </div>
        
        {/* Lista de Serviços */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-secondary-900 mb-2">Nenhum serviço encontrado</h3>
              <p className="text-secondary-600 mb-6">
                Não encontramos serviços com os filtros selecionados.
              </p>
              <Link href="/criar-servico" className="btn-primary py-2 px-4">
                Publicar um Serviço
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link href={`/servicos/${service.id}`} key={service.id}>
                  <div className="card h-full flex flex-col hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-secondary-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-secondary-400">Imagem do Serviço</span>
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-secondary-900">{service.title}</h3>
                        {service.value ? (
                          <span className="text-primary-600 font-bold">
                            R$ {service.value.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-secondary-600 text-sm">
                            Aberto a propostas
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-secondary-600 line-clamp-2">{service.description}</p>
                      <div className="mt-4 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {service.creator.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">{service.creator.name}</p>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 text-sm text-secondary-600">{service.creator.rating}</span>
                          </div>
                        </div>
                      </div>
                      {service.profession && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {service.profession.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
