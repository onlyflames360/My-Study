-- =====================================================
-- My Study - Initial Schema
-- =====================================================

-- Weeks table: only 2 weeks exist at any time
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id TEXT UNIQUE NOT NULL,         -- e.g. "2026-W16"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'previous')),
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Discursos (on-demand, user input required)
CREATE TABLE discursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  textos_input TEXT[],                  -- user-provided references
  duracion INTEGER NOT NULL DEFAULT 10, -- minutes
  puntos TEXT[],                        -- user-provided points
  introduccion TEXT,
  desarrollo JSONB DEFAULT '[]',        -- [{punto, contenido}]
  conclusion TEXT,
  bible_texts JSONB DEFAULT '[]',       -- [{reference, text, translation}]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Salidas (auto-generated weekly)
CREATE TABLE salidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  source_url TEXT,
  source_title TEXT,
  introduccion TEXT,
  texto_biblico JSONB DEFAULT '[]',
  aplicacion TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reuniones (auto-generated weekly)
CREATE TABLE reuniones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  section TEXT NOT NULL,                -- e.g. "TESOROS DE LA BIBLIA"
  order_num INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  bible_texts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Atalayas (auto-generated weekly)
CREATE TABLE atalayas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  article_title TEXT,
  paragraph_num INTEGER NOT NULL,
  question TEXT,
  answer TEXT,
  bible_texts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bible verses cache
CREATE TABLE bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  translation TEXT DEFAULT 'NWT',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_weeks_status ON weeks(status);
CREATE INDEX idx_discursos_week ON discursos(week_id);
CREATE INDEX idx_salidas_week ON salidas(week_id);
CREATE INDEX idx_reuniones_week ON reuniones(week_id);
CREATE INDEX idx_reuniones_order ON reuniones(week_id, order_num);
CREATE INDEX idx_atalayas_week ON atalayas(week_id);
CREATE INDEX idx_atalayas_order ON atalayas(week_id, paragraph_num);
CREATE INDEX idx_bible_verses_ref ON bible_verses(reference);
