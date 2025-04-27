'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function MeusServicosPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserServices();
    }
  }, [session]);

  const fetchUserServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${session?.user?.id}/services`);
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        toast.error('Erro ao carregar serviços');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir um serviço
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/services?id=${serviceToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Serviço excluído com sucesso');
        // Atualizar a lista de serviços
        fetchUserServices();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao excluir serviço');
      }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  // Função para confirmar exclusão
  interface Service {
    id: string;
    title: string;
    description: string;
    value: number | null;
    date: string | null;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    creatorId: string;
    creator?: {
      id: string;
      name?: string;
      image?: string;
    };
    userBid?: {
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED';
    };
  }

  const confirmDelete = (serviceId: Service['id']): void => {
    setServiceToDelete(serviceId);
    setShowDeleteModal(true);
  };

  // Filtrar serviços com base na aba ativa
  const filteredServices = services.filter(service => {
    if (activeTab === 'todos') return true;
    if (activeTab === 'criados') return service.creatorId === session?.user?.id;
    if (activeTab === 'candidaturas') return service.creatorId !== session?.user?.id;
    if (activeTab === 'abertos') return service.status === 'OPEN';
    if (activeTab === 'em-andamento') return service.status === 'IN_PROGRESS';
    if (activeTab === 'concluidos') return service.status === 'COMPLETED';
    if (activeTab === 'cancelados') return service.status === 'CANCELLED';
    return true;
  });

  // Agrupar serviços por status para exibição
  const groupedServices = {
    OPEN: filteredServices.filter(service => service.status === 'OPEN'),
    IN_PROGRESS: filteredServices.filter(service => service.status === 'IN_PROGRESS'),
    COMPLETED: filteredServices.filter(service => service.status === 'COMPLETED'),
    CANCELLED: filteredServices.filter(service => service.status === 'CANCELLED')
  };

  // Função para formatar o valor do serviço
  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'A combinar';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Função para formatar a data do serviço
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'A combinar';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter a cor de fundo com base no status
  interface StatusColorMap {
    [key: string]: string;
  }

  const getStatusColor = (status: Service['status']): string => {
    const statusColorMap: StatusColorMap = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return statusColorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Função para obter o texto do status
  const getStatusText = (status: Service['status']): string => {
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

  // Verificar se o serviço pode ser editado ou excluído
  const canEditOrDelete = (service: Service) => {
    return service.creatorId === session?.user?.id && service.status === 'OPEN';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meus Serviços</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Serviços</h1>
      
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
                activeTab === 'criados'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('criados')}
            >
              Criados por mim
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'candidaturas'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('candidaturas')}
            >
              Minhas candidaturas
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'abertos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('abertos')}
            >
              Abertos
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'em-andamento'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('em-andamento')}
            >
              Em andamento
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'concluidos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('concluidos')}
            >
              Concluídos
            </button>
          </li>
          <li>
            <button
              className={`inline-block py-2 px-4 text-sm font-medium ${
                activeTab === 'cancelados'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('cancelados')}
            >
              Cancelados
            </button>
          </li>
        </ul>
      </div>

      {/* Botão para criar novo serviço */}
      <div className="mb-6">
        <Link href="/criar-servico" className="btn-primary">
          Criar novo serviço
        </Link>
      </div>

      {/* Mensagem quando não há serviços */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">Você ainda não tem serviços nesta categoria.</p>
          {activeTab === 'todos' || activeTab === 'criados' || activeTab === 'abertos' ? (
            <Link href="/criar-servico" className="btn-primary">
              Criar seu primeiro serviço
            </Link>
          ) : activeTab === 'candidaturas' ? (
            <Link href="/explorar" className="btn-primary">
              Explorar serviços disponíveis
            </Link>
          ) : null}
        </div>
      )}

      {/* Lista de serviços agrupados por status */}
      {Object.entries(groupedServices).map(([status, statusServices]) => 
        statusServices.length > 0 && (
          <div key={status} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {getStatusText(status as Service['status'])}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({statusServices.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusServices.map(service => (
                <div 
                  key={service.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden ${
                    status === 'CANCELLED' ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {service.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Valor:</p>
                        <p className="text-sm font-medium">{formatValue(service.value)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Data:</p>
                        <p className="text-sm font-medium">{formatDate(service.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      {service.creatorId === session?.user?.id ? (
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-1">Criado por você</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                            {service.creator?.image ? (
                              <Image
                                src={service.creator.image}
                                alt={service.creator.name || "Usuário"}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded-full"
                              />
                            ) : (
                              <span className="text-xs text-gray-700 font-medium">
                                {service.creator?.name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{service.creator?.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status da proposta (se for uma candidatura) */}
                    {service.creatorId !== session?.user?.id && service.userBid && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">Status da sua proposta:</p>
                        <p className={`text-sm font-medium ${
                          service.userBid.status === 'PENDING' ? 'text-yellow-600' :
                          service.userBid.status === 'ACCEPTED' ? 'text-green-600' :
                          service.userBid.status === 'REJECTED' ? 'text-red-600' :
                          service.userBid.status === 'COUNTER_OFFERED' ? 'text-blue-600' : ''
                        }`}>
                          {service.userBid.status === 'PENDING' ? 'Pendente' :
                           service.userBid.status === 'ACCEPTED' ? 'Aceita' :
                           service.userBid.status === 'REJECTED' ? 'Rejeitada' :
                           service.userBid.status === 'COUNTER_OFFERED' ? 'Contraproposta' : 
                           service.userBid.status}
                        </p>
                      </div>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="flex flex-col space-y-2">
                      <Link 
                        href={`/servicos/${service.id}`}
                        className="w-full block text-center py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
                      >
                        Ver detalhes
                      </Link>
                      
                      {/* Botões de editar e excluir (apenas para serviços criados pelo usuário e com status OPEN) */}
                      {canEditOrDelete(service) && (
                        <div className="flex space-x-2">
                          <Link 
                            href={`/editar-servico/${service.id}`}
                            className="flex-1 block text-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
                          >
                            Editar
                          </Link>
                          <button 
                            onClick={() => confirmDelete(service.id)}
                            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar exclusão</h3>
            <p className="mb-6">Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteService}
                className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
