-- supabase/schema.sql
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'hero', 'announcement', 'text', 'team', 'values', 'menus', 'documents',
    'gallery', 'faq', 'map', 'testimonials', 'contact_footer'
  )),
  position integer not null default 0,
  visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sections enable row level security;

-- Public read access (the landing page has no login).
create policy "sections are publicly readable"
  on sections for select
  to anon, authenticated
  using (true);

-- Only authenticated users (the shared team account) can write.
create policy "only authenticated users can insert sections"
  on sections for insert
  to authenticated
  with check (true);

create policy "only authenticated users can update sections"
  on sections for update
  to authenticated
  using (true)
  with check (true);

create policy "only authenticated users can delete sections"
  on sections for delete
  to authenticated
  using (true);

-- Starter content: what the association sees the first time they open the
-- site, instead of a blank page. Guarded so re-running this script later
-- (e.g. to pick up a policy change) never duplicates it.
do $$
begin
  if not exists (select 1 from sections limit 1) then
    insert into sections (type, position, visible, content) values
      ('hero', 0, true, '{
        "badge": "Accueil de loisirs périscolaire",
        "titre": "Les Champs d''Escale",
        "sousTitre": "Un accueil chaleureux pour vos enfants avant et après l''école",
        "texteCta": "Découvrir nos services"
      }'::jsonb),
      ('gallery', 1, true, '{
        "titre": "En images",
        "photos": [
          {"url": "", "alt": "Activité manuelle avec les enfants"},
          {"url": "", "alt": "Sortie au parc"},
          {"url": "", "alt": "Goûter collectif"}
        ]
      }'::jsonb),
      ('text', 2, true, '{
        "titre": "Le périscolaire",
        "texte": "Nous accueillons vos enfants tous les matins et tous les soirs d''école, dans un cadre bienveillant."
      }'::jsonb),
      ('menus', 3, true, '{
        "titre": "Menus de la semaine",
        "lundi": "Purée de carottes, poulet rôti, riz, fromage blanc",
        "mardi": "Salade de blé, sauté de bœuf, haricots verts, compote",
        "mercredi": "Œuf mimosa, gratin de poisson, épinards, yaourt",
        "jeudi": "Carottes râpées, rôti de dinde, purée, fruit de saison",
        "vendredi": "Taboulé, poisson pané, petits pois, crème dessert"
      }'::jsonb),
      ('team', 4, true, '{
        "titre": "Notre équipe",
        "membres": [
          {"nom": "Julie Martin", "role": "Directrice", "photoUrl": ""}
        ]
      }'::jsonb),
      ('faq', 5, true, '{
        "titre": "Questions fréquentes",
        "items": [
          {"question": "Quels horaires ?", "reponse": "7h30-18h30"}
        ]
      }'::jsonb),
      ('contact_footer', 6, true, '{
        "adresse": "7 chemin de la souffel",
        "telephone": "09.62.23.88.62",
        "email": "champsdescale@gmail.com"
      }'::jsonb);
  end if;
end $$;

-- Storage bucket for uploaded PDFs and photos.
insert into storage.buckets (id, name, public)
values ('section-files', 'section-files', true)
on conflict (id) do nothing;

create policy "section files are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'section-files');

create policy "only authenticated users can upload section files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'section-files');

create policy "only authenticated users can delete section files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'section-files');

-- Global site appearance (colors + font), a single row shared by the whole
-- site — not per-section, hence a separate table from `sections`.
create table if not exists site_settings (
  id text primary key default 'default',
  color_bg text not null default '#EDE6D3',
  color_text text not null default '#3B2F23',
  color_accent text not null default '#A3A374',
  font_family text not null default 'quicksand',
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values ('default')
on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "site settings are publicly readable"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "only authenticated users can update site settings"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);
