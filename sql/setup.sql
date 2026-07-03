-- Curva Polinomial - Setup do Banco de Dados
-- Slug: curva-polinomial
-- Prefixo de tabelas: cvp_

-- ============================================================================
-- 1. Registro da ferramenta na tabela de aplicacoes
-- ============================================================================
INSERT INTO public.applications (slug, name, url, category, is_active)
VALUES ('curva-polinomial', 'Curva Polinomial', 'https://allanuchoa.github.io/MMQ/', 'Engineering', true)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      url = EXCLUDED.url,
      category = EXCLUDED.category,
      is_active = EXCLUDED.is_active;

-- ============================================================================
-- 2. Template RLS para tabelas futuras da ferramenta
-- ============================================================================
-- Descomente e adapte quando criar tabelas com prefixo cvp_ no v2+

-- CREATE TABLE IF NOT EXISTS public.cvp_exemplo (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   created_at timestamptz DEFAULT now() NOT NULL
-- );

-- ALTER TABLE public.cvp_exemplo ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS "cvp_exemplo_access" ON public.cvp_exemplo;
-- CREATE POLICY "cvp_exemplo_access" ON public.cvp_exemplo FOR ALL USING (
--   auth.uid() IS NOT NULL AND
--   EXISTS (
--     SELECT 1 FROM public.user_applications ua
--     JOIN public.applications app ON app.id = ua.application_id
--     WHERE ua.user_id = auth.uid()
--       AND app.slug = 'curva-polinomial'
--       AND app.is_active = true
--   )
-- );
