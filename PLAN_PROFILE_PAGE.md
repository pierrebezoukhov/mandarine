# Plan — Page Profil + Page Réglages

## Vue d'ensemble

Deux nouvelles pages :
1. **Profil** — dédiée à l'expérience et au tracking de progression, accessible depuis l'accueil
2. **Réglages** — infos personnelles et préférences, accessible via l'icône ⚙️ en haut à droite du profil

---

## 1. Point d'accès depuis l'accueil

- Bouton avatar (photo ou initiales en fallback) dans le header de `home.tsx`, en haut à gauche
- Remplace le bouton "Sign out" actuel (déplacé dans Réglages)
- Navigation : `router.push('/profile')`

---

## 2. Routes créées

| Route | Fichier | Accès |
|-------|---------|-------|
| `/profile` | `app/profile.tsx` | Depuis l'accueil (avatar) |
| `/settings` | `app/settings.tsx` | Depuis le profil (⚙️ haut droite) |

---

## 3. Base de données & Storage Supabase

### Script SQL : `scripts/add-profile-table.sql`

```sql
CREATE TABLE IF NOT EXISTS profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  native_lang   TEXT DEFAULT 'fr',
  target_hsk    INT  DEFAULT 6,
  avatar_url    TEXT,               -- URL publique Supabase Storage
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Bucket Supabase Storage : `avatars`
- Accès public (les URLs sont lisibles sans auth)
- Convention de nommage : `avatars/{user_id}.jpg`
- Compression côté client avant upload (cible : < 200 KB)

---

## 4. Coût des photos de profil (évaluation)

### Hypothèses
- Taille moyenne d'un avatar après compression : **~150 KB**
- Chargement de la photo à chaque ouverture du profil
- Images servies via CDN Supabase (egress **mis en cache**)

### Coûts Supabase Storage

| Poste | Free tier | Pro ($25/mois) | Overage |
|-------|-----------|----------------|---------|
| Stockage fichiers | 1 GB inclus | 100 GB inclus | $0.021 / GB |
| Egress (non-caché) | 2–5 GB | 250 GB inclus | $0.09 / GB |
| Egress (CDN caché) | — | — | $0.03 / GB |

### Projection par volume d'utilisateurs

| Utilisateurs | Stockage avatars | Egress/mois (10 vues/user) | Coût stockage | Coût egress (caché) |
|---|---|---|---|---|
| 100 | ~15 MB | ~150 MB | < $0.01 | < $0.01 |
| 1 000 | ~150 MB | ~1.5 GB | < $0.01 | < $0.05 |
| 10 000 | ~1.5 GB | ~15 GB | ~$0.03 | ~$0.45 |
| 100 000 | ~15 GB | ~150 GB | ~$0.31 | ~$4.50 |

### Conclusion
- **Coût négligeable** jusqu'à ~10 000 utilisateurs actifs
- Les photos de profil étant très petites et peu modifiées, le **CDN cache efficacement**
- Mesure principale de contrôle : **compresser côté client** avant upload (ex. `expo-image-manipulator`)
- **Recommandation** : implémenter le upload dès maintenant, le coût ne justifie pas de le différer

---

## 5. Nouvelle lib : `lib/profile.ts`

```typescript
fetchProfile(userId: string): Promise<Profile>
updateProfile(userId: string, data: Partial<Profile>): Promise<void>
uploadAvatar(userId: string, imageUri: string): Promise<string>  // retourne l'URL publique
fetchProgressStats(userId: string): Promise<ProgressStats>
fetchRecentSessions(userId: string, limit?: number): Promise<SessionSummary[]>
```

**Types :**

```typescript
type Profile = {
  user_id: string;
  display_name: string | null;
  native_lang: string;
  target_hsk: number;
  avatar_url: string | null;
};

type ProgressStats = {
  totalSessions: number;
  totalCards: number;
  totalGot: number;
  totalForgot: number;
  successRate: number;
  uniqueCardsMastered: number;  // consecutive_correct >= 3
  byHskLevel: Record<number, { seen: number; got: number }>;
};

type SessionSummary = {
  id: string;
  deck_name: string;
  card_count: number;
  got_count: number;
  forgot_count: string;
  completed_at: string;
};
```

---

## 6. Page Profil — `app/profile.tsx`

**Entièrement dédiée à la progression. Pas de nom, pas d'email.**

```
┌─────────────────────────────────────┐
│  ← Retour          Profil        ⚙️  │  ← ⚙️ → /settings
├─────────────────────────────────────┤
│                                     │
│         [ photo de profil ]         │
│           (tap pour changer)        │
│                                     │
├─────────────────────────────────────┤
│  PROGRESSION GLOBALE                │
│  ┌──────────┐  ┌──────────┐         │
│  │Sessions  │  │Cartes    │         │
│  │   42     │  │  380     │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │Réussite  │  │Maîtrisées│         │
│  │  76%     │  │   94     │         │
│  └──────────┘  └──────────┘         │
│                                     │
├─────────────────────────────────────┤
│  PAR NIVEAU HSK                     │
│  HSK 1  ████████░░  80%  (160/200)  │
│  HSK 2  █████░░░░░  50%  (75/150)   │
│  HSK 3  ██░░░░░░░░  22%  (33/150)   │
│  ...                                │
│                                     │
├─────────────────────────────────────┤
│  SESSIONS RÉCENTES                  │
│  HSK 1 · 20 cartes · 85% · il y 2j │
│  HSK 2 · 15 cartes · 70% · il y 5j │
│  ...                           [+]  │
└─────────────────────────────────────┘
```

**Sections détaillées :**

- **Avatar** : photo de profil centrée, tappable pour changer via `expo-image-picker` → compression → upload Supabase Storage. Fallback : cercle avec initiales (depuis `display_name` en Réglages, ou initiale d'email).
- **Progression globale** : grille 2×2 de stat cards (sessions, cartes vues, taux de réussite, cartes maîtrisées)
- **Par niveau HSK** : lignes HSK 1→6 avec `ProgressBar` existant + pourcentage
- **Sessions récentes** : 5 dernières sessions avec deck, score, date relative — bouton "Voir toutes"

---

## 7. Page Réglages — `app/settings.tsx`

```
┌─────────────────────────────────────┐
│  ← Retour        Réglages           │
├─────────────────────────────────────┤
│  INFORMATIONS PERSONNELLES          │
│  ┌─────────────────────────────┐    │
│  │ Nom affiché        [input]  │    │
│  │ Langue maternelle  [picker] │    │
│  │ Objectif HSK       [1-6]    │    │
│  └─────────────────────────────┘    │
│             [Enregistrer]           │
│                                     │
├─────────────────────────────────────┤
│  COMPTE                             │
│  email@example.com (lecture seule)  │
│                                     │
│  [Se déconnecter]                   │
└─────────────────────────────────────┘
```

---

## 8. Modifications de `app/(tabs)/home.tsx`

- Ajouter bouton avatar (photo ou initiales) dans le header, en haut à gauche → `router.push('/profile')`
- Supprimer le bouton "Sign out" standalone

---

## 9. Dépendances à installer

```bash
expo install expo-image-picker expo-image-manipulator
```

- `expo-image-picker` — sélection photo depuis la galerie
- `expo-image-manipulator` — compression/resize avant upload (→ ~150 KB)

---

## 10. Nouveaux composants design system

**2 nouveaux composants** réutilisables seront créés et documentés :

| Composant | Fichier | Description | Utilisé dans |
|-----------|---------|-------------|--------------|
| **`Avatar`** | `components/Avatar.tsx` | Photo de profil avec fallback initiales, tappable | Header accueil, page profil |
| **`StatCard`** | `components/StatCard.tsx` | Tuile métrique : label + grande valeur chiffrée | Page profil (grille 2×2) |

Les autres éléments visuels de la page profil (ligne HSK, ligne session récente) resteront internes à `profile.tsx` — trop spécifiques pour être extraits (cf. convention `DESIGN_SYSTEM.md` § "What stays in screens").

---

## 11. Ordre d'implémentation

| Étape | Fichier | Description |
|-------|---------|-------------|
| 1 | `scripts/add-profile-table.sql` | Script SQL table `profiles` (à exécuter dans Supabase Dashboard) |
| 2 | `lib/profile.ts` | Fonctions API fetch/update profil + upload avatar + stats |
| 3 | `components/Avatar.tsx` | Nouveau composant design system |
| 4 | `components/StatCard.tsx` | Nouveau composant design system |
| 5 | `app/profile.tsx` | Page profil (avatar + progression uniquement) |
| 6 | `app/settings.tsx` | Page réglages (infos perso + déconnexion) |
| 7 | `app/(tabs)/home.tsx` | Bouton avatar + suppression sign-out |
| 8 | `DESIGN_SYSTEM.md` | Documentation des composants `Avatar` et `StatCard` |

---

## 11. Décisions d'architecture

- **Pas de nouveau Context** : fetch local dans chaque page avec `useState` + `useEffect`
- **Compression obligatoire** avant upload (1080×1080 max, JPEG 80%) via `expo-image-manipulator`
- **Cache CDN** : URL publique Supabase → mise en cache automatique, coût egress minimal
- **Optimistic update** sur l'avatar : affichage immédiat de l'image locale pendant l'upload
