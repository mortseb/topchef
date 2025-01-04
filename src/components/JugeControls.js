// src/components/JugeControls.js

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function JugeControls() {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);

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

// src/components/JugeControls.js

const fetchPlats = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('plats')
    .select('*')
    .not('photo_url', 'is', null) // Correction ici
    .order('nom_plat', { ascending: true }); // Ajout d'un ordre pour la clarté
  if (error) {
    console.error('Erreur lors de la récupération des plats :', error);
  } else {
    setPlats(data);
  }
  setLoading(false);
};


  if (loading) {
    return <p>Chargement des plats...</p>;
  }

  if (plats.length === 0) {
    return <p>Aucun plat disponible pour la dégustation.</p>;
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl mb-4 text-center">Interface du Juge</h2>
      {plats.map((plat) => (
        <div key={plat.id} className="border p-4 mb-4 rounded shadow-md">
          <h3 className="text-lg mb-2">{plat.nom_plat}</h3>
          {plat.photo_url && (
            <img
              src={plat.photo_url}
              alt={plat.nom_plat}
              className="w-full h-48 object-cover mb-2 rounded"
            />
          )}
          <p><strong>Ingrédients :</strong> {plat.ingredients}</p>
          <p><strong>Description :</strong> {plat.description}</p>
          {/* Ajoutez ici les boutons ou les liens pour noter le plat */}
        </div>
      ))}
    </div>
  );
}
