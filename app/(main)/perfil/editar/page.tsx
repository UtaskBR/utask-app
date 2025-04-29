
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MultiSelectProfessions from '@/components/MultiSelectProfessions'; // Assuming component is placed in components folder

// Define the Photo type (adjust if needed based on actual structure)
interface TempPhoto {
  id: string;
  url: string;
  isTemp?: boolean; // Optional flag for temporary uploads
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

export default function EditarPerfilPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({ name: '', about: '', city: '', state: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [gallery, setGallery] = useState<TempPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // State for save operation
  const [error, setError] = useState('');
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]); // State to hold selected profession IDs
  const [initialLoading, setInitialLoading] = useState(true); // State for initial user data load

  const router = useRouter();
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Load user data on mount
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      setInitialLoading(true);
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
            // Ensure gallery photos have a consistent structure
            setGallery(data.photos?.map((p: { id: string; url: string }) => ({ id: p.id, url: p.url, isTemp: false })) || []);
            // Set initially selected professions from user data
            if (data.professions) {
              setSelectedProfessions(data.professions.map((p: { id: string }) => p.id));
            }
          }
        })
        .catch(err => {
          setError('Erro ao carregar dados do usuário.');
          console.error(err);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
     if (status === 'unauthenticated') {
       router.push('/auth/login'); // Redirect if not logged in
     }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Callback for the MultiSelectProfessions component
  const handleProfessionsChange = (selectedIds: string[]) => {
    setSelectedProfessions(selectedIds);
  };

  // Unified save function using the PUT method
  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    setError('');

    try {
      const updatePayload = {
        ...formData,
        image: avatarUrl, // Include avatar URL if it's managed here
        professionIds: selectedProfessions, // Send the array of selected profession IDs
      };

      console.log("Enviando para PUT /api/users/...": updatePayload);

      const res = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || `Erro ao atualizar perfil: ${res.status}`);
      }

      alert('Perfil atualizado com sucesso!');
      router.push(`/perfil/${session.user.id}`); // Redirect to profile view page
      // Optionally: router.refresh() if you want to refresh data on the current page

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      setError(`Falha ao atualizar perfil: ${errorMessage}`);
      alert(`Falha ao atualizar perfil: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Upload handlers remain the same --- 
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    
    setIsUploading(true);
    const originalAvatarUrl = avatarUrl; // Store original URL for potential revert
    
    try {
      const localPreview: string = URL.createObjectURL(file);
      setAvatarUrl(localPreview);
      
      const formDataCloudinary: FormData = new FormData();
      formDataCloudinary.append('upload_preset', 'utask-avatar'); // Use appropriate preset
      formDataCloudinary.append('file', file);
      
      const cloudinaryRes: Response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`,
        {
          method: 'POST',
          body: formDataCloudinary,
        }
      );
      
      if (!cloudinaryRes.ok) {
        const errorData = await cloudinaryRes.json();
        throw new Error(`Erro Cloudinary: ${errorData.error?.message || cloudinaryRes.status}`);
      }
      
      const cloudinaryData: CloudinaryResponse = await cloudinaryRes.json();
      setAvatarUrl(cloudinaryData.secure_url); // Update with final URL
      
      // Note: We update the avatarUrl state here, and it will be saved 
      // along with other profile data in handleSave. No separate API call needed here.
      
      if (avatarInputRef.current) {
        (avatarInputRef.current as HTMLInputElement).value = '';
      }
      // alert('Foto de perfil pronta para ser salva.'); // Inform user it's staged
    } catch (error) {
      console.error("Erro no upload de avatar:", error);
      alert("Falha no upload da foto de perfil. Tente novamente.");
      setAvatarUrl(originalAvatarUrl); // Revert to original URL on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    setIsUploading(true);
    const tempId = `temp-${Date.now()}`;
    let localPreview: string | null = null;

    try {
      localPreview = URL.createObjectURL(file);
      const tempPhoto: TempPhoto = { id: tempId, url: localPreview, isTemp: true };
      setGallery((prev) => [...prev, tempPhoto]);

      const formDataCloudinary: FormData = new FormData();
      formDataCloudinary.append('upload_preset', 'utask-gallery'); // Use appropriate preset
      formDataCloudinary.append('file', file);

      const cloudinaryRes: Response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhkkz3vlv'}/image/upload`,
        {
          method: 'POST',
          body: formDataCloudinary,
        }
      );

      if (!cloudinaryRes.ok) {
        const errorData = await cloudinaryRes.json();
        throw new Error(`Erro Cloudinary: ${errorData.error?.message || cloudinaryRes.status}`);
      }

      const cloudinaryData: CloudinaryResponse = await cloudinaryRes.json();

      // Call API to save gallery photo reference to DB
      const res: Response = await fetch('/api/upload/gallery', { // Assuming this API exists and works
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          url: cloudinaryData.secure_url,
          publicId: cloudinaryData.public_id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro ao salvar foto na galeria: ${res.status}`);
      }

      const data: GalleryApiResponse = await res.json();

      // Replace temp photo with real one
      setGallery((prev) => 
        prev.map(p => p.id === tempId ? { ...data.photo, isTemp: false } : p)
      );

      if (galleryInputRef.current) {
        (galleryInputRef.current as HTMLInputElement).value = '';
      }
      // alert('Foto adicionada à galeria com sucesso!');

    } catch (error) {
      console.error("Erro no upload para galeria:", error);
      alert("Falha ao adicionar foto à galeria. Tente novamente.");
      // Remove temp photo on error
      setGallery((prev) => prev.filter(p => p.id !== tempId));
    } finally {
      setIsUploading(false);
      if (localPreview) {
        URL.revokeObjectURL(localPreview); // Clean up blob URL
      }
    }
  };
  // --- End of upload handlers ---

  // Display loading state while fetching initial data
  if (status === 'loading' || initialLoading) {
    return <div className="max-w-3xl mx-auto p-6 text-center">Carregando dados do perfil...</div>;
  }

  // Display error message if fetching failed
  if (error && !isSaving) { // Don't show initial load error if a save error occurred
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Editar Perfil</h1>

      {/* Display save error message */}
      {error && isSaving && (
         <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro ao Salvar!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Avatar Upload Section */}
        <div className="flex items-center space-x-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full object-cover border border-secondary-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500">
              {isUploading ? 'Enviando...' : 'Alterar Foto de Perfil'}
            </label>
            <input
              id="avatar-upload"
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploading}
              className="hidden"
            />
            <p className="text-xs text-secondary-500 mt-1">PNG, JPG, GIF até 5MB</p>
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary-700">Nome</label>
          <input id="name" name="name" className="mt-1 input-field" value={formData.name} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="about" className="block text-sm font-medium text-secondary-700">Sobre</label>
          <textarea id="about" name="about" rows={4} className="mt-1 input-field" value={formData.about} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-secondary-700">Cidade</label>
            <input id="city" name="city" className="mt-1 input-field" value={formData.city} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-secondary-700">Estado</label>
            <input id="state" name="state" className="mt-1 input-field" value={formData.state} onChange={handleChange} />
          </div>
        </div>

        {/* MultiSelectProfessions Component Integration */}
        <MultiSelectProfessions 
          selectedProfessionIds={selectedProfessions}
          onChange={handleProfessionsChange}
        />

        {/* Save Button */}
        <div className="pt-4">
          <button 
            onClick={handleSave} 
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
            disabled={isSaving || isUploading}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <hr className="my-8 border-secondary-200" />

      {/* Gallery Section */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-3">Galeria de Trabalhos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {gallery.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <img 
                src={photo.url} 
                alt="Foto da galeria" 
                className={`rounded-lg h-full w-full object-cover border border-secondary-200 ${photo.isTemp ? 'opacity-50' : ''}`} 
              />
              {photo.isTemp && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <span className="text-white text-xs font-medium">Enviando...</span>
                </div>
              )}
              {/* TODO: Add delete button for gallery photos? */}
            </div>
          ))}
          {/* Placeholder for upload button */} 
          <label htmlFor="gallery-upload" className="cursor-pointer aspect-square border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center text-secondary-500 hover:border-primary-400 hover:text-primary-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-1 text-xs">Adicionar Foto</span>
          </label>
        </div>
        
        <input
          id="gallery-upload"
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryUpload}
          disabled={isUploading}
          className="hidden"
        />
        {isUploading && <p className="text-sm text-secondary-500 mt-1">Enviando foto para galeria...</p>}
      </div>

    </div>
  );
}

