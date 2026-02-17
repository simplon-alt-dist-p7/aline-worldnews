INSERT INTO writer.t_categories(title) VALUES
('Culture'),
('Technologie'),
('Intelligence Artificielle'),
('Transport'),
('Sport'),
('Science'),
('Économie'),
('Santé'),
('Politique'),
('Environnement')
ON CONFLICT (title) DO NOTHING;
