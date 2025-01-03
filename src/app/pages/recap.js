import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function Recap() {
  const [user, setUser] = useState(null);
  const [notations, setNotations] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchNotations();
    }
  }, []);

  const fetchNotations = async () => {
    const { data, error } = await supabase
      .from('notations')
      .select('*');
    if (data) setNotations(data);
  };

  const handleModification = async (notationId, newGuess, newEtoiles) => {
    const { data, error } = await supabase
      .from('notations')
      .update({ guess_prenom: newGuess, etoiles: newEtoiles })
      .eq('id', notationId);
    if (data) fetchNotations();
  };

  const handleValidation = () => {
    // Calculer les moyennes et les classements
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Récapitulatif des Notations</h1>
      {notations.map(notation => (
        <div key={notation.id}>
          <p>Plat: {notation.plat_id}</p>
          <p>Votre Guess: {notation.guess_prenom}</p>
          <p>Étoiles: {notation.etoiles}</p>
          <button onClick={() => handleModification(notation.id, 'Nouveau Guess', 5)}>Modifier</button>
        </div>
      ))}
      <button onClick={handleValidation}>Valider et Calculer les Résultats</button>
    </div>
  );
}
