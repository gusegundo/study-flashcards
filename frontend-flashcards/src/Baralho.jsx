import { useEffect, useRef, useState } from 'react';
import './Baralho.css';

/*
  BARALHO
  Mostra 3 cartas: a do meio (a carta atual) e as duas vizinhas (anterior e próxima).

  - Clicar na carta do meio  -> vira (pergunta <-> resposta)
  - Arrastar pra DIREITA     -> próxima carta
  - Arrastar pra ESQUERDA    -> carta anterior
  - Na última carta, "próxima" volta pra primeira; na primeira, "anterior" vai pra última
    (isso já é feito pelas funções proximoCard e cardAnterior do App.jsx, usando a lista
    que já está na memória, sem pedir nada de novo pra API)
*/

// Quantos pixels precisa arrastar pro lado pra valer como "trocar de carta"
const LIMITE_TROCA = 90;
// Se o dedo/mouse andar menos que isso, conta como CLIQUE (vira a carta) e não como arrasto
const LIMITE_CLIQUE = 6;
// Duração (ms) da animação da carta saindo. Tem que bater com --tempo-saida no Baralho.css
const TEMPO_SAIDA = 240;

// Textos grandes ganham letra menor pra caber na carta sem precisar rolar.
// Devolve uma classe extra que o Baralho.css usa (.longo / .enorme).
const classeTamanho = (texto = '') =>
  texto.length > 220 ? ' enorme' : texto.length > 110 ? ' longo' : '';

function Baralho({ cards, indice, virado, onVirar, onProximo, onAnterior }) {
  const total = cards.length;
  const card = cards[indice];

  // ---------- ESTADOS (valores que, quando mudam, redesenham a tela) ----------
  const [dx, setDx] = useState(0); // quanto a carta foi arrastada na horizontal (px)
  const [arrastando, setArrastando] = useState(false); // true enquanto o dedo/mouse está segurando
  const [saindo, setSaindo] = useState(0); // 0 = parada, 1 = voando pra direita, -1 = voando pra esquerda

  // ---------- REFS (guardam valores SEM redesenhar a tela) ----------
  const dxRef = useRef(0); // cópia do dx, sempre atualizada (o evento de soltar lê daqui)
  const inicioX = useRef(0); // posição X onde o arrasto começou
  const inicioT = useRef(0); // instante em que o arrasto começou (pra medir a velocidade)
  const moveu = useRef(false); // virou arrasto? (passou do LIMITE_CLIQUE)
  const pointerId = useRef(null); // qual dedo/mouse está controlando a carta
  const ocupado = useRef(false); // trava: impede trocar de carta duas vezes seguidas
  const timer = useRef(null); // o setTimeout da animação de saída

  // Se o componente sumir no meio da animação, cancela o timer
  useEffect(() => () => clearTimeout(timer.current), []);

  // ---------- TROCAR DE CARTA (com animação) ----------
  // direcao: 1 = próxima, -1 = anterior
  const trocar = (direcao) => {
    if (ocupado.current) return;
    if (total < 2) {
      // Com uma carta só não tem pra onde ir: só volta a carta pro lugar
      dxRef.current = 0;
      setDx(0);
      return;
    }
    ocupado.current = true;
    setSaindo(direcao); // a carta voa pro lado (o CSS faz a animação)
    timer.current = setTimeout(() => {
      // Quando a animação acaba, troca de verdade o índice no App
      if (direcao > 0) onProximo();
      else onAnterior();
      dxRef.current = 0;
      setDx(0);
      setSaindo(0);
      ocupado.current = false;
    }, TEMPO_SAIDA);
  };

  // ---------- TECLADO: setas ← → trocam de carta ----------
  // Sem lista de dependências de propósito: reconecta a cada render pra sempre usar
  // a versão mais nova de "trocar".
  useEffect(() => {
    const aoTeclar = (e) => {
      const alvo = e.target;
      const digitando =
        alvo instanceof HTMLElement &&
        (alvo.matches('input, textarea, select') || alvo.isContentEditable);
      if (digitando) return; // não rouba as setas de quem está digitando no formulário
      if (e.key === 'ArrowRight') trocar(1);
      if (e.key === 'ArrowLeft') trocar(-1);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  });

  // ---------- ARRASTAR (Pointer Events: funcionam igual pra mouse, dedo e caneta) ----------
  const aoPressionar = (e) => {
    if (ocupado.current || !e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return; // só botão esquerdo
    pointerId.current = e.pointerId;
    inicioX.current = e.clientX;
    inicioT.current = performance.now();
    moveu.current = false;
    dxRef.current = 0;
    setArrastando(true);
    // "Captura" o ponteiro: mesmo que o mouse saia da carta, os eventos continuam chegando
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const aoMover = (e) => {
    if (e.pointerId !== pointerId.current) return;
    const delta = e.clientX - inicioX.current;
    if (Math.abs(delta) > LIMITE_CLIQUE) moveu.current = true;
    dxRef.current = delta;
    setDx(delta); // a carta acompanha o dedo
  };

  const aoSoltar = (e) => {
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    setArrastando(false);

    // Quase não mexeu? Então foi um clique: vira a carta
    if (!moveu.current) {
      onVirar();
      return;
    }

    const delta = dxRef.current;
    const distancia = Math.abs(delta);
    const velocidade = distancia / Math.max(performance.now() - inicioT.current, 1); // px por ms
    // Troca se arrastou o bastante OU se foi um "peteleco" rápido
    if (distancia >= LIMITE_TROCA || (distancia > 30 && velocidade > 0.6)) {
      trocar(delta > 0 ? 1 : -1); // direita = próxima, esquerda = anterior
    } else {
      dxRef.current = 0;
      setDx(0); // arrastou pouco: a carta volta pro lugar
    }
  };

  const aoCancelar = (e) => {
    // O navegador cancelou o gesto (ex.: o sistema assumiu a rolagem)
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    setArrastando(false);
    dxRef.current = 0;
    setDx(0);
  };

  // Enter ou Espaço viram a carta quando ela está com foco (acessibilidade)
  const aoTeclarNaCarta = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onVirar();
    }
  };

  if (!card) return null;

  // ---------- VALORES CALCULADOS PRO VISUAL ----------
  const temVizinhas = total > 1;
  const anterior = cards[(indice - 1 + total) % total]; // volta ao fim se estiver na primeira
  const proxima = cards[(indice + 1) % total]; // volta ao começo se estiver na última

  // De 0 a 1: o quanto a carta já foi arrastada em relação ao limite de troca
  const progresso = Math.min(Math.abs(dx) / LIMITE_TROCA, 1);
  // A vizinha do lado pra onde você puxa "acorda" (fica maior e mais clara)
  const pEsquerda = saindo < 0 ? 1 : dx < 0 && saindo === 0 ? progresso : 0;
  const pDireita = saindo > 0 ? 1 : dx > 0 && saindo === 0 ? progresso : 0;

  // Onde a carta do meio está desenhada: acompanha o dedo, ou voa pra fora quando está saindo
  const estiloCarta =
    saindo !== 0
      ? { transform: `translateX(${saindo * 140}%) rotate(${saindo * 18}deg)`, opacity: 0 }
      : { transform: `translateX(${dx}px) rotate(${dx * 0.05}deg)` };

  return (
    <div className={`baralho${arrastando ? ' em-arrasto' : ''}`}>
      <div className="palco">
        {/* Vizinha da esquerda (carta anterior) */}
        {temVizinhas && (
          <div className="lateral esquerda" style={{ '--p': pEsquerda }} aria-hidden="true">
            <span className="chip">{anterior.categoria || 'Geral'}</span>
            <p>{anterior.enunciado}</p>
          </div>
        )}

        {/* Vizinha da direita (próxima carta) */}
        {temVizinhas && (
          <div className="lateral direita" style={{ '--p': pDireita }} aria-hidden="true">
            <span className="chip">{proxima.categoria || 'Geral'}</span>
            <p>{proxima.enunciado}</p>
          </div>
        )}

        {/* Carta do meio. O key={card.id} faz o React criar a carta de novo a cada troca,
            e isso dispara a animação de entrada */}
        <div
          key={card.id}
          className={`carta${virado ? ' virada' : ''}${arrastando ? ' arrastando' : ''}`}
          style={estiloCarta}
          role="button"
          tabIndex={0}
          aria-pressed={virado}
          aria-label={virado ? 'Carta virada, mostrando a resposta' : 'Carta mostrando a pergunta'}
          onPointerDown={aoPressionar}
          onPointerMove={aoMover}
          onPointerUp={aoSoltar}
          onPointerCancel={aoCancelar}
          onKeyDown={aoTeclarNaCarta}
        >
          <div className="entrada">
            <div className="miolo">
              {/* Frente: a pergunta */}
              <div className="face frente">
                <div className="topo">
                  <span className="chip chip-tipo">Pergunta</span>
                  <span className="chip">{card.categoria || 'Geral'}</span>
                </div>
                <div className={`texto${classeTamanho(card.enunciado)}`}>
                  <p>{card.enunciado}</p>
                </div>
                <div className="base">toque para virar</div>
              </div>

              {/* Verso: a resposta (começa girado 180° e só aparece quando a carta vira) */}
              <div className="face verso">
                <div className="topo">
                  <span className="chip chip-tipo">Resposta</span>
                  <span className="chip">{card.categoria || 'Geral'}</span>
                </div>
                <div className={`texto${classeTamanho(card.resposta)}`}>
                  <p>{card.resposta}</p>
                </div>
                <div className="base">toque para voltar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões: fazem o mesmo que o gesto, bons pra teclado e pra quem prefere clicar */}
      <div className="controles">
        <button type="button" className="botao" onClick={() => trocar(-1)} disabled={total < 2}>
          ← Anterior
        </button>
        <button type="button" className="botao botao-virar" onClick={onVirar}>
          {virado ? 'Ver pergunta' : 'Ver resposta'}
        </button>
        <button
          type="button"
          className="botao botao-principal"
          onClick={() => trocar(1)}
          disabled={total < 2}
        >
          Próxima →
        </button>
      </div>
      <p className="dica">Clique na carta para virar · arraste para o lado para trocar</p>
    </div>
  );
}

export default Baralho;