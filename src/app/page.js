// src/app/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [prenom, setPrenom] = useState('');
  const router = useRouter();
  const prenomsAutorises = [
    'Alicia',
    'Fred',
    'France',
    'Sébastien',
    'Raphaël',
    'Nathan',
    'Edwyn',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifiez si le prénom est autorisé
    if (!prenomsAutorises.includes(prenom)) {
      alert('Prénom non reconnu.');
      return;
    }

    // Récupérez les détails de l'utilisateur depuis Supabase
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('prenom', prenom)
      .single();

    if (error || !data) {
      alert('Erreur lors de la connexion. Veuillez réessayer.');
      return;
    }

    // Stocker l'utilisateur dans le localStorage
    localStorage.setItem('user', JSON.stringify(data));

    // Rediriger vers la page d'attente
    router.push('/attente');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl mb-4 text-center">Bienvenue au Top Chef</h1>
        <input
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Entrez votre prénom"
          required
          className="border p-2 w-full mb-4 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
        >
          Entrer
        </button>
      </form>
    </div>
  );
}
