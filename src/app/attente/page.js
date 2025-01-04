'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HostControls from '../../components/HostControls';
import JugeControls from '../../components/JugeControls';
import { supabase } from '../../lib/supabaseClient';

export default function Attente() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [stage, setStage] = useState('attente');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      subscribeToStage();
    } else {
      router.push('/');
    }
  }, [router]);

  const subscribeToStage = () => {
    // Créer un channel pour écouter les mises à jour de la table 'app_state'
    const channel = supabase
      .channel('realtime-app-state') // Nom unique pour le channel
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_state' },
        payload => {
          const newStage = payload.new.stage;
          setStage(newStage);
          if (newStage === 'recap') {
            router.push('/recap');
          }
        }
      )
      .subscribe();

    // Récupérer le stage initial
    supabase
      .from('app_state')
      .select('stage')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur lors de la récupération du stage :', error);
        } else {
          setStage(data.stage);
          if (data.stage === 'recap') {
            router.push('/recap');
          }
        }
      });

    // Nettoyer l'abonnement à la destruction du composant
    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (!user) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl mb-6">Page d'Attente</h1>
      {user.role === 'HOST' && (
        <>
          <HostControls />
          {/* Bouton pour visionner les résultats */}
          <button
            onClick={() => router.push('/resultat')}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Voir les Résultats
          </button>
        </>
      )}
      {user.role === 'JUGE' && <JugeControls />}
      {/* Les Participants voient uniquement l'attente */}
      {user.role === 'PARTICIPANT' && (
        <p className="text-lg">En attente que l'HOST sélectionne un plat.</p>
      )}
    </div>
  );
}
