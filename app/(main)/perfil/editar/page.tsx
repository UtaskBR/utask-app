// Este é o componente completo de edição de perfil, reintegrando o MultiSelectProfessions ao perfil completo
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch(`/api/users/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error);
          else {
            setFormData({
              name: data.name || '',
              about: data.about || '',
              city: data.city || '',
              state: data.state || '',
            });
            setAvatarUrl(data.image || '');
            setGallery(data.photos || []);
            if (data.professions) {
              setSelectedProfessions(data.professions.map((p: any) => p.id));
            }
          }
        })
        .catch(() => setError('Erro ao carregar dados do usuário.'));
    }
  }, [status, session]);

  useEffect(() => {
    fetch('/api/professions')
      .then(res => res.json())
      .then(data => {
        setProfessions(data);
        setIsLoadingProfessions(false);
      })
      .catch(() => setIsLoadingProfessions(false));
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        method: 'PATCH',
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

  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);

    const formDataUpload = new FormData();
    formDataUpload.append('upload_preset', 'utask-avatar');
    formDataUpload.append('file', file);

    try {
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`, {
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
      alert('Foto de perfil atualizada!');
    } catch (error) {
      alert('Falha ao atualizar avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: any) => {
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
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`, {
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
      alert('Foto adicionada à galeria!');
    } catch (error) {
      alert('Falha ao adicionar imagem à galeria.');
      setGallery(prev => prev.filter(p => !p.isTemp));
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading' || isLoadingProfessions) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Editar Perfil</h1>

      <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Nome" />
      <textarea name="about" value={formData.about} onChange={handleChange} className="input-field" placeholder="Sobre" />

      <div className="grid grid-cols-2 gap-4">
        <input name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="Cidade" />
        <input name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="Estado" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Profissões</label>
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

      <hr />
      <h2 className="text-lg font-semibold">Foto de Perfil</h2>
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
