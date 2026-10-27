import { useState, useEffect } from 'react';
import Baralho from './Baralho.jsx';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  const [enunciado, setEnunciado] = useState('');
  const [resposta, setResposta] = useState('');
  const [categoria, setCategoria] = useState('React');
  const [enviando, setEnviando] = useState(false);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [estaVirado, setEstaVirado] = useState(false);
  const [cartasRevisadasNaSessao, setCartasRevisadasNaSessao] = useState(0);

  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  const [modoEdicao, setModoEdicao] = useState(false);
  const [editEnunciado, setEditEnunciado] = useState('');
  const [editResposta, setEditResposta] = useState('');
  const [editCategoria, setEditCategoria] = useState('');

  const buscarFlashcards = () => {
    fetch('http://127.0.0.1:8000/flashcards')
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data.flashcards);
        setCarregando(false);
        setIndiceAtual(0);
      })
      .catch((err) => {
        console.error("Erro ao buscar flashcards:", err);
        setCarregando(false);
      });
  };

  useEffect(() => {
    buscarFlashcards();
  }, []);

  const flashcardsFiltrados = categoriaFiltro === 'Todas'
    ? flashcards
    : flashcards.filter(card => card.categoria === categoriaFiltro);

  const cardAtual = flashcardsFiltrados[indiceAtual];

  const criarFlashcard = (e) => {
    e.preventDefault();
    if (!enunciado.trim() || !resposta.trim()) return;

    setEnviando(true);

    fetch('http://127.0.0.1:8000/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enunciado, resposta, categoria }),
    })
      .then((res) => res.json())
      .then(() => {
        setEnunciado('');
        setResposta('');
        setEnviando(false);
        buscarFlashcards();
      })
      .catch((err) => {
        console.error("Erro ao criar flashcard:", err);
        setEnviando(false);
      });
  };

  const deletarFlashcard = (id) => {
    if (!window.confirm("Tens a certeza que desejas apagar este flashcard?")) return;

    fetch(`http://127.0.0.1:8000/flashcards/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          buscarFlashcards();
          setEstaVirado(false);
          setModoEdicao(false);
          if (indiceAtual > 0) setIndiceAtual((prev) => prev - 1);
        }
      })
      .catch((err) => console.error("Erro ao apagar flashcard:", err));
  };

  const iniciarEdicao = () => {
    if (!cardAtual) return;
    setEditEnunciado(cardAtual.enunciado);
    setEditResposta(cardAtual.resposta);
    setEditCategoria(cardAtual.categoria || 'Geral');
    setModoEdicao(true);
  };

  const salvarEdicao = (e) => {
    e.preventDefault();
    if (!cardAtual) return;

    fetch(`http://127.0.0.1:8000/flashcards/${cardAtual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        enunciado: editEnunciado,
        resposta: editResposta,
        categoria: editCategoria
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setModoEdicao(false);
        buscarFlashcards();
      })
      .catch((err) => console.error("Erro ao atualizar flashcard:", err));
  };

  const proximoCard = () => {
    setEstaVirado(false);
    setModoEdicao(false);
    setCartasRevisadasNaSessao((prev) => prev + 1);
    if (indiceAtual < flashcardsFiltrados.length - 1) {
      setIndiceAtual((prev) => prev + 1);
    } else {
      setIndiceAtual(0);
    }
  };

  const cardAnterior = () => {
    setEstaVirado(false);
    setModoEdicao(false);
    if (indiceAtual > 0) {
      setIndiceAtual((prev) => prev - 1);
    } else {
      setIndiceAtual(flashcardsFiltrados.length - 1);
    }
  };

  const categoriasUnicas = ['Todas', ...new Set(flashcards.map(c => c.categoria || 'Geral'))];
  
  const totalCards = flashcardsFiltrados.length;
  const progressoPorcentagem = totalCards > 0 
    ? Math.min(100, Math.round(((indiceAtual + 1) / totalCards) * 100)) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Cabeçalho */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-400 mb-1">
            Flashcards
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            Sessao ativa • <span className="text-indigo-300 font-bold">{cartasRevisadasNaSessao}</span> cartas revistas
          </p>
        </header>

        {/* Formulário */}
        <form onSubmit={criarFlashcard} className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-800/80 mb-6">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-300 mb-3">Criar Novo Card</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Categoria</label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: React"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Pergunta</label>
              <input
                type="text"
                value={enunciado}
                onChange={(e) => setEnunciado(e.target.value)}
                placeholder="Ex: O que e um Hook?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Resposta</label>
            <textarea
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Ex: Funcoes que permitem ligar ao estado..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows="2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium py-2 px-4 rounded-xl transition-all text-sm shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            {enviando ? 'A guardar...' : 'Adicionar Flashcard'}
          </button>
        </form>

        {/* Filtros */}
        {flashcards.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6 items-center justify-center">
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoriaFiltro(cat); setIndiceAtual(0); setEstaVirado(false); setModoEdicao(false); }}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  categoriaFiltro === cat 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Bloco Principal de Estudo */}
        {carregando ? (
          <p className="text-center text-slate-500 py-12">A carregar flashcards...</p>
        ) : flashcards.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Ainda nao tens flashcards criados.</p>
        ) : flashcardsFiltrados.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Nenhum flashcard nesta categoria.</p>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 p-6">
            
            {/* Barra de Progresso */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-900/40">
                  {cardAtual.categoria} • {Math.min(indiceAtual + 1, totalCards)} de {totalCards}
                </span>
                <span className="text-slate-400">{progressoPorcentagem}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${progressoPorcentagem}%` }}></div>
              </div>
            </div>

            {/* Ações da Carta */}
            <div className="flex justify-end gap-2 mb-3">
              {!modoEdicao && (
                <button onClick={iniciarEdicao} className="text-slate-400 hover:text-indigo-400 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                  Editar
                </button>
              )}
              <button onClick={() => deletarFlashcard(cardAtual.id)} className="text-slate-400 hover:text-red-400 text-xs font-medium px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                Apagar
              </button>
            </div>

            {modoEdicao ? (
              <form onSubmit={salvarEdicao} className="bg-slate-950 p-5 rounded-xl border border-indigo-500/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">Editar Card</h3>
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">Categoria</label>
                  <input type="text" value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-slate-400 mb-1">Pergunta</label>
                  <input type="text" value={editEnunciado} onChange={(e) => setEditEnunciado(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" required />
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-slate-400 mb-1">Resposta</label>
                  <textarea value={editResposta} onChange={(e) => setEditResposta(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" rows="2" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all cursor-pointer">Guardar</button>
                  <button type="button" onClick={() => setModoEdicao(false)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-800 cursor-pointer">Cancelar</button>
                </div>
              </form>
            ) : (
              <>
                <Baralho
                  cards={flashcardsFiltrados}
                  indice={indiceAtual}
                  virado={estaVirado}
                  onVirar={() => setEstaVirado((v) => !v)}
                  onProximo={proximoCard}
                  onAnterior={cardAnterior}
                />
              </>
            )}

          </div>
        )}
      </div>

      <footer className="text-center mt-12 text-slate-600 text-xs">
        Central de Flashcards • FastAPI e React
      </footer>
    </div>
  );
}

export default App;