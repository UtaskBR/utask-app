'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function CriarServicoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [complemento, setComplemento] = useState(''); // Renamed from address
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [professions, setProfessions] = useState([]);
  const [professionId, setProfessionId] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Carregar profissões
    const fetchProfessions = async () => {
      try {
        const response = await fetch('/api/professions');
        if (response.ok) {
          const data = await response.json();
          setProfessions(data);
        }
      } catch (error) {
        console.error('Erro ao carregar profissões:', error);
      }
    };

    fetchProfessions();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawCep = e.target.value;
    // Formato CEP para display: 00000-000
    let formattedCep = rawCep.replace(/\D/g, '');
    if (formattedCep.length > 5) {
      formattedCep = formattedCep.slice(0, 5) + '-' + formattedCep.slice(5, 8);
    }
    setCep(formattedCep);

    if (formattedCep.replace(/\D/g, '').length === 8) {
      fetchAddressFromCep(formattedCep.replace(/\D/g, ''));
    } else {
      // Limpar campos relacionados ao endereço se o CEP não estiver completo/válido
      setLogradouro('');
      setBairro('');
      setCidade('');
      setUf('');
      setLatitude('');
      setLongitude('');
      setCepError('');
      setGeocodeError('');
    }
  };

  const fetchAddressFromCep = async (cleanedCep: string) => {
    setIsFetchingCep(true);
    setCepError('');
    setLogradouro('');
    setBairro('');
    setCidade('');
    setUf('');
    setLatitude('');
    setLongitude('');
    setGeocodeError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
        toast.error('CEP não encontrado.');
      } else {
        setLogradouro(data.logradouro);
        setBairro(data.bairro);
        setCidade(data.localidade);
        setUf(data.uf);
        toast.success('Endereço encontrado pelo CEP.');
        // Se não houver número, pode tentar geocodificar apenas com CEP e logradouro
        // Mas idealmente, esperamos pelo número.
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
      toast.error('Erro ao buscar CEP.');
    } finally {
      setIsFetchingCep(false);
    }
  };

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!numero || !cep || !logradouro || !cidade || !uf) {
        // Não tentar geocodificar se informações essenciais estiverem faltando
        // ou se o CEP não for válido (ex: usuário apagou)
        if (cep.replace(/\D/g, '').length !== 8 && (latitude || longitude)) {
          // Limpa coordenadas se o CEP se tornar inválido e coordenadas existiam
          setLatitude('');
          setLongitude('');
          setGeocodeError('CEP inválido para geocodificação.');
        }
        return;
      }

      setIsGeocoding(true);
      setGeocodeError('');
      // Não limpar lat/lng aqui para não piscar se o usuário só mudar o número e o resto for igual

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        setGeocodeError('Chave de API do Mapbox não configurada.');
        setIsGeocoding(false);
        return;
      }

      // Priorizar uso do CEP limpo para o postcode
      const cleanedCepForApi = cep.replace(/\D/g, '');

      // Construir query de forma mais flexível, focando nos campos mais relevantes
      // A API do Mapbox é boa em lidar com queries parciais, mas quanto mais info, melhor.
      let queryParams = [];
      if (logradouro) queryParams.push(encodeURIComponent(logradouro));
      if (numero) queryParams.push(encodeURIComponent(numero)); // Número é importante
      if (cidade) queryParams.push(encodeURIComponent(cidade));
      if (uf) queryParams.push(encodeURIComponent(uf));
      // O CEP é usado no parâmetro postcode

      const mapboxApiUrl = `https://api.mapbox.com/search/geocode/v6/forward?country=BR&postcode=${cleanedCepForApi}&q=${queryParams.join(', ')}&language=pt-BR&limit=1&access_token=${mapboxToken}`;
      // Alternativa de URL, se a de cima não for boa:
      // const mapboxApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(logradouro)}, ${encodeURIComponent(numero)}, ${encodeURIComponent(cidade)}, ${encodeURIComponent(uf)}.json?country=BR&postcode=${cleanedCepForApi}&access_token=${mapboxToken}&limit=1`;


      try {
        const response = await fetch(mapboxApiUrl);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const coordinates = data.features[0].geometry.coordinates;
          setLongitude(coordinates[0].toString());
          setLatitude(coordinates[1].toString());
          setGeocodeError(''); // Limpa erro anterior se sucesso
          toast.success('Coordenadas obtidas com sucesso!');
        } else {
          setLatitude('');
          setLongitude('');
          setGeocodeError('Não foi possível obter as coordenadas para este endereço. Verifique os dados ou ajuste manualmente se necessário.');
          toast.error('Coordenadas não encontradas.');
        }
      } catch (error) {
        console.error('Erro ao geocodificar:', error);
        setLatitude('');
        setLongitude('');
        setGeocodeError('Erro ao obter coordenadas. Verifique sua conexão.');
        toast.error('Erro ao obter coordenadas.');
      } finally {
        setIsGeocoding(false);
      }
    };

    // Debounce para evitar chamadas excessivas à API enquanto o usuário digita o número
    const handler = setTimeout(() => {
      if (cep.replace(/\D/g, '').length === 8 && numero && logradouro && cidade && uf) {
         fetchCoordinates();
      }
    }, 1000); // Atraso de 1 segundo

    return () => {
      clearTimeout(handler);
    };
  }, [numero, logradouro, cidade, uf, cep]); // Adicionado cep como dependência

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
      
      // Criar URLs para preview
      const newPreviewUrls = newPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const removePhoto = (index: number) => {
    // Revogar URL do objeto para evitar vazamento de memória
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Criar um objeto FormData
      const formData = new FormData();
      
      // Adicionar campos de texto
      formData.append('title', title);
      formData.append('description', description);
      if (price) formData.append('price', price);
      if (date) formData.append('date', date);
      // Note: The API now expects 'address' to be the 'complemento'.
      // The full address string for the legacy 'address' DB field is constructed on the server.
      if (complemento) formData.append('address', complemento); // 'address' in formData becomes 'complemento' in DB via API

      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (professionId) formData.append('professionId', professionId);

      // Add new structured address fields to FormData
      if (cep) formData.append('cep', cep);
      if (logradouro) formData.append('logradouro', logradouro);
      if (numero) formData.append('numero', numero);
      // 'complemento' is already handled by the 'address' field above for FormData
      if (bairro) formData.append('bairro', bairro);
      if (cidade) formData.append('cidade', cidade);
      if (uf) formData.append('uf', uf);
      
      // Adicionar fotos
      if (photos.length > 0) {
        photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }
      
      // Configurar o cabeçalho corretamente - NÃO DEFINIR Content-Type manualmente
      // O navegador definirá automaticamente com o boundary correto
      const response = await fetch('/api/services', {
        method: 'POST',
        body: formData,
        // Não definir Content-Type aqui!
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Serviço criado com sucesso!');
        router.push(`/servicos/${data.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao criar serviço');
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Serviço</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Deixe em branco para 'A combinar'"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* CEP Input Section */}
        <div className="mb-4">
          <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <input
            type="text"
            id="cep"
            name="cep"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            maxLength={9}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {isFetchingCep && <p className="mt-1 text-xs text-gray-500">Buscando endereço...</p>}
          {cepError && <p className="mt-1 text-xs text-red-500">{cepError}</p>}
        </div>

        {/* Número Input Section */}
        <div className="mb-4">
          <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número</label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ex: 123, S/N"
          />
        </div>

        {/* Display for Auto-filled Address */}
        {logradouro && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Endereço encontrado:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <p><span className="font-semibold">Logradouro:</span> {logradouro}</p>
              <p><span className="font-semibold">Bairro:</span> {bairro}</p>
              <p><span className="font-semibold">Cidade:</span> {cidade}</p>
              <p><span className="font-semibold">UF:</span> {uf}</p>
            </div>
          </div>
        )}
        
        {/* Geocoding Status */}
        <div className="mb-4">
           {isGeocoding && <p className="mt-1 text-xs text-gray-500">Obtendo coordenadas geográficas...</p>}
           {geocodeError && <p className="mt-1 text-xs text-red-500">{geocodeError}</p>}
           {latitude && longitude && !isGeocoding && !geocodeError && <p className="mt-1 text-xs text-green-600">Coordenadas geográficas obtidas com sucesso!</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Complemento do Endereço (Ex: Apto 101, Bloco B)
          </label>
          <input
            type="text"
            id="address" // ID remains "address" for the input field
            name="address" // Name remains "address" for FormData key
            value={complemento} // Value bound to 'complemento' state
            onChange={(e) => setComplemento(e.target.value)} // onChange updates 'complemento' state
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Opcional: Apto, Bloco, Ponto de Referência"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            id="profession"
            value={professionId}
            onChange={(e) => setProfessionId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Selecione uma categoria</option>
            {professions.map((profession: any) => (
              <option key={profession.id} value={profession.id}>
                {profession.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotos
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Carregar fotos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
            </div>
          </div>
          
          {photoPreviewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
          >
            {isSubmitting ? 'Criando...' : 'Criar Serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}
