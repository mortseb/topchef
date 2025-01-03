import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabaseClient';

export default function Attente() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      router.push('/');
    }
  }, []);

  if (!user) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Page d'Attente</h1>
      {user.role === 'HOST' && <HostControls />}
      {user.role === 'PARTICIPANT' && <ParticipantControls />}
      {user.role === 'JUGE' && <JugeControls />}
    </div>
  );
}

// Composant pour l'HOST
function HostControls() {
  const [plats, setPlats] = useState([]);

  const selectPlat = async (platId) => {
    // Logique pour sélectionner un plat et notifier les utilisateurs
    // Vous pouvez utiliser Supabase Realtime ou polling pour mettre à jour les autres utilisateurs
  };

  return (
    <div>
      <h2>Contrôles de l'HOST</h2>
      <button onClick={() => selectPlat('id_plat_1')}>Sélectionner Plat 1</button>
      {/* Ajoutez d'autres boutons pour chaque plat */}
    </div>
  );
}

// Composant pour les Participants
function ParticipantControls() {
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(`plats/${Date.now()}_${file.name}`, file);

    if (data) {
      const photoUrl = supabase.storage.from('photos').getPublicUrl(data.path).publicURL;
      // Mettre à jour la table des plats avec l'URL de la photo
    } else {
      alert('Erreur lors de l\'upload.');
    }
  };

  return (
    <div>
      <h2>Uploader votre plat</h2>
      <input type="file" onChange={uploadPhoto} />
    </div>
  );
}

// Composant pour les Juges
function JugeControls() {
  return (
    <div>
      <h2>Interface du Juge</h2>
      {/* Interface spécifique pour les juges si nécessaire */}
    </div>
  );
}
