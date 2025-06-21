'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ExplorarPage() {
  const { data: session, status } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [professions, setProfessions] = useState<{ id: string; name: string }[]>([]);
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
        const professionsResponse = await fetch('/api/professions');
        const professionsData = await professionsResponse.json();
        setProfessions(professionsData);
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
      const params = new URLSearchParams();
      params.append('status', 'OPEN'); // Always fetch OPEN services

      if (filters.profession) {
        params.append('professionId', filters.profession);
      }
      if (filters.minValue) {
        params.append('minValue', filters.minValue);
      }
      if (filters.maxValue) { // Added maxValue to the params
        params.append('maxValue', filters.maxValue);
      }
      // Note: sortBy is handled client-side currently, so not added to API params.

      const url = `/api/services?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar serviços');
      }
      
      const data = await response.json();
      
      // Garantir que temos um array para trabalhar
      let servicesArray = [];
      
      // Verificar a estrutura da resposta e extrair o array de serviços
      if (data && Array.isArray(data)) {
        servicesArray = data;
      } else if (data && data.services && Array.isArray(data.services)) {
        servicesArray = data.services;
      } else {
        console.warn('Formato de resposta inesperado:', data);
        servicesArray = []; // Garantir um array vazio como fallback
      }
      
      let sortedServices = [...servicesArray];
      
      // Ordenação com tratamento de erro
      try {
        if (filters.sortBy === 'recent') {
          sortedServices.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        } else if (filters.sortBy === 'price-low') {
          sortedServices.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (filters.sortBy === 'price-high') {
          sortedServices.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
      } catch (sortError) {
        console.error('Erro ao ordenar serviços:', sortError);
        // Manter a ordem original em caso de erro
      }
      
      setServices(sortedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
      setServices([]); // Garantir um array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  interface Filters {
    profession: string;
    minValue: string;
    maxValue: string;
    sortBy: string;
  }

  interface FilterChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLSelectElement> {}

  const handleFilterChange = (e: FilterChangeEvent) => {
    const { name, value } = e.target;
    setFilters((prev: Filters) => ({ ...prev, [name]: value }));
  };

  interface ApplyFiltersEvent extends React.FormEvent<HTMLFormElement> {}

  const applyFilters = (e: ApplyFiltersEvent) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Explorar Serviços</h1>
        <p className="mt-2 text-secondary-600">Encontre serviços disponíveis ou publique o seu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Filtros</h2>
            <form onSubmit={applyFilters} className="space-y-4">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-secondary-700">Categoria</label>
                <select id="profession" name="profession" className="input-field mt-1" value={filters.profession} onChange={handleFilterChange}>
                  <option value="">Todas as categorias</option>
                  {professions.map((profession) => (
                    <option key={profession.id} value={profession.id}>{profession.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="minValue" className="block text-sm font-medium text-secondary-700">Valor Mínimo (R$)</label>
                <input id="minValue" name="minValue" type="number" min="0" className="input-field mt-1" value={filters.minValue} onChange={handleFilterChange} />
              </div>
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-secondary-700">Ordenar por</label>
                <select id="sortBy" name="sortBy" className="input-field mt-1" value={filters.sortBy} onChange={handleFilterChange}>
                  <option value="recent">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                </select>
              </div>
              <button type="submit" className="w-full btn-primary py-2">Aplicar Filtros</button>
            </form>
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <Link href="/criar-servico" className="w-full btn-outline py-2 flex justify-center items-center">Publicar Serviço</Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando serviços...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium text-secondary-900 mb-2">Nenhum serviço encontrado</h3>
              <p className="text-secondary-600 mb-6">Não encontramos serviços com os filtros selecionados.</p>
              <Link href="/criar-servico" className="btn-primary py-2 px-4">Publicar um Serviço</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link href={`/servicos/${service.id}`} key={service.id}>
                  <div className="card h-full flex flex-col hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-secondary-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {service.photos && service.photos[0] && service.photos[0].url ? (
                        <Image src={service.photos[0].url} alt="Imagem do serviço" width={400} height={160} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-secondary-400">Imagem do Serviço</span>
                      )}
                    </div>
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-secondary-900">{service.title}</h3>
                        {service.price != null ? (
                          <span className="text-primary-600 font-bold">R$ {service.price.toFixed(2)}</span>
                        ) : (
                          <span className="text-secondary-600 text-sm">Aberto a propostas</span>
                        )}
                      </div>
                      <p className="mt-2 text-secondary-600 line-clamp-2">{service.description}</p>
                      <div className="mt-4 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">{service.creator && service.creator.name ? service.creator.name.charAt(0) : '?'}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-secondary-900">{service.creator ? service.creator.name : 'Usuário'}</p>
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 text-sm text-secondary-600">{service.creator && service.creator.rating ? service.creator.rating : 'N/A'}</span>
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
