# TODO — Page Profil + Page Réglages

## Étapes d'implémentation

- [ ] **1. SQL** — exécuter `scripts/add-profile-table.sql` dans Supabase Dashboard
- [ ] **2. `lib/profile.ts`** — fonctions `fetchProfile`, `updateProfile`, `uploadAvatar`, `fetchProgressStats`, `fetchRecentSessions`
- [ ] **3. `components/Avatar.tsx`** — photo de profil avec fallback initiales, tappable
- [ ] **4. `components/StatCard.tsx`** — tuile métrique label + valeur chiffrée
- [ ] **5. `app/profile.tsx`** — page profil : avatar + grille stats + HSK par niveau + sessions récentes
- [ ] **6. `app/settings.tsx`** — page réglages : infos perso + déconnexion
- [ ] **7. `app/(tabs)/home.tsx`** — bouton avatar header + suppression sign-out
- [ ] **8. `DESIGN_SYSTEM.md`** — documenter `Avatar` et `StatCard`

## Stats à afficher (page profil)

| Label | Calcul |
|-------|--------|
| Sessions | `COUNT(*)` |
| Cartes vues | `SUM(unique_cards)` |
| Maîtrisées | `consecutive_correct >= 3` |
| Moy. /ses. | `AVG(got_count / unique_cards)` — non pondérée |
| Réussite globale | `SUM(got_count) / SUM(unique_cards)` — pondérée |

## Dépendances à installer

```bash
expo install expo-image-picker expo-image-manipulator
```
