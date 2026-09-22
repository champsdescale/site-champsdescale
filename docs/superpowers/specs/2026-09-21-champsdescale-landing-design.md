# Champs d'Escale — Landing page + app de gestion

**Date :** 2026-09-21
**Statut :** validé, prêt pour plan d'implémentation

## Contexte

Les Champs d'Escale est une association gérant un accueil de loisirs périscolaire (Stutzheim-Offenheim, 67). Leur site actuel (champsdescale.com) est fait sur Wix : difficile à maintenir pour une équipe non technique, mise en page peu flexible.

L'objectif est de remplacer ce site par une landing page simple et moderne, associée à une application de gestion permettant à l'équipe du périscolaire de modifier le contenu elle-même, en quasi temps réel, sans dépendre d'un développeur.

Le nom de domaine (champsdescale.com) n'est pas une priorité immédiate — la bascule DNS se fera plus tard (voir section Domaine).

## Objectifs / Critères de succès

- L'équipe (non technique) peut modifier tout le contenu du site (textes, PDF, photos, ordre des rubriques) sans aide extérieure.
- Une modification sauvegardée dans l'app de gestion apparaît sur le site public immédiatement (pas de build/déploiement à déclencher).
- Le site est utilisable et lisible sur mobile (usage principal attendu des parents).
- L'app de gestion est protégée : personne d'autre que l'équipe ne peut modifier le contenu.
- Coût d'infrastructure nul ou quasi nul (association, petit trafic).

## Hors scope V1

- Système de blocks génériques entièrement libre (façon closrm/Wix) — on reste sur des types de sections fixes, prédéfinis dans le code.
- Multi-comptes avec rôles différenciés — un seul compte partagé pour l'équipe.
- Étape de brouillon/validation avant publication — la sauvegarde publie directement.
- Bascule du nom de domaine — préparée mais pas exécutée en V1.

## Architecture générale

Un seul projet **Next.js**, déployé sur **Netlify**, avec deux zones dans la même app :
- **Site public** (`/`) — landing page en long scroll, accessible à tous, sans connexion.
- **App de gestion** (`/admin`) — protégée par connexion, réservée à l'équipe.

Contenu et fichiers stockés sur **Supabase** (Postgres + Auth + Storage), sous un compte créé avec l'adresse mail de l'association (`champsdescale@gmail.com`) — voir note d'accès ci-dessous.

Un seul repo Git (GitHub), un seul site Netlify connecté dessus (déploiement auto à chaque push).

### Note opérationnelle — accès aux comptes

Les comptes Supabase/Netlify seront créés avec l'email de l'association, pas avec un compte personnel du développeur. La création de compte, récupération des clés API et connexion devront se faire sur un poste ayant déjà les accès de l'association. Ces étapes seront documentées comme une checklist précise à exécuter manuellement (pas automatisables par le développeur).

## Modèle de contenu (Supabase)

Table unique `sections` :

| Colonne | Rôle |
|---|---|
| `id` | identifiant de la section |
| `type` | `hero`, `text`, `team`, `values`, `documents`, `gallery`, `faq`, `map`, `testimonials`, `contact_footer` |
| `position` | ordre d'affichage |
| `visible` | affichée ou masquée sur le site public |
| `content` | JSON, forme fixe selon le `type` |

Forme du `content` par type (V1) :

- **hero** : `{ badge, titre, sousTitre, texteCta }`
- **text** : `{ titre, texte }` — réutilisé pour "Le périscolaire", "Programme", "Infos pratiques"
- **team** : `{ titre, membres: [{ nom, role, photoUrl }] }`
- **values** : `{ titre, points: [{ label, texte }] }` (pas d'icône emoji — icône ligne optionnelle en V2 si besoin)
- **documents** : `{ titre, fichiers: [{ nom, url }] }` — réutilisé pour "Menu" et "Documents"
- **gallery** : `{ titre, photos: [{ url, alt }] }`
- **faq** : `{ titre, items: [{ question, reponse }] }`
- **map** : `{ titre, adresse, latLng }`
- **testimonials** : `{ titre, citations: [{ texte, auteur }] }`
- **contact_footer** : `{ adresse, telephone, email }`

Chaque type a une forme fixe et connue à l'avance. L'équipe peut éditer, réordonner, masquer, dupliquer une section existante d'un type donné ; ajouter un nouveau *type* de section nécessite un développement.

Les fichiers (PDF, photos) sont stockés dans un bucket **Supabase Storage** ; seule leur URL publique est gardée dans `content`.

## Rubriques V1 (ordre par défaut)

1. Hero
2. Le périscolaire (type `text`)
3. Notre équipe (type `team`)
4. Notre pédagogie / valeurs (type `values`)
5. Menu (type `documents`)
6. Programme (type `text`, avec pièces jointes possibles via une section `documents` complémentaire si besoin)
7. Galerie photos (type `gallery`)
8. Documents (type `documents`)
9. FAQ (type `faq`)
10. Infos pratiques (type `text`)
11. Localisation (type `map`)
12. Témoignages parents (type `testimonials`)
13. Contact / Footer (type `contact_footer`)

L'ordre est modifiable dans l'app de gestion ; cette liste n'est que la position de départ.

## Direction visuelle

- Fond beige chaud (`#EDE6D3`), texte brun anthracite (`#3B2F23`), accents olive (`#A3A374`) — cohérent avec le logo fourni.
- Typo script pour le nom de l'association, sans-serif lisible pour le reste.
- Angles nets, peu d'arrondi — style "éditorial/carnet".
- Aucune icône emoji : icônes en trait fin (line-art) si besoin, cohérentes avec le style dessiné du logo (lapin).
- Contenu 100% responsive (usage mobile attendu).
- Photos/images : placeholders en V1, à remplacer par l'équipe via l'admin (upload) une fois disponibles.

## Rendu du site public

Composant serveur Next.js qui récupère les sections `visible=true` triées par `position`, et rend le composant correspondant à chaque `type` (mapping type → composant de rendu, pas de logique conditionnelle éparpillée).

Rendu **sans cache** (`force-dynamic`) : chaque visite va chercher l'état courant en base. Pas de délai de build, pas d'étape de republication. Le volume de trafic attendu (petite association) rend ce choix largement suffisant en performance.

## App de gestion (`/admin`)

Layout en 3 zones, inspiré du pattern déjà utilisé dans un projet existant (closrm / FunnelBuilderV2), simplifié pour ce cas d'usage :

- **Liste des sections** (gauche) : icône de type + titre de chaque section, poignée de glisser-déposer pour réordonner, bascule masquer/afficher, dupliquer, supprimer. Bouton "Ajouter une section" ouvrant un menu des 10 types disponibles.
- **Preview live** (centre) : rendu réel de la page publique (mêmes composants que le site public), mis à jour à chaque modification.
- **Panneau d'édition** (au clic sur une section) : formulaire adapté au `type` de la section sélectionnée (champs texte, upload de fichier, liste de membres, etc.).

**Sauvegarde** : autosave débouncée (~1s après la dernière modification), indicateur d'état ("Enregistrement... / Enregistré / Erreur, réessai...") repris du pattern closrm. Pas de bouton "Sauvegarder" explicite.

**Connexion** : formulaire email/mot de passe (Supabase Auth, compte unique partagé par l'équipe). Toute route `/admin` redirige vers ce formulaire si non connecté.

## Sécurité

- Lecture de `sections` (table + storage) : publique, nécessaire au rendu du site sans connexion.
- Écriture (insert/update/delete/upload) : réservée à l'utilisateur authentifié (Row Level Security Supabase), impossible sans le compte de l'équipe même en connaissant l'URL de l'API.
- Aucun identifiant en clair dans le code ; clés Supabase en variables d'environnement Netlify.

## Domaine

Le domaine `champsdescale.com` est enregistré chez Network Solutions, mais ses nameservers pointent vers Wix (`ns8/ns9.wixdns.net`), qui gère aussi des enregistrements MX vers OVH (email actif sur ce domaine).

Plan de bascule (hors scope V1, à exécuter plus tard) :
1. Ne pas changer les nameservers ni transférer le domaine.
2. Modifier uniquement l'enregistrement A (+ `www`) dans le panneau DNS de Wix pour pointer vers Netlify, en laissant les enregistrements MX (email OVH) intacts.
3. Netlify fournit un certificat HTTPS automatique une fois le domaine actif.
4. Ne basculer qu'une fois le nouveau site testé et validé sur son URL Netlify temporaire, pour ne jamais couper le site actuel.

## Tests & validation

- Site public : vérification manuelle (desktop + mobile), pas de suite de tests lourde vu la simplicité du rendu.
- App de gestion : tests ciblés sur la logique à risque de régression silencieuse — réordonnancement des sections, ajout/suppression de type, autosave débouncée.
- Vérification TypeScript (`tsc`) systématique avant tout déploiement.
- Test manuel dans un navigateur réel (ajout de section, upload de fichier, réorganisation, login) avant de considérer une fonctionnalité terminée.

## Hors scope explicitement écarté (YAGNI)

- Générateur de blocks totalement libre.
- Multi-comptes avec permissions différenciées.
- Brouillon/validation avant publication.
- Cache/ISR sur le site public (le rendu dynamique suffit au volume attendu).
