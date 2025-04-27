'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Definir interface para os parâmetros da página
interface EditarServicoParams {
  id: string;
}

export default function EditarServicoPage({ params }: { params: EditarServicoParams }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [professions, setProfessions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    timeWindow: 60,
    value: '',
    professionId: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: ''
  });

  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated' && params.id) {
      fetchServiceDetails();
      fetchProfessions();
    }
  }, [status, params.id, router]);

  const fetchServiceDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do serviço');
      }
      
      const service = await response.json();
      
      // Verificar se o usuário é o criador do serviço
      if (session?.user?.id !== service.creatorId) {
        setError('Você não tem permissão para editar este serviço');
        return;
      }
      
      // Verificar se o serviço já foi aceito
      if (service.status !== 'OPEN') {
        setError('Este serviço não pode ser editado porque já foi aceito ou está em andamento');
        return;
      }
      
      // Formatar a data para o formato esperado pelo input datetime-local
      let formattedDate = '';
      if (service.date) {
        const date = new Date(service.date);
        formattedDate = date.toISOString().slice(0, 16);
      }
      
      setFormData({
        title: service.title,
        description: service.description,
        date: formattedDate,
        timeWindow: service.timeWindow || 60,
        value: service.value ? service.value.toString() : '',
        professionId: service.professionId || '',
        latitude: service.latitude,
        longitude: service.longitude,
        address: service.address || ''
      });
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
      toast.error('Erro ao carregar detalhes do serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await fetch('/api/professions');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar profissões');
      }
      
      const data = await response.json();
      setProfessions(data);
    } catch (error) {
      console.error('Erro ao carregar profissões:', error);
      toast.error('Erro ao carregar categorias de serviço');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Preparar os dados para envio
      const serviceData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        timeWindow: parseInt(formData.timeWindow.toString()),
        professionId: formData.professionId || null
      };
      
      const response = await fetch(`/api/services/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar serviço');
      }
      
      toast.success('Serviço atualizado com sucesso!');
      router.push('/meus-servicos');
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error(error.message || 'Erro ao atualizar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/meus-servicos"
            className="inline-block py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
          >
            Voltar para Meus Serviços
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Serviço</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Título *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="input-field mt-1"
              placeholder="Ex: Instalação de Ar Condicionado"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className="input-field mt-1"
              placeholder="Descreva detalhadamente o serviço que você precisa"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="professionId" className="block text-sm font-medium text-secondary-700">
                Tipo de Serviço
              </label>
              <select
                id="professionId"
                name="professionId"
                className="input-field mt-1"
                value={formData.professionId}
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria</option>
                {professions.map((profession) => (
                  <option key={profession.id} value={profession.id}>
                    {profession.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-secondary-700">
                Valor (R$)
              </label>
              <input
                id="value"
                name="value"
                type="number"
                step="0.01"
                min="0"
                className="input-field mt-1"
                placeholder="Deixe em branco para receber propostas"
                value={formData.value}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-secondary-500">
                Deixe em branco para receber propostas de valor dos prestadores
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-secondary-700">
                Data e Hora
              </label>
              <input
                id="date"
                name="date"
                type="datetime-local"
                className="input-field mt-1"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="timeWindow" className="block text-sm font-medium text-secondary-700">
                Janela de Tempo (minutos)
              </label>
              <select
                id="timeWindow"
                name="timeWindow"
                className="input-field mt-1"
                value={formData.timeWindow}
                onChange={handleChange}
              >
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
                <option value="120">2 horas</option>
                <option value="180">3 horas</option>
                <option value="240">4 horas</option>
              </select>
              <p className="mt-1 text-xs text-secondary-500">
                Flexibilidade de horário para a realização do serviço
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
              Endereço
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="input-field mt-1"
              placeholder="Endereço completo onde o serviço será realizado"
              value={formData.address}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-secondary-500">
              Deixe em branco para serviços remotos
            </p>
          </div>
          
          <div className="pt-4 flex space-x-3">
            <Link
              href="/meus-servicos"
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 btn-primary py-3 flex justify-center items-center"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
