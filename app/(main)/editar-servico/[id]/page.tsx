'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function EditarServicoPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [professions, setProfessions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    timeWindow: 60,
    value: '',
    professionId: '',
    latitude: null,
    longitude: null,
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
      if (service.creatorId !== session.user.id) {
        toast.error('Você não tem permissão para editar este serviço');
        router.push('/meus-servicos');
        return;
      }
      
      // Verificar se o serviço está aberto para edição
      if (service.status !== 'OPEN') {
        toast.error('Este serviço não pode mais ser editado');
        router.push('/meus-servicos');
        return;
      }
      
      // Formatar a data para o formato esperado pelo input datetime-local
      let formattedDate = '';
      if (service.date) {
        const date = new Date(service.date);
        formattedDate = date.toISOString().slice(0, 16);
      }
      
      setFormData({
        title: service.title || '',
        description: service.description || '',
        date: formattedDate,
        timeWindow: service.timeWindow || 60,
        value: service.value !== null ? service.value.toString() : '',
        professionId: service.professionId || '',
        latitude: service.latitude || null,
        longitude: service.longitude || null,
        address: service.address || ''
      });
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
      setError('Não foi possível carregar os detalhes do serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await fetch('/api/professions');
      const data = await response.json();
      setProfessions(data);
    } catch (err) {
      console.error('Erro ao carregar profissões:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/services', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: params.id,
          ...formData,
          value: formData.value ? parseFloat(formData.value) : null,
          timeWindow: formData.timeWindow ? parseInt(formData.timeWindow) : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar serviço');
      }
      
      toast.success('Serviço atualizado com sucesso!');
      router.push('/meus-servicos');
    } catch (err) {
      console.error('Erro ao atualizar serviço:', err);
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Editar Serviço</h1>
        <p className="mt-2 text-secondary-600">
          Atualize os detalhes do seu serviço
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-secondary-700">
              Título do Serviço *
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
