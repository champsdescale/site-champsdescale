# Les Champs d'Escale — site + app de gestion

## Mise en route (à faire une seule fois, avec les identifiants de l'association)

Ces étapes ne peuvent pas être automatisées : elles nécessitent l'email de
l'association (`champsdescale@gmail.com`) sur le poste qui y a déjà accès.

1. **Créer le projet Supabase**
   - Aller sur https://supabase.com, créer un compte avec l'email de l'association.
   - "New project", choisir un nom (ex: `champsdescale`) et une région proche (Europe).
   - Une fois créé : menu "SQL Editor" → coller le contenu de `supabase/schema.sql` → Run.
   - Menu "Project Settings" → "API" : noter l'URL du projet et la clé `anon public`.
   - Menu "Authentication" → "Users" → "Add user" : créer le compte partagé de l'équipe
     (email + mot de passe à leur transmettre).

2. **Créer le repo GitHub**
   - Créer un nouveau repo sous le compte GitHub de l'association (ou transférer ce repo local dessus).
   - `git remote add origin <url-du-repo>` puis `git push -u origin main`.

3. **Créer le site Netlify**
   - Aller sur https://netlify.com, créer un compte avec l'email de l'association.
   - "Add new site" → "Import an existing project" → sélectionner le repo GitHub.
   - Dans "Site settings" → "Environment variables", ajouter :
     - `NEXT_PUBLIC_SUPABASE_URL` = l'URL notée à l'étape 1
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé notée à l'étape 1
   - Déclencher un déploiement ("Trigger deploy").
   - Le site est alors accessible sur une URL du type `<nom>.netlify.app`.

4. **Basculer le domaine (plus tard, une fois le site validé)**
   - Voir la section "Domaine" de `docs/superpowers/specs/2026-09-21-champsdescale-landing-design.md`.

## Développement local

```bash
npm install
cp .env.local.example .env.local   # puis remplir avec les valeurs de l'étape 1
npm run dev
```
