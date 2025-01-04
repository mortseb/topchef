// src/components/HostControls.js

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function HostControls() {
  const [plats, setPlats] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchPlats();

    // Créer un channel pour les changements dans la table 'plats'
    const channel = supabase.channel('public:plats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plats' },
        payload => {
          fetchPlats();
        }
      )
      .subscribe();

    // Nettoyer l'abonnement à la destruction du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlats = async () => {
    const { data, error } = await supabase.from('plats').select('*');
    if (error) {
      console.error('Erreur lors de la récupération des plats :', error);
    } else {
      setPlats(data);
    }
  };

  const selectPlat = (platId) => {
    console.log('Naviguer vers le plat avec ID :', platId); // Debugging
    router.push(`/plat/${platId}`); // Assurez-vous que cet ID existe dans la table 'plats'
  };

  // Fonction pour changer le stage à 'recap'
  const goToRecap = async () => {
    const { error } = await supabase
      .from('app_state')
      .update({ stage: 'recap' })
      .eq('id', 1); // Assurez-vous que l'ID est correct

    if (error) {
      console.error('Erreur lors du changement de stage :', error);
      alert('Erreur lors du changement de stage.');
    } else {
      console.log('Stage changé à recap');
      // La redirection se fera automatiquement via la souscription dans la page d'attente
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl mb-4 text-center">Contrôles de l'HOST</h2>
      {plats.length === 0 ? (
        <p>Aucun plat disponible.</p>
      ) : (
        plats.map((plat) => (
          <button
            key={plat.id}
            onClick={() => selectPlat(plat.id)}
            className="bg-green-500 text-white p-2 m-2 rounded w-full hover:bg-green-600 transition"
          >
            Sélectionner {plat.nom_plat}
          </button>
        ))
      )}
      {/* Bouton pour aller au récapitulatif */}
      <button
        onClick={goToRecap}
        className="bg-blue-500 text-white p-2 m-2 rounded w-full hover:bg-blue-600 transition"
      >
        Aller au Récapitulatif
      </button>
    </div>
  );
}
