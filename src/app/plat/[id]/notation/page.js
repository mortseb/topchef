// src/app/plat/[id]/notation/page.js

'use client';

import { useRouter, useParams } from 'next/navigation'; // Utiliser useParams
import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function NotationPage() {
  const router = useRouter();
  const params = useParams(); // Utiliser useParams
  const platId = params.id; // Récupérer l'ID du plat
  const [plat, setPlat] = useState(null);
  const [user, setUser] = useState(null);
  const [guess, setGuess] = useState('');
  const [etoiles, setEtoiles] = useState('');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  // Supprimer l'état 'submitted'
  // const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!platId) return;

    const fetchPlat = async () => {
      const { data, error } = await supabase
        .from('plats')
        .select('*')
        .eq('id', platId)
        .single();
      if (error) {
        console.error('Erreur lors de la récupération du plat :', error);
      } else {
        setPlat(data);
      }
    };

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('role', 'PARTICIPANT');
      if (error) {
        console.error('Erreur lors de la récupération des participants :', error);
      } else {
        setParticipants(data);
      }
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchPlat();
      fetchParticipants();
    } else {
      router.push('/');
    }
  }, [platId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guess || !etoiles) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

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
      // Rediriger vers la page d'attente
      router.push('/attente');
      // Optionnel : Afficher un message avant la redirection
      /*
      setSubmitted(true);
      setTimeout(() => {
        router.push('/attente');
      }, 2000); // Redirige après 2 secondes
      */
    }

    setLoading(false);
  };

  if (!plat || !user) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;

  /*
  if (submitted) {
    return <p className="text-green-500 text-center mt-8">Merci pour votre notation !</p>;
  }
  */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl mb-4">Notation du Plat : {plat.nom_plat}</h1>
      {plat.photo_url && (
        <img
          src={plat.photo_url}
          alt={plat.nom_plat}
          className="w-64 h-64 object-cover mb-4 rounded"
        />
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
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
    </div>
  );
}
