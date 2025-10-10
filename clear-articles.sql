-- Script SQL para limpar todos os artigos do banco de dados
DELETE FROM articles;

-- Verificar quantos artigos restam
SELECT COUNT(*) as total_artigos FROM articles;
