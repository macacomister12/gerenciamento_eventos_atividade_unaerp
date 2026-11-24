// Troque pela URL pública da API no Render (sem barra no final)
const API_URL = 'https://SEU-BACKEND.onrender.com';

const lista = document.getElementById('lista');
const statusEl = document.getElementById('status');
const form = document.getElementById('form-evento');
const botao = document.getElementById('botao');
const mensagem = document.getElementById('mensagem');

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function criarEvento(ev) {
  const [dia, mes] = (ev.data_evento || '').split('/');
  const li = document.createElement('li');
  li.className = 'evento';

  const data = document.createElement('div');
  data.className = 'data';
  data.innerHTML = '<span class="dia"></span><span class="mes"></span>';
  data.querySelector('.dia').textContent = dia || '--';
  data.querySelector('.mes').textContent = MESES[Number(mes) - 1] || '';

  const corpo = document.createElement('div');
  const h3 = document.createElement('h3');
  h3.textContent = ev.titulo;
  const local = document.createElement('p');
  local.className = 'local';
  local.textContent = `${ev.local} · ${ev.data_evento}`;
  corpo.append(h3, local);

  if (ev.descricao) {
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = ev.descricao;
    corpo.append(desc);
  }

  li.append(data, corpo);
  return li;
}

async function carregarEventos() {
  statusEl.className = 'status';
  statusEl.textContent = 'Carregando eventos…';
  try {
    const resp = await fetch(`${API_URL}/eventos`);
    if (!resp.ok) throw new Error();
    const eventos = await resp.json();

    lista.replaceChildren(...eventos.map(criarEvento));
    statusEl.textContent = eventos.length ? '' : 'Nenhum evento cadastrado. Use o formulário para adicionar o primeiro.';
  } catch {
    statusEl.className = 'status erro';
    statusEl.textContent = 'Não foi possível carregar os eventos. Confira a URL da API e tente de novo.';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.className = 'mensagem';
  mensagem.textContent = '';

  // input type="date" devolve aaaa-mm-dd; a tabela espera dd/mm/aaaa
  const [ano, mes, dia] = form.data.value.split('-');
  const corpo = {
    titulo: form.titulo.value.trim(),
    descricao: form.descricao.value.trim(),
    data_evento: `${dia}/${mes}/${ano}`,
    local: form.local.value.trim(),
  };

  botao.disabled = true;
  try {
    const resp = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao cadastrar.');

    form.reset();
    mensagem.className = 'mensagem ok';
    mensagem.textContent = 'Evento cadastrado.';
    carregarEventos();
  } catch (err) {
    mensagem.className = 'mensagem erro';
    mensagem.textContent = err.message || 'Erro ao cadastrar o evento.';
  } finally {
    botao.disabled = false;
  }
});

carregarEventos();
