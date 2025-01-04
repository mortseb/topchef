// src/app/plat/[id]/page.js

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function PlatPage() {
  const router = useRouter();
  const params = useParams();
  const platId = params.id;
  const [plat, setPlat] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!platId) {
      console.error('Aucun ID de plat trouvé dans les paramètres.');
      setError('ID de plat manquant.');
      return;
    }

    const fetchPlat = async () => {
      try {
        console.log(`Fetching plat avec ID: ${platId}`);
        const { data, error } = await supabase
          .from('plats')
          .select('*')
          .eq('id', platId)
          .single();

        if (error) {
          console.error('Erreur lors de la récupération du plat :', error);
          setError('Erreur lors de la récupération du plat.');
        } else {
          console.log('Plat récupéré:', data);
          setPlat(data);
        }
      } catch (err) {
        console.error('Erreur inconnue lors de la récupération du plat :', err);
        setError('Erreur inconnue lors de la récupération du plat.');
      }
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchPlat();
    } else {
      console.warn('Utilisateur non authentifié, redirection vers la page d\'accueil.');
      router.push('/');
    }
  }, [platId, router]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!plat || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl mb-4">{plat.nom_plat}</h1>
      {plat.photo_url && (
        <img
          src={plat.photo_url}
          alt={plat.nom_plat}
          className="w-64 h-64 object-cover mb-4 rounded"
        />
      )}
      <p className="mb-2"><strong>Ingrédients :</strong> {plat.ingredients}</p>
      <p className="mb-4"><strong>Description :</strong> {plat.description}</p>
      {user.role === 'HOST' && <HostPlatDetails plat={plat} />}
      {user.role === 'JUGE' && <NotationForm plat={plat} />}
    </div>
  );
}

function HostPlatDetails({ plat }) {
  const router = useRouter();

  const handleFinish = () => {
    // Redirection vers la page de notation
    router.push(`/plat/${plat.id}/notation`);
  };

  return (
    <button
      onClick={handleFinish}
      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
    >
      Terminer la Dégustation
    </button>
  );
}

function NotationForm({ plat }) {
  const [guess, setGuess] = useState('');
  const [etoiles, setEtoiles] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        console.log('Fetching participants...');
        const { data, error } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('role', 'PARTICIPANT');

        if (error) {
          console.error('Erreur lors de la récupération des participants :', error);
          setError('Erreur lors de la récupération des participants.');
        } else {
          console.log('Participants récupérés:', data);
          setParticipants(data);
        }
      } catch (err) {
        console.error('Erreur inconnue lors de la récupération des participants :', err);
        setError('Erreur inconnue lors de la récupération des participants.');
      }
    };

    fetchParticipants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guess || !etoiles) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      const juge = JSON.parse(localStorage.getItem('user'));

      const { data, error } = await supabase.from('notations').insert([
        {
          plat_id: plat.id,
          juge_id: juge.id,
          etoiles: parseInt(etoiles),
          guess_prenom: guess,
        },
      ]);

      if (error) {
        console.error('Erreur lors de la soumission de la notation :', error);
        alert('Erreur lors de la soumission de la notation.');
      } else {
        alert('Notation soumise avec succès.');
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Erreur inconnue lors de la soumission de la notation :', err);
      alert('Erreur inconnue lors de la soumission de la notation.');
    }

    setLoading(false);
  };

  if (error) {
    return (
      <div className="w-full max-w-md">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (submitted) {
    return <p className="text-green-500">Merci pour votre notation !</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-xl mb-4 text-center">Notation du Plat</h2>
      <label className="block mb-4">
        Devinez qui a fait ce plat :
        <select
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          required
          className="border p-2 w-full mt-1 rounded"
        >
          <option value="">Sélectionnez</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.prenom}>
              {participant.prenom}
            </option>
          ))}
        </select>
      </label>
      <label className="block mb-4">
        Notez le plat :
        <select
          value={etoiles}
          onChange={(e) => setEtoiles(e.target.value)}
          required
          className="border p-2 w-full mt-1 rounded"
        >
          <option value="">Sélectionnez</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} Étoile{n > 1 && 's'}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded w-full hover:bg-green-600 transition"
        disabled={loading}
      >
        {loading ? 'Soumission...' : 'Soumettre'}
      </button>
    </form>
  );
}
