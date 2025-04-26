// app/components/ProfileMediaUploader.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProfileMediaUploader({ userId }: { userId: string }) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const uploadImage = async (file: File, preset: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    const response = await fetch('https://api.cloudinary.com/v1_1/dhkkz3vlv/image/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Erro no upload');
    const data = await response.json();
    return data;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAvatar(true);
    try {
      const result = await uploadImage(file, 'utask-avatar');

      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, url: result.secure_url, publicId: result.public_id })
      });

      if (!res.ok) throw new Error('Erro ao salvar avatar');
      setAvatar(result.secure_url);
    } catch (err) {
      console.error(err);
      alert('Falha no upload do avatar');
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadImage(file, 'utask-gallery');

        await fetch('/api/upload/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, url: result.secure_url, publicId: result.public_id })
        });

        setGallery(prev => [...prev, result.secure_url]);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao subir imagens para a galeria');
    } finally {
      setLoadingGallery(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Foto de Perfil</label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        {loadingAvatar && <p>Enviando avatar...</p>}
        {avatar && <Image src={avatar} alt="avatar" width={100} height={100} className="rounded-full mt-2" />}
      </div>

      <div>
        <label className="block font-medium mb-2">Galeria de Serviços</label>
        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
        {loadingGallery && <p>Enviando imagens...</p>}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {gallery.map((url, index) => (
            <Image key={index} src={url} alt={`galeria-${index}`} width={100} height={100} className="rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
