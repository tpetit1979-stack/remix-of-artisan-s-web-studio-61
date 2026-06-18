
-- Insert tenant EasyDep
INSERT INTO tenants (id, company_name, slug, domain, phone, email, city, address, seo_boost_text, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'EasyDep',
  'easydep',
  'plomberie-easydep.fr',
  '06 67 38 57 14',
  'contact@plomberie-easydep.fr',
  'Sète',
  'Sète, Hérault',
  'EasyDep, votre expert en entretien et installation de poêles à granulés, poêles à bois, cheminées et climatisation sur le bassin de Thau. Intervention rapide à Sète, Frontignan, Balaruc-les-Bains, Mèze, Gigean et Marseillan. Marques partenaires : Joncoux, MCZ, Brisach, Cadel, Supra, Atlantic, Free Point, Oranier, Red, Aduro, AMG, Paterno, Interstoves, Casatelli. Mise en service à partir de 145€.',
  true
);

-- Insert site settings
INSERT INTO site_settings (tenant_id, hero_title, hero_subtitle, primary_color, cta_text, seo_meta_title, seo_meta_description)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Votre expert poêles & chauffage sur le bassin de Thau',
  'Entretien, dépannage, ramonage et installation de poêles à granulés, poêles à bois et cheminées. Intervention rapide à Sète et alentours. À partir de 145€.',
  '#D2691E',
  'Prendre rendez-vous',
  'EasyDep – Expert Poêles & Chauffage à Sète | Entretien, Installation, Ramonage',
  'EasyDep intervient à Sète, Frontignan, Balaruc et alentours pour l''entretien, le dépannage et l''installation de poêles à granulés, poêles à bois et cheminées. Devis gratuit.'
);

-- Insert services with valid UUIDs
INSERT INTO services (id, tenant_id, name, slug, description, is_featured, is_active, sort_order, seo_title_template, seo_description_template) VALUES
('11111111-1111-1111-1111-111111111101', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Poêle à granulés', 'poele-a-granules', 'Entretien, dépannage et ramonage de poêles à granulés toutes marques. Intervention rapide par un technicien certifié.', true, true, 1, '{service} à {city} – EasyDep', 'EasyDep assure l''entretien, le dépannage et le ramonage de votre {service} à {city}. Intervention rapide, devis gratuit.'),
('11111111-1111-1111-1111-111111111102', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Poêle à bois & Cheminée', 'poele-a-bois-cheminee', 'Entretien, dépannage et ramonage de poêles à bois et cheminées. Nettoyage complet et contrôle de sécurité.', true, true, 2, '{service} à {city} – EasyDep', 'Entretien et ramonage de {service} à {city} par EasyDep. Technicien qualifié, tarifs transparents.'),
('11111111-1111-1111-1111-111111111103', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Installation de poêles', 'installation-poeles', 'Pose complète de poêles à granulés et à bois, toutes marques. Étude technique, installation et mise en service.', true, true, 3, 'Installation {service} à {city} – EasyDep', 'EasyDep installe votre poêle à granulés ou à bois à {city}. Pose complète, toutes marques, mise en service à partir de 145€.'),
('11111111-1111-1111-1111-111111111104', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Climatisation', 'climatisation', 'Entretien de systèmes de climatisation. Nettoyage des filtres, contrôle du circuit frigorifique et vérification des performances.', false, true, 4, 'Entretien {service} à {city} – EasyDep', 'EasyDep assure l''entretien de votre climatisation à {city}. Maintenance préventive et curative.');

-- Insert service areas (6 cities × 4 services = 24 rows)
INSERT INTO service_areas (tenant_id, service_id, city, city_slug, is_primary) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Sète', 'sete', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Frontignan', 'frontignan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Balaruc-les-Bains', 'balaruc-les-bains', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Mèze', 'meze', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Gigean', 'gigean', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111101', 'Marseillan', 'marseillan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Sète', 'sete', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Frontignan', 'frontignan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Balaruc-les-Bains', 'balaruc-les-bains', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Mèze', 'meze', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Gigean', 'gigean', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111102', 'Marseillan', 'marseillan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Sète', 'sete', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Frontignan', 'frontignan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Balaruc-les-Bains', 'balaruc-les-bains', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Mèze', 'meze', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Gigean', 'gigean', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111103', 'Marseillan', 'marseillan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Sète', 'sete', true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Frontignan', 'frontignan', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Balaruc-les-Bains', 'balaruc-les-bains', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Mèze', 'meze', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Gigean', 'gigean', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111104', 'Marseillan', 'marseillan', false);

-- Insert portfolio items
INSERT INTO portfolio (tenant_id, title, description, image_url, city, service_id, is_published, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Installation poêle à granulés MCZ à Sète', 'Installation complète d''un poêle à granulés MCZ dans une maison de ville à Sète. Raccordement au conduit existant et mise en service.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'Sète', '11111111-1111-1111-1111-111111111103', true, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ramonage cheminée à Frontignan', 'Ramonage complet d''une cheminée à foyer ouvert dans une villa à Frontignan. Nettoyage du conduit et contrôle de tirage.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 'Frontignan', '11111111-1111-1111-1111-111111111102', true, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Entretien poêle à granulés à Balaruc', 'Entretien annuel d''un poêle à granulés Cadel à Balaruc-les-Bains. Nettoyage complet, vérification des joints et test de combustion.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 'Balaruc-les-Bains', '11111111-1111-1111-1111-111111111101', true, 3);
