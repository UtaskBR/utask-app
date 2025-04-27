'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define the Profession type
interface Profession {
  id: string;
  name: string;
}

export default function EditarPerfilPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({ name: '', about: '', city: '', state: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gallery, setGallery] = useState<TempPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [isLoadingProfessions, setIsLoadingProfessions] = useState(true);
  
  const router = useRouter();
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    // Carregar dados do usuário
    if (status === 'authenticated' && session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setFormData({
              name: data.name || '',
              about: data.about || '',
              city: data.city || '',
              state: data.state || '',
            });
            setAvatarUrl(data.image || '');
            setGallery(data.photos || []);
            
            // Definir profissões selecionadas do usuário
            if (data.professions) {
                setSelectedProfessions(data.professions.map((p: { id: string }) => p.id));
            }
            
            // Definir profissões selecionadas do usuário
            if (data.professions) {
                setSelectedProfessions(data.professions.map((p: Profession) => p.id));
            }
          }
        })
        .catch(err => {
          setError('Erro ao carregar dados do usuário.');
          console.error(err);
        });
    }
  }, [status, session]);

  // Carregar lista de profissões disponíveis
  useEffect(() => {
    fetch('/api/professions')
      .then(res => res.json())
      .then(data => {
        setProfessions(data);
        setIsLoadingProfessions(false);
      })
      .catch(err => {
        console.error('Erro ao carregar profissões:', err);
        setIsLoadingProfessions(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleProfessionToggle = (professionId: string): void => {
    setSelectedProfessions((prev: string[]) => {
      if (prev.includes(professionId)) {
        return prev.filter((id: string) => id !== professionId);
      } else {
        return [...prev, professionId];
      }
    });
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    try {
      // Salvar dados do perfil
      const profileRes = await fetch(`/api/users/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!profileRes.ok) {
        throw new Error(`Erro ao atualizar perfil: ${profileRes.status}`);
      }
      
      // Salvar profissões selecionadas
      const professionsRes = await fetch(`/api/users/${session.user.id}/professions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professionIds: selectedProfessions }),
      });
      
      if (!professionsRes.ok) {
        throw new Error(`Erro ao atualizar profissões: ${professionsRes.status}`);
      }
      
      alert('Perfil atualizado com sucesso!');
      router.push(`/perfil/${session.user.id}`);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      if (error instanceof Error) {
        alert(`Falha ao atualizar perfil: ${error.message}`);
      } else {
        alert('Falha ao atualizar perfil: Erro desconhecido.');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    
    setIsUploading(true);
    
    try {
      // Criar um preview local imediato
      const localPreview: string = URL.createObjectURL(file);
      setAvatarUrl(localPreview);
      
      // Upload para o Cloudinary diretamente
      const formData: FormData = new FormData();
      formData.append('upload_preset', 'utask-avatar');
      formData.append('file', file);
      
      const cloudinaryRes: Response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!cloudinaryRes.ok) {
        throw new Error(`Erro ao fazer upload para Cloudinary: ${cloudinaryRes.status}`);
      }
      
      const cloudinaryData: { secure_url: string; public_id: string } = await cloudinaryRes.json();
      console.log("Resposta do Cloudinary:", cloudinaryData);
      
      // Agora use a rota existente para atualizar o avatar
      const res: Response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Erro ao atualizar avatar: ${res.status}`);
      }
      
      const data: { success: boolean } = await res.json();
      console.log("Resposta da API de avatar:", data);
      
      // Atualizar URL com a URL real do Cloudinary
      setAvatarUrl(cloudinaryData.secure_url);
      
      // Limpar o input de arquivo
      if (avatarInputRef.current) {
        (avatarInputRef.current as HTMLInputElement).value = '';
      }
      
      alert('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error("Erro ao processar upload de avatar:", error);
      alert("Falha ao atualizar foto de perfil. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  interface TempPhoto {
    id: string;
    url: string;
    isTemp: boolean;
  }

  interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
  }

  interface GalleryApiResponse {
    photo: {
      id: string;
      url: string;
    };
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    
    setIsUploading(true);
    
    try {
      // Criar um preview local imediato
      const localPreview: string = URL.createObjectURL(file);
      const tempPhoto: TempPhoto = {
        id: `temp-${Date.now()}`,
        url: localPreview,
        isTemp: true
      };
      
      // Adicionar à galeria local imediatamente
      setGallery((prev: TempPhoto[]) => [...prev, tempPhoto]);
      
      // Upload para o Cloudinary diretamente
      const formData: FormData = new FormData();
      formData.append('upload_preset', 'utask-gallery');
      formData.append('file', file);
      
      const cloudinaryRes: Response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!cloudinaryRes.ok) {
        throw new Error(`Erro ao fazer upload para Cloudinary: ${cloudinaryRes.status}`);
      }
      
      const cloudinaryData: CloudinaryResponse = await cloudinaryRes.json();
      console.log("Resposta do Cloudinary:", cloudinaryData);
      
      // Agora use a rota existente para adicionar à galeria
      const res: Response = await fetch('/api/upload/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Erro ao adicionar foto à galeria: ${res.status}`);
      }
      
      const data: GalleryApiResponse = await res.json();
      console.log("Resposta da API de galeria:", data);
      
      // Remover o preview temporário e adicionar a foto real
      setGallery((prev: TempPhoto[]) => prev.filter(p => p.id !== tempPhoto.id).concat({ ...data.photo, isTemp: false }));
      
      // Limpar o input de arquivo
      if (galleryInputRef.current) {
        (galleryInputRef.current as HTMLInputElement).value = '';
      }
      
      alert('Foto adicionada à galeria com sucesso!');
    } catch (error) {
      console.error("Erro ao processar upload para galeria:", error);
      alert("Falha ao adicionar foto à galeria. Tente novamente.");
      // Remover o preview em caso de erro
      setGallery((prev: TempPhoto[]) => prev.filter(p => !p.isTemp));
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading' || isLoadingProfessions) {
    return <div className="max-w-3xl mx-auto p-6">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Editar Perfil</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium">Nome</label>
        <input name="name" className="input-field" value={formData.name} onChange={handleChange} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Sobre</label>
        <textarea name="about" className="input-field" value={formData.about} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Cidade</label>
          <input name="city" className="input-field" value={formData.city} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <input name="state" className="input-field" value={formData.state} onChange={handleChange} />
        </div>
      </div>

      {/* Componente de seleção de profissões */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Profissões</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {professions.map(profession => (
            <div key={profession.id} className="flex items-center">
              <input
                type="checkbox"
                id={`profession-${profession.id}`}
                checked={selectedProfessions.includes(profession.id)}
                onChange={() => handleProfessionToggle(profession.id)}
                className="mr-2"
              />
              <label htmlFor={`profession-${profession.id}`} className="text-sm">
                {profession.name}
              </label>
            </div>
          ))}
        </div>
        {professions.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">Nenhuma profissão disponível.</p>
        )}
      </div>

      <button 
        onClick={handleSave} 
        className="btn-primary"
        disabled={isUploading}
      >
        Salvar
      </button>

      <hr className="my-6" />

      <h2 className="text-lg font-semibold mb-2">Foto de Perfil</h2>
      <div className="mb-4">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt="avatar" 
            className="w-24 h-24 rounded-full mb-2 object-cover" 
          />
        )}
        
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {isUploading && <p className="text-sm text-gray-500 mt-1">Enviando...</p>}
      </div>

      <h2 className="text-lg font-semibold mb-2">Galeria</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {gallery.map((photo, i) => (
          <div key={photo.id || i} className="relative">
            <img 
              src={photo.url} 
              alt="Foto" 
              className={`rounded-lg h-32 w-full object-cover ${photo.isTemp ? 'opacity-50' : ''}`} 
            />
            {photo.isTemp && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">Enviando...</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {isUploading && <p className="text-sm text-gray-500 mt-1">Enviando...</p>}
    </div>
  );
}
