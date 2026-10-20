
"use strict";

const tamanho = 15;

const bancoPalavras = [
  "GATO", "CACHORRO", "COELHO", "CAVALO", "TARTARUGA",
  "LEAO", "TIGRE", "MACACO", "ELEFANTE", "GIRAFA",
  "ZEBRA", "URSO", "RAPOSA", "LOBO", "PANDA",
  "CASA", "ESCOLA", "LIVRO", "MESA", "CADEIRA",
  "JANELA", "PORTA", "CELULAR", "COMPUTADOR", "TECLADO",
  "MOUSE", "CADERNO", "CANETA", "LAPIS", "MOCHILA",
  "BOLA", "FUTEBOL", "BASQUETE", "VOLEI", "NATACAO",
  "CORRIDA", "BICICLETA", "PATINS", "TENIS", "XADREZ",
  "MAÇA", "BANANA", "LARANJA", "MORANGO", "ABACAXI",
  "MELANCIA", "UVA", "PERA", "MANGA", "PESSEGO",
  "CEREJA", "LIMAO", "MELAO", "COCO", "GOIABA",
  "CARRO", "AVIAO", "NAVIO", "TREM", "ONIBUS",
  "BICICLETA", "MOTO", "CAMINHAO", "BARCO", "FOGUETE",
  "SOL", "LUA", "ESTRELA", "PLANETA", "TERRA",
  "MARTE", "SATURNO", "COMETA", "GALAXIA", "ESPACO",
  "AMOR", "AMIZADE", "ALEGRIA", "FELICIDADE", "RESPEITO",
  "CORAGEM", "CARINHO", "ESPERANCA", "PAZ", "BONDADE",
  "VERDE", "AZUL", "AMARELO", "VERMELHO", "ROXO",
  "LARANJA", "BRANCO", "PRETO", "ROSA", "CINZA",
  "PRAIA", "MONTANHA", "FLORESTA", "RIO", "LAGO",
  "CACHOEIRA", "JARDIM", "ARVORE", "FLORES", "NUVEM",
  "CHUVA", "VENTO", "TROVAO", "NEVE", "ARCOIRIS"
];

let grade = [];
let palavras = [];
let selecionada = null;
let encontrados = new Set();
let pontos = 0;

const direcoes = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1]
];

const elementoGrade = document.getElementById("grade");
const elementoPalavras = document.getElementById("palavras");
const elementoPontos = document.getElementById("pontos");
const elementoMensagem = document.getElementById("mensagem");
const botaoNovoJogo = document.getElementById("novoJogo");

function normalizar(palavra) {
  return palavra.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function sortearPalavras(quantidade) {
  const unicas = [
    ...new Set(bancoPalavras.map(normalizar))
  ].filter(p => p.length <= tamanho);

  for (let i = unicas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unicas[i], unicas[j]] = [unicas[j], unicas[i]];
  }

  return unicas.slice(0, quantidade);
}

function criarGrade() {
  grade = Array.from(
    { length: tamanho },
    () => Array(tamanho).fill("")
  );

  palavras = [];
  encontrados = new Set();
  pontos = 0;
  selecionada = null;

  const sorteadas = sortearPalavras(20);

  for (const palavra of sorteadas) {
    let colocada = false;

    for (let tentativa = 0; tentativa < 1000; tentativa++) {
      const [dr, dc] =
        direcoes[Math.floor(Math.random() * direcoes.length)];

      const r = Math.floor(Math.random() * tamanho);
      const c = Math.floor(Math.random() * tamanho);

      const fimR = r + dr * (palavra.length - 1);
      const fimC = c + dc * (palavra.length - 1);

      if (
        fimR < 0 || fimR >= tamanho ||
        fimC < 0 || fimC >= tamanho
      ) {
        continue;
      }

      let pode = true;

      for (let i = 0; i < palavra.length; i++) {
        const letra = grade[r + dr * i][c + dc * i];

        if (letra !== "" && letra !== palavra[i]) {
          pode = false;
          break;
        }
      }

      if (!pode) continue;

      const celulas = [];

      for (let i = 0; i < palavra.length; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;

        grade[nr][nc] = palavra[i];
        celulas.push(`${nr}-${nc}`);
      }

      palavras.push({ palavra, celulas });
      colocada = true;
      break;
    }

    if (!colocada) continue;
  }

  const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let r = 0; r < tamanho; r++) {
    for (let c = 0; c < tamanho; c++) {
      if (!grade[r][c]) {
        grade[r][c] =
          alfabeto[Math.floor(Math.random() * alfabeto.length)];
      }
    }
  }
}

function desenharGrade() {
  elementoGrade.innerHTML = "";
  elementoGrade.style.gridTemplateColumns =
    `repeat(${tamanho}, minmax(0, 1fr))`;

  for (let r = 0; r < tamanho; r++) {
    for (let c = 0; c < tamanho; c++) {
      const celula = document.createElement("div");

      celula.className = "letra";
      celula.textContent = grade[r][c];
      celula.dataset.pos = `${r}-${c}`;
      celula.tabIndex = 0;
      celula.setAttribute("role", "button");
      celula.setAttribute(
        "aria-label",
        `Letra ${grade[r][c]}, linha ${r + 1}, coluna ${c + 1}`
      );

      celula.addEventListener("click", () => {
        clicarLetra(r, c);
      });

      celula.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          clicarLetra(r, c);
        }
      });

      elementoGrade.appendChild(celula);
    }
  }

  desenharPalavras();
  atualizarPontos();
}

function desenharPalavras() {
  elementoPalavras.innerHTML = "";

  palavras.forEach(({ palavra }) => {
    const item = document.createElement("span");

    item.className = "palavra";
    item.id = `palavra-${palavra}`;
    item.textContent = palavra;

    elementoPalavras.appendChild(item);
  });
}

function clicarLetra(r, c) {
  const celula = document.querySelector(
    `[data-pos="${r}-${c}"]`
  );

  if (!celula || celula.classList.contains("encontrada")) {
    return;
  }

  if (!selecionada) {
    selecionada = { r, c };
    celula.classList.add("selecionada");

    elementoMensagem.textContent =
      "Clique na última letra da palavra.";

    return;
  }

  const inicio = selecionada;
  const fim = { r, c };
  const caminho = obterCaminho(inicio, fim);

  document.querySelectorAll(".selecionada").forEach(el => {
    el.classList.remove("selecionada");
  });

  selecionada = null;

  if (!caminho) {
    elementoMensagem.textContent =
      "Escolha uma linha reta horizontal, vertical ou diagonal.";
    return;
  }

  const formada = caminho.map(pos => {
    const [linha, coluna] = pos.split("-").map(Number);
    return grade[linha][coluna];
  }).join("");

  const invertida = formada.split("").reverse().join("");

  const encontrada = palavras.find(item =>
    !encontrados.has(item.palavra) &&
    (
      item.palavra === formada ||
      item.palavra === invertida
    )
  );

  if (!encontrada) {
    elementoMensagem.textContent =
      "Palavra não encontrada. Tente novamente!";
    return;
  }

  encontrados.add(encontrada.palavra);
  pontos += 10;

  encontrada.celulas.forEach(pos => {
    const el = document.querySelector(`[data-pos="${pos}"]`);

    if (el) {
      el.classList.add("encontrada");
    }
  });

  const itemPalavra = document.getElementById(
    `palavra-${encontrada.palavra}`
  );

  if (itemPalavra) {
    itemPalavra.classList.add("encontrada");
  }

  elementoMensagem.textContent =
    `Muito bem! Você encontrou ${encontrada.palavra}! 🎉`;

  atualizarPontos();

  if (encontrados.size === palavras.length) {
    elementoMensagem.textContent =
      "🏆 Parabéns! Você encontrou todas as palavras!";
  }
}

function obterCaminho(inicio, fim) {
  const dr = fim.r - inicio.r;
  const dc = fim.c - inicio.c;

  if (dr === 0 && dc === 0) return null;

  if (
    dr !== 0 &&
    dc !== 0 &&
    Math.abs(dr) !== Math.abs(dc)
  ) {
    return null;
  }

  const passoR = Math.sign(dr);
  const passoC = Math.sign(dc);
  const comprimento = Math.max(
    Math.abs(dr),
    Math.abs(dc)
  );

  const caminho = [];

  for (let i = 0; i <= comprimento; i++) {
    caminho.push(
      `${inicio.r + passoR * i}-${inicio.c + passoC * i}`
    );
  }

  return caminho;
}

function atualizarPontos() {
  elementoPontos.textContent = pontos;
}

function novoJogo() {
  elementoMensagem.textContent = "Boa sorte!";

  criarGrade();
  desenharGrade();
}

botaoNovoJogo.addEventListener("click", novoJogo);

novoJogo();
