require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
// Render define a porta pela variável PORT
const PORT = process.env.PORT || 3000;

const { SUPABASE_URL, SUPABASE_KEY, FRONTEND_URL } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_KEY nas variáveis de ambiente.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// CORS: libera apenas o frontend (ou todos, se FRONTEND_URL não estiver definida)
app.use(cors({ origin: FRONTEND_URL ? FRONTEND_URL.replace(/\/$/, '') : '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', servico: 'API de Eventos Acadêmicos' });
});

// Listagem
app.get('/eventos', async (req, res) => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Não foi possível listar os eventos.' });
  }
  res.json(data);
});

// Cadastro
app.post('/eventos', async (req, res) => {
  const { titulo, descricao, data_evento, local } = req.body || {};

  if (!titulo || !data_evento || !local) {
    return res.status(400).json({ erro: 'Título, data e local são obrigatórios.' });
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data_evento)) {
    return res.status(400).json({ erro: 'Use a data no formato dd/mm/aaaa.' });
  }
  if (titulo.length > 150 || local.length > 100) {
    return res.status(400).json({ erro: 'Título (máx. 150) ou local (máx. 100) muito longo.' });
  }

  const { data, error } = await supabase
    .from('eventos')
    .insert([{ titulo, descricao: descricao || null, data_evento, local }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Não foi possível cadastrar o evento.' });
  }
  res.status(201).json(data);
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
