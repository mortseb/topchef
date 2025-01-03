import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const [prenom, setPrenom] = useState('');
  const router = useRouter();
  const prénomsAutorises = ['Alicia', 'Fred', 'France', 'Sébastien', 'Raphaël', 'Nathan', 'Edwyn'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('prenom', prenom)
      .single();

    if (data) {
      // Stocker l'utilisateur dans le contexte ou localStorage
      localStorage.setItem('user', JSON.stringify(data));
      router.push('/attente');
    } else {
      alert('Prénom non reconnu.');
    }
  };

  return (
    <div>
      <h1>Bienvenue au Top Chef</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={prenom} 
          onChange={(e) => setPrenom(e.target.value)} 
          placeholder="Entrez votre prénom" 
          required 
        />
        <button type="submit">Entrer</button>
      </form>
    </div>
  );
}
