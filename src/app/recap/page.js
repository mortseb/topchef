'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Recap() {
  const [user, setUser] = useState(null);
  const [notations, setNotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchNotations();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchNotations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notations')
      .select(`
        id,
        etoiles,
        guess_prenom,
        plat_id,
        plats ( nom_plat ),
        juge: utilisateurs ( prenom )
      `);

    if (error) {
      console.error('Erreur lors de la récupération des notations :', error.message || error);
      alert('Erreur lors de la récupération des notations. Veuillez vérifier la console pour plus de détails.');
    } else {
      // Trier les données côté frontend
      const sortedData = data.sort((a, b) => {
        const nomA = a.plats.nom_plat.toUpperCase(); // Ignorer la casse
        const nomB = b.plats.nom_plat.toUpperCase(); // Ignorer la casse
        if (nomA < nomB) return -1;
        if (nomA > nomB) return 1;
        return 0; // Les noms sont égaux
      });
      setNotations(sortedData);
    }
    setLoading(false);
  };

  const handleModification = async (notationId, newGuess, newEtoiles) => {
    if (!newGuess || !newEtoiles) {
      alert('Tous les champs doivent être remplis.');
      return;
    }

    if (newEtoiles < 1 || newEtoiles > 5) {
      alert('Les étoiles doivent être entre 1 et 5.');
      return;
    }

    const { data, error } = await supabase
      .from('notations')
      .update({ guess_prenom: newGuess, etoiles: parseInt(newEtoiles) })
      .eq('id', notationId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la notation :', error.message || error);
      alert('Erreur lors de la mise à jour de la notation.');
    } else {
      alert('Notation mise à jour avec succès.');
      fetchNotations();
    }
  };

  const handleValidation = async () => {
    // Logique pour calculer les moyennes et les classements
    // Cette logique peut être implémentée ici ou sur le backend
    // Par exemple, envoyer un email ou mettre à jour l'état de l'application

    // Exemple : Mettre à jour le stage dans 'app_state' à 'recap'
    const { data, error } = await supabase
      .from('app_state')
      .update({ stage: 'attente' })
      .eq('id', 1); // Assurez-vous que l'ID est correct selon votre table

    if (error) {
      console.error('Erreur lors de la mise à jour du stage :', error.message || error);
      alert('Erreur lors de la validation des résultats.');
    } else {
      alert('Résultats validés et calculés.');
      router.push('/attente'); // Redirection vers la page d'attente
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 text-center">Récapitulatif des Notations</h1>
      {notations.length === 0 ? (
        <p>Aucune notation disponible.</p>
      ) : (
        <div className="space-y-4">
          {notations.map((notation) => (
            <div key={notation.id} className="border p-4 rounded shadow-md">
              <p><strong>Plat :</strong> {notation.plats.nom_plat}</p>
              <p><strong>Juge :</strong> {notation.juge.prenom}</p>
              <p><strong>Guess :</strong> {notation.guess_prenom}</p>
              <p><strong>Étoiles :</strong> {notation.etoiles}</p>
              {/* Si l'HOST veut permettre des modifications, décommentez ci-dessous */}
              {/* {user.role === 'HOST' && (
                <button
                  onClick={() => {
                    const newGuess = prompt('Nouveau Guess :', notation.guess_prenom);
                    const newEtoiles = prompt('Nouvelles Étoiles (1-5) :', notation.etoiles);
                    handleModification(notation.id, newGuess, newEtoiles);
                  }}
                  className="bg-yellow-500 text-white p-2 rounded mt-2 hover:bg-yellow-600 transition"
                >
                  Modifier
                </button>
              )} */}
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-6">
        <button
          onClick={handleValidation}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          Valider et Calculer les Résultats
        </button>
      </div>
    </div>
  );
}
