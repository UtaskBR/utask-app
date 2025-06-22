'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'; // Added ChangeEvent, FormEvent
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define interfaces for IBGE data
interface AppEstado {
  sigla: string;
  nome: string;
}

interface AppMunicipio {
  id: number; 
  nome: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    about: '',
    city: '', // Will be populated by select
    state: ''  // Will be populated by select
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For form submission

  // State for location dropdowns
  const [statesList, setStatesList] = useState<AppEstado[]>([]);
  const [citiesList, setCitiesList] = useState<AppMunicipio[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    setIsLoadingStates(true);
    fetch('/api/localidades/estados')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar estados');
        return res.json();
      })
      .then((data: AppEstado[]) => {
        setStatesList(data);
      })
      .catch(err => {
        console.error("Failed to fetch states for registration form:", err);
        setError('Não foi possível carregar a lista de estados. Tente novamente mais tarde.');
      })
      .finally(() => setIsLoadingStates(false));
  }, []);

  // Fetch cities when state (UF) changes
  const fetchCitiesForState = async (uf: string) => {
    if (!uf) {
      setCitiesList([]);
      // Do not clear formData.city here, handleStateChange does it.
      return;
    }
    setIsLoadingCities(true);
    try {
      // The API route app/api/localidades/estados/[uf]/route.ts directly returns municipalities for the given UF.
      const res = await fetch(`/api/localidades/estados/${uf}`); 
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Falha ao buscar cidades');
      }
      const data: AppMunicipio[] = await res.json();
      setCitiesList(data);
    } catch (err: any) {
      console.error(`Failed to fetch cities for ${uf} in registration form:`, err);
      setError(err.message || 'Não foi possível carregar a lista de cidades para o estado selecionado.');
      setCitiesList([]);
    } finally {
      setIsLoadingCities(false);
    }
  };
  
  // Handle input changes for text, textarea, and city select
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle state dropdown change specifically
  const handleStateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setFormData(prev => ({ ...prev, state: newState, city: '' })); // Update state, clear city
    setCitiesList([]); // Clear cities list immediately
    if (newState) {
      fetchCitiesForState(newState);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Nome, email e senha são obrigatórios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    // Optional: Add validation for state and city if they are considered mandatory
    if (!formData.state || !formData.city) {
      setError('Estado e cidade são obrigatórios.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          about: formData.about,
          city: formData.city,
          state: formData.state
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar usuário');
      }
      
      router.push('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Ou{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              entre com sua conta existente
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4"> {/* Added my-4 for spacing */}
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                Nome completo *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field mt-1"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Senha *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                Confirmar senha *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            {/* State and City Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stateReg" className="block text-sm font-medium text-secondary-700">Estado *</label>
                <select
                  id="stateReg"
                  name="state"
                  value={formData.state}
                  onChange={handleStateChange}
                  className="input-field mt-1 w-full"
                  disabled={isLoadingStates}
                  required // Added required
                >
                  <option value="">{isLoadingStates ? 'Carregando...' : 'Selecione um estado'}</option>
                  {statesList.map(s => (
                    <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cityReg" className="block text-sm font-medium text-secondary-700">Cidade *</label>
                <select
                  id="cityReg"
                  name="city"
                  value={formData.city}
                  onChange={handleChange} 
                  className="input-field mt-1 w-full"
                  disabled={!formData.state || isLoadingCities || citiesList.length === 0}
                  required // Added required
                >
                  <option value="">
                    {isLoadingCities ? 'Carregando...' : (!formData.state ? 'Selecione um estado primeiro' : (citiesList.length === 0 && !isLoadingCities ? 'Nenhuma cidade' : 'Selecione uma cidade'))}
                  </option>
                  {citiesList.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option> 
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-secondary-700">
                Sobre mim
              </label>
              <textarea
                id="about"
                name="about"
                rows={3}
                className="input-field mt-1"
                placeholder="Conte um pouco sobre você"
                value={formData.about}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex justify-center items-center"
            >
              {isLoading ? 'Processando...' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
