// src/app/components/ParticipantControls.js

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

export default function ParticipantControls() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Veuillez sélectionner une photo à uploader.');
      return;
    }

    if (!user) {
      alert('Utilisateur non authentifié.');
      return;
    }

    setLoading(true);

    try {
      // Créer un formulaire de données pour l'upload
      const formData = new FormData();
      formData.append('file', file);

      // Envoyer le fichier à l'API route
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.url;

        // Mettre à jour la table 'plats' avec l'URL de l'image
        const { data, error } = await supabase
          .from('plats')
          .update({ photo_url: imageUrl })
          .eq('participant_id', user.id);

        if (error) {
          console.error('Erreur lors de la mise à jour du plat :', error);
          alert(`Erreur lors de la mise à jour du plat : ${error.message || 'Erreur inconnue'}`);
        } else {
          alert('Photo uploadée et plat mis à jour avec succès.');
        }
      } else {
        alert('Erreur lors de l\'upload de la photo.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo :', error);
      alert('Erreur lors de l\'upload de la photo.');
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-md mt-6">
      <h2 className="text-xl mb-4 text-center">Uploader votre plat</h2>
      <form onSubmit={uploadPhoto} className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Uploader la Photo'}
        </button>
      </form>
    </div>
  );
}
