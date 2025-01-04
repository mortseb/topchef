'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Resultat() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'HOST') {
      setUser(storedUser);
      fetchResults();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchResults = async () => {
    setLoading(true);
    // Exemple de requête pour obtenir les moyennes par plat
    const { data, error } = await supabase
      .from('notations')
      .select(`
        plat_id,
        plats ( nom_plat ),
        etoiles
      `);

    if (error) {
      console.error('Erreur lors de la récupération des résultats :', error.message || error);
      alert('Erreur lors de la récupération des résultats. Veuillez vérifier la console pour plus de détails.');
    } else {
      // Calcul des moyennes
      const moyennes = data.reduce((acc, notation) => {
        const { plat_id, plats, etoiles } = notation;
        if (!acc[plat_id]) {
          acc[plat_id] = {
            nom_plat: plats.nom_plat,
            totalEtoiles: 0,
            count: 0,
          };
        }
        acc[plat_id].totalEtoiles += etoiles;
        acc[plat_id].count += 1;
        return acc;
      }, {});

      // Transformer en tableau
      const resultsArray = Object.values(moyennes).map(plat => ({
        nom_plat: plat.nom_plat,
        moyenne: (plat.totalEtoiles / plat.count).toFixed(2),
        totalVotes: plat.count,
      }));

      // Trier par moyenne décroissante
      resultsArray.sort((a, b) => b.moyenne - a.moyenne);

      setResults(resultsArray);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement des résultats...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6 text-center">Résultats</h1>
      {results.length === 0 ? (
        <p>Aucun résultat disponible.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nom du Plat</th>
              <th className="py-2 px-4 border-b">Moyenne des Étoiles</th>
              <th className="py-2 px-4 border-b">Nombre de Votes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="text-center">
                <td className="py-2 px-4 border-b">{result.nom_plat}</td>
                <td className="py-2 px-4 border-b">{result.moyenne}</td>
                <td className="py-2 px-4 border-b">{result.totalVotes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="text-center mt-6">
        <button
          onClick={() => router.push('/attente')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Retour à l'Attente
        </button>
      </div>
    </div>
  );
}
