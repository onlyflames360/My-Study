export interface Week {
  id: string;
  week_id: string;
  start_date: string;
  end_date: string;
  status: "current" | "previous";
  generated_at: string | null;
  created_at: string;
}

export interface BibleText {
  reference: string;
  text: string;
  translation: string;
}

export interface DesarrolloPunto {
  punto: string;
  contenido: string;
}

export interface Discurso {
  id: string;
  week_id: string;
  tema: string;
  textos_input: string[];
  duracion: number;
  puntos: string[];
  introduccion: string | null;
  desarrollo: DesarrolloPunto[];
  conclusion: string | null;
  bible_texts: BibleText[];
  created_at: string;
  updated_at: string;
}

export interface Salida {
  id: string;
  week_id: string;
  source_url: string | null;
  source_title: string | null;
  introduccion: string | null;
  texto_biblico: BibleText[];
  aplicacion: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reunion {
  id: string;
  week_id: string;
  section: string;
  order_num: number;
  title: string | null;
  content: string | null;
  bible_texts: BibleText[];
  created_at: string;
  updated_at: string;
}

export interface Atalaya {
  id: string;
  week_id: string;
  article_title: string | null;
  paragraph_num: number;
  question: string | null;
  answer: string | null;
  bible_texts: BibleText[];
  created_at: string;
  updated_at: string;
}

export type FamiliaMode = "familiar" | "adultos";

export interface EstudioFamilia {
  id: string;
  week_id: string;
  mode: FamiliaMode;
  tema: string | null;
  introduccion: string | null;
  lectura_biblica: string | null;
  ensenanza: string | null;
  aplicacion: string | null;
  preguntas: string | null;
  objetivo_espiritual: string | null;
  bible_texts: BibleText[];
  created_at: string;
  updated_at: string;
}
