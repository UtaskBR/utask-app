'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [professions, setProfessions] = useState([]);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const fileInputRef = useRef(null);
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

    // Carregar profissões
    const fetchProfessions = async () => {
      try {
        const response = await fetch('/api/professions');
        const data = await response.json();
        setProfessions(data);
      } catch (err) {
        console.error('Erro ao carregar profissões:', err);
      }
    };

    fetchProfessions();
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limitar a 5 fotos
    const totalPhotos = photos.length + files.length;
    if (totalPhotos > 5) {
      toast.error('Você pode adicionar no máximo 5 fotos');
      return;
    }

    // Adicionar novas fotos
    setPhotos(prev => [...prev, ...files]);

    // Criar previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    // Remover foto e preview
    const newPhotos = [...photos];
    const newPreviews = [...photoPreview];
    
    // Liberar URL do objeto para evitar vazamento de memória
    URL.revokeObjectURL(newPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
  };

  const uploadPhotos = async (serviceId) => {
    try {
      // Criar FormData para upload de fotos
      const photoFormData = new FormData();
      photos.forEach(photo => {
        photoFormData.append('photos', photo);
      });
      photoFormData.append('serviceId', serviceId);
      
      console.log('Enviando fotos para o serviço:', serviceId);
      
      const photoResponse = await fetch('/api/photos', {
        method: 'POST',
        body: photoFormData
      });
      
      // Verificar se a resposta é um erro 404 ou outro erro HTTP
      if (!photoResponse.ok) {
        if (photoResponse.status === 404) {
          throw new Error('API de fotos não encontrada. Verifique se o endpoint está correto.');
        }
        
        // Tentar ler o corpo da resposta como texto primeiro
        const responseText = await photoResponse.text();
        
        // Tentar analisar como JSON se possível
        let errorMessage = 'Erro desconhecido ao fazer upload das fotos';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Se não for JSON válido, usar o texto da resposta
          if (responseText.includes('<!DOCTYPE html>')) {
            errorMessage = `Erro no servidor: ${photoResponse.status} ${photoResponse.statusText}`;
          } else {
            errorMessage = responseText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Tentar ler a resposta como texto primeiro
      const responseText = await photoResponse.text();
      
      // Se a resposta estiver vazia, retornar um objeto vazio
      if (!responseText.trim()) {
        console.log('Resposta vazia do servidor');
        return { photos: [] };
      }
      
      // Tentar analisar como JSON
      try {
        const photoData = JSON.parse(responseText);
        console.log('Fotos enviadas com sucesso:', photoData);
        return photoData;
      } catch (jsonError) {
        console.error('Erro ao analisar resposta JSON:', jsonError);
        console.error('Resposta recebida:', responseText);
        throw new Error('Erro ao processar resposta do servidor');
      }
    } catch (error) {
      console.error('Exceção ao fazer upload de fotos:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!formData.title || !formData.description) {
      setError('Título e descrição são obrigatórios');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Primeiro, criar o serviço
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseFloat(formData.value) : null,
          timeWindow: formData.timeWindow ? parseInt(formData.timeWindow) : null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar serviço');
      }
      
      const data = await response.json();
      const serviceId = data.id;
      
      // Se houver fotos, fazer upload
      if (photos.length > 0) {
        try {
          await uploadPhotos(serviceId);
          toast.success('Serviço criado com sucesso com fotos!');
        } catch (photoErr) {
          console.error('Exceção ao fazer upload de fotos:', photoErr);
          // Não interromper o fluxo, mas mostrar erro específico
          toast.error(`Serviço criado, mas erro no upload de fotos: ${photoErr.message}`);
          
          // Aguardar um pouco antes de redirecionar para que o usuário veja o erro
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        toast.success('Serviço criado com sucesso!');
      }
      
      // Redirecionar para a página do serviço criado
      router.push(`/servicos/${serviceId}`);
    } catch (err) {
      console.error('Erro ao criar serviço:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Criar Novo Serviço</h1>
        <p className="mt-2 text-secondary-600">
          Preencha os detalhes do serviço que você precisa
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
          
          {/* Componente de Upload de Fotos */}
          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Fotos do Serviço
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="btn-outline py-2 px-4"
              >
                Adicionar Fotos
              </button>
              <span className="ml-3 text-xs text-secondary-500">
                Máximo de 5 fotos
              </span>
            </div>
            
            {/* Preview das fotos */}
            {photoPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {photoPreview.map((src, index) => (
                  <div key={index} className="relative">
                    <div className="h-24 w-full rounded-md overflow-hidden">
                      <Image
                        src={src}
                        alt={`Foto ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {isLoading ? 'Processando...' : 'Criar Serviço'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
