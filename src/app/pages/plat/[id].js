import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../utils/supabaseClient';

export default function Plat() {
  const router = useRouter();
  const { id } = router.query;
  const [plat, setPlat] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchPlat = async () => {
      const { data, error } = await supabase
        .from('plats')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setPlat(data);
    };

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      fetchPlat();
    } else {
      router.push('/');
    }
  }, [id]);

  if (!plat || !user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>{plat.nom_plat}</h1>
      <img src={plat.photo_url} alt={plat.nom_plat} width="300" />
      <p><strong>Ingrédients:</strong> {plat.ingredients}</p>
      <p>{plat.description}</p>
      {user.role === 'HOST' && <HostPlatDetails plat={plat} />}
      {user.role === 'JUGE' && <NotationForm plat={plat} />}
    </div>
  );
}

function HostPlatDetails({ plat }) {
  const proceedToNotation = () => {
    // Logique pour passer à la page de notation
  };

  return (
    <div>
      <button onClick={proceedToNotation}>Terminer la dégustation</button>
    </div>
  );
}

function NotationForm({ plat }) {
  const [guess, setGuess] = useState('');
  const [etoiles, setEtoiles] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enregistrer la notation dans Supabase
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Devinez qui a fait ce plat :</label>
      <select value={guess} onChange={(e) => setGuess(e.target.value)} required>
        <option value="">Sélectionnez</option>
        <option value="Raphaël">Raphaël</option>
        <option value="Nathan">Nathan</option>
        <option value="Edwyn">Edwyn</option>
        {/* Ajoutez d'autres options si nécessaire */}
      </select>
      <label>Notez le plat :</label>
      <select value={etoiles} onChange={(e) => setEtoiles(e.target.value)} required>
        <option value="">Sélectionnez</option>
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Étoile{n > 1 && 's'}</option>)}
      </select>
      <button type="submit">Soumettre</button>
    </form>
  );
}
