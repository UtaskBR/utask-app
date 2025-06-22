'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define interfaces for State and City, assuming they are not globally available or easily importable
// If these are exported from their respective API routes, importing is cleaner.
interface AppEstado {
  sigla: string;
  nome: string;
}

interface AppMunicipio {
  id: number; // Or string, depending on what IBGE API returns and how it's used
  nome: string;
}

interface Profession {
  id: string;
  name: string;
  icon?: string;
}

export default function EditarPerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ name: '', about: '', city: '', state: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gallery, setGallery] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [professions, setProfessions] = useState<Profession[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [isLoadingProfessions, setIsLoadingProfessions] = useState(true);

  const [statesList, setStatesList] = useState<AppEstado[]>([]);
  const [citiesList, setCitiesList] = useState<AppMunicipio[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // Fetch user data and pre-fill states/cities
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(userData => {
          if (userData.error) {
            setError(userData.error);
          } else {
            const userState = userData.state || '';
            const userCity = userData.city || '';
            setFormData({
              name: userData.name || '',
              about: userData.about || '',
              city: userCity, 
              state: userState,
            });
            setAvatarUrl(userData.image || '');
            setGallery(userData.photos || []);
            if (userData.professions) {
              setSelectedProfessions(userData.professions.map((p: any) => p.id));
            }
            if (userState) {
              console.log('[EditProfile] Initial load - Calling fetchCitiesForState with userState:', userState, 'userCity:', userCity);
              fetchCitiesForState(userState, userCity); 
            }
          }
        })
        .catch(() => setError('Erro ao carregar dados do usuário.'));
    }
  }, [status, session]);

  // Fetch list of all states
  useEffect(() => {
    setIsLoadingStates(true);
    fetch('/api/localidades/estados')
      .then(res => res.json())
      .then((data: AppEstado[]) => {
        setStatesList(data);
      })
      .catch(err => {
        console.error("Failed to fetch states", err);
      })
      .finally(() => setIsLoadingStates(false));
  }, []);

  // Fetch professions
  useEffect(() => {
    fetch('/api/professions')
      .then(res => res.json())
      .then(data => {
        setProfessions(data);
        setIsLoadingProfessions(false);
      })
      .catch(() => setIsLoadingProfessions(false));
  }, []);

  const fetchCitiesForState = async (uf: string, preSelectedCity?: string) => {
    console.log('[EditProfile] fetchCitiesForState - UF received:', uf, 'PreSelectedCity:', preSelectedCity);
    if (!uf) {
      console.log('[EditProfile] fetchCitiesForState - UF is empty, clearing citiesList.');
      setCitiesList([]);
      setFormData(prev => ({ ...prev, city: '' })); 
      return;
    }
    setIsLoadingCities(true);
    try {
      const res = await fetch(`/api/localidades/estados/${uf}/municipios`); 
      console.log('[EditProfile] fetchCitiesForState - API Response Status:', res.status, 'OK:', res.ok);
      const rawResponseText = await res.text();
      console.log('[EditProfile] fetchCitiesForState - API Raw Response Text:', rawResponseText);

      let data: AppMunicipio[] = [];
      if (res.ok) {
        try {
          data = JSON.parse(rawResponseText); 
          console.log('[EditProfile] fetchCitiesForState - Parsed API Data:', data);
        } catch (parseError) {
          console.error('[EditProfile] fetchCitiesForState - JSON Parse Error:', parseError);
          throw new Error('Falha ao processar resposta das cidades (JSON inválido)');
        }
      } else {
        let errorDetail = rawResponseText;
        try {
           const errorJson = JSON.parse(rawResponseText);
           errorDetail = errorJson.error || rawResponseText;
        } catch (e) { /* ignore, use raw text */ }
        throw new Error(`Falha ao buscar cidades: ${res.status} - ${errorDetail}`);
      }
      
      console.log('[EditProfile] fetchCitiesForState - Attempting to set citiesList with:', data);
      setCitiesList(data); 

      if (preSelectedCity && data.some(c => c.nome === preSelectedCity)) {
        setFormData(prev => ({ ...prev, city: preSelectedCity }));
      } else if (!preSelectedCity && data.length > 0) {
         setFormData(prev => ({ ...prev, city: '' }));
      } else {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } catch (err: any) { // Added : any for err type
      console.error(`[EditProfile] Failed to fetch cities for ${uf}:`, err);
      setCitiesList([]);
      setFormData(prev => ({ ...prev, city: '' })); 
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    console.log('[EditProfile] handleStateChange - newState:', newState);
    setFormData(prev => ({ ...prev, state: newState, city: '' }));
    if (newState) {
      fetchCitiesForState(newState);
    } else {
      setCitiesList([]);
    }
  };

  const handleProfessionToggle = (professionId: string) => {
    setSelectedProfessions(prev =>
      prev.includes(professionId)
        ? prev.filter(id => id !== professionId)
        : [...prev, professionId]
    );
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    try {
      const profileRes = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!profileRes.ok) throw new Error(`Erro ao atualizar perfil: ${profileRes.status}`);

      const professionsRes = await fetch(`/api/users/${session.user.id}/professions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionIds: selectedProfessions }),
      });
      if (!professionsRes.ok) throw new Error(`Erro ao atualizar profissões: ${professionsRes.status}`);

      alert('Perfil atualizado com sucesso!');
      router.push(`/perfil/${session.user.id}`);
    } catch (error: any) {
      alert(`Falha ao atualizar perfil: ${error.message}`);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('upload_preset', 'utask-avatar');
      formDataUpload.append('file', file);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dhkkz3vlv/image/upload`, {
        method: 'POST',
        body: formDataUpload,
      });
      const cloudinaryData = await cloudinaryRes.json();

      await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        }),
      });

      setAvatarUrl(cloudinaryData.secure_url);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar foto de perfil.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setIsUploading(true);

    const localPreview = URL.createObjectURL(file);
    const tempPhoto = { id: `temp-${Date.now()}`, url: localPreview, isTemp: true };
    setGallery(prev => [...prev, tempPhoto]);

    const formDataUpload = new FormData();
    formDataUpload.append('upload_preset', 'utask-gallery');
    formDataUpload.append('file', file);

    try {
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/dhkkz3vlv/image/upload`, {
        method: 'POST',
        body: formDataUpload,
      });
      const cloudinaryData = await cloudinaryRes.json();

      const res = await fetch('/api/upload/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        }),
      });
      const data = await res.json();
      setGallery(prev => prev.filter(p => p.id !== tempPhoto.id).concat(data.photo));
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      alert('Foto adicionada à galeria com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar à galeria.');
      setGallery(prev => prev.filter(p => !p.isTemp)); // Make sure to remove temp photo on error
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading' || isLoadingProfessions || isLoadingStates) return <p>Carregando...</p>; // Combined initial loading
  if (error) return <p className="text-red-500">{error}</p>;
  if (status === 'unauthenticated') { // Redirect if not authenticated
      router.push('/auth/login');
      return <p>Redirecionando...</p>;
  }
  if (!session?.user) return <p>Usuário não encontrado na sessão.</p>; // Should be handled by AuthGuard or similar in layout

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {/* TEMPORARY DEBUG DISPLAY START */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', fontSize: '12px' }}>
        <h3 style={{ fontWeight: 'bold' }}>Debug Info (Edit Profile):</h3>
        <p>Current formData.state: {formData.state || 'empty'}</p>
        <p>Current formData.city: {formData.city || 'empty'}</p>
        <p>isLoadingCities: {isLoadingCities.toString()}</p>
        <p>citiesList length: {citiesList?.length ?? 'undefined'}</p>
        <p>First 3 cities: {citiesList?.slice(0,3).map(c=>c.nome).join(', ') || 'none'}</p>
        <p>Selected Professions: {JSON.stringify(selectedProfessions)}</p>
      </div>
      {/* TEMPORARY DEBUG DISPLAY END */}

      <h1 className="text-xl font-bold">Editar Perfil</h1>

      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium">Sobre</label>
        <textarea name="about" value={formData.about} onChange={handleChange} className="input-field" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleStateChange}
            className="input-field w-full"
            disabled={isLoadingStates}
          >
            <option value="">{isLoadingStates ? 'Carregando...' : 'Selecione um estado'}</option>
            {statesList.map(s => (
              <option key={s.sigla} value={s.sigla}>{s.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="input-field w-full"
            disabled={!formData.state || isLoadingCities || citiesList.length === 0}
          >
            <option value="">
              {isLoadingCities ? 'Carregando cidades...' : (!formData.state ? 'Selecione um estado primeiro' : (citiesList.length === 0 && !isLoadingCities ? 'Nenhuma cidade encontrada' : 'Selecione uma cidade'))}
            </option>
            {citiesList.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Profissões</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {professions.map((profession) => (
            <label key={profession.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedProfessions.includes(profession.id)}
                onChange={() => handleProfessionToggle(profession.id)}
                className="mr-2"
              />
              {profession.name}
            </label>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary" disabled={isUploading}>Salvar</button>

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">Foto de Perfil</h2>
      {avatarUrl && <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-2" />}
      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} />

      <h2 className="text-lg font-semibold mt-6">Galeria</h2>
      <div className="grid grid-cols-3 gap-3">
        {gallery.map((photo, i) => (
          <div key={photo.id || i}>
            <img src={photo.url} alt="Foto" className={`rounded-lg h-32 w-full object-cover ${photo.isTemp ? 'opacity-50' : ''}`} />
          </div>
        ))}
      </div>
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} />
    </div>
  );
}
