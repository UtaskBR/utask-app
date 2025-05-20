'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format, isToday, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

export default function AgendaPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchServices();
    }
  }, [session, activeTab]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Construir a URL com base na aba ativa
      let url = '/api/agenda?';
      if (activeTab === 'proximos') {
        url += 'filter=upcoming&';
      } else if (activeTab === 'passados') {
        url += 'filter=past&';
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar serviços da agenda');
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
      
      setServices(servicesArray);
      
      // Informações de debug para ajudar a identificar problemas
      setDebugInfo({
        responseType: typeof data,
        isArray: Array.isArray(data),
        hasServicesProperty: data && typeof data === 'object' && 'services' in data,
        servicesCount: servicesArray.length,
        firstItem: servicesArray.length > 0 ? servicesArray[0] : null
      });
    } catch (error) {
      console.error('Erro ao buscar serviços da agenda:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar a data
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data não especificada';
    try {
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      if (isToday(date)) {
        return `Hoje às ${format(date, 'HH:mm', { locale: ptBR })}`;
      }
      
      return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função para formatar o valor
  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'A combinar';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Função para agrupar serviços por data
  const groupServicesByDate = () => {
    const grouped: Record<string, any[]> = {};
    
    services.forEach(service => {
      if (!service.date) {
        const key = 'Sem data definida';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(service);
        return;
      }
      
      try {
        const date = parseISO(service.date);
        if (isNaN(date.getTime())) {
          const key = 'Data inválida';
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(service);
          return;
        }
        
        const key = format(date, 'dd/MM/yyyy');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(service);
      } catch (error) {
        console.error('Erro ao agrupar serviço por data:', error);
        const key = 'Data inválida';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(service);
      }
    });
    
    return grouped;
  };

  // Função para obter a cor de status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return 'Aberto';
      case 'IN_PROGRESS':
        return 'Em andamento';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const groupedServices = groupServicesByDate();
  const sortedDates = Object.keys(groupedServices).sort((a, b) => {
    if (a === 'Sem data definida') return 1;
    if (b === 'Sem data definida') return -1;
    if (a === 'Data inválida') return 1;
    if (b === 'Data inválida') return -1;
    
    // Converter para formato de data para comparação
    try {
      const dateA = a.split('/').reverse().join('-');
      const dateB = b.split('/').reverse().join('-');
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    } catch (error) {
      return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Minha Agenda de Serviços</h1>
        <button 
          onClick={() => setDebugInfo(prev => prev ? null : { services })}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Debug Agenda
        </button>
      </div>
      
      {/* Abas de filtro */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'todos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('todos')}
            >
              Todos
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'proximos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('proximos')}
            >
              Próximos
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'passados'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('passados')}
            >
              Passados
            </button>
          </li>
        </ul>
      </div>
      
      {/* Exibir informações de debug se ativado */}
      {debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
      
      {/* Carregando */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}
      
      {/* Sem serviços */}
      {!loading && services.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">Você não tem serviços agendados.</p>
          <Link href="/explorar" className="btn-primary">
            Explorar serviços disponíveis
          </Link>
        </div>
      )}
      
      {/* Lista de serviços agrupados por data */}
      {!loading && services.length > 0 && (
        <div className="space-y-8">
          {sortedDates.map(dateKey => (
            <div key={dateKey}>
              <h2 className="text-xl font-semibold mb-4">{dateKey}</h2>
              <div className="space-y-4">
                {groupedServices[dateKey].map(service => (
                  <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Data e hora:</p>
                          <p className="text-sm font-medium">{formatDate(service.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Local:</p>
                          <p className="text-sm font-medium">{service.address || 'Não especificado'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valor:</p>
                          <p className="text-sm font-medium">{formatValue(service.price)}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">Participantes:</p>
                        <p className="text-sm">
                          <span className="font-medium">Prestador:</span> {service.provider ? service.provider.name : 'Você'} | 
                          <span className="font-medium"> Contratante:</span> {service.creator ? service.creator.name : 'Você'}
                        </p>
                      </div>
                      
                      <Link 
                        href={`/servicos/${service.id}`}
                        className="block w-full text-center py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
