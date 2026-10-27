
const tabuleiro = document.getElementById("tabuleiro");
const entrada = document.getElementById("entrada");
const formulario = document.getElementById("formulario");
const enviar = document.getElementById("enviar");
const novoJogo = document.getElementById("novoJogo");
const mensagem = document.getElementById("mensagem");

const maxTentativas = 6;

let dicionario = new Set();
let palavrasDoJogo = [];
let palavraSecreta = "";
let tentativas = 0;
let terminou = false;
let carregado = false;

function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
}

async function carregarDicionario() {
    try {
        mensagem.textContent = "Carregando dicionário...";

        entrada.disabled = true;
        enviar.disabled = true;
        novoJogo.disabled = true;

        const url =
            "https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt";

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Falha ao baixar o dicionário.");
        }

        const texto = await resposta.text();

        const palavras = texto
            .split(/\r?\n/)
            .map(normalizar)
            .filter(palavra => /^[A-Z]{5}$/.test(palavra));

        dicionario = new Set(palavras);
        palavrasDoJogo = [...dicionario];

        if (palavrasDoJogo.length === 0) {
            throw new Error("O dicionário está vazio.");
        }

        carregado = true;
        novoJogo.disabled = false;

        iniciarJogo();
    } catch (erro) {
        console.error(erro);

        mensagem.textContent =
            "Não foi possível carregar o dicionário. Confira a internet e tente abrir pelo Live Server.";
    }
}

function iniciarJogo() {
    if (!carregado) return;

    palavraSecreta =
        palavrasDoJogo[
            Math.floor(Math.random() * palavrasDoJogo.length)
        ];

    tentativas = 0;
    terminou = false;
    tabuleiro.innerHTML = "";

    for (let i = 0; i < maxTentativas; i++) {
        const linha = document.createElement("div");
        linha.className = "linha";

        for (let j = 0; j < 5; j++) {
            const letra = document.createElement("div");
            letra.className = "letra";
            linha.appendChild(letra);
        }

        tabuleiro.appendChild(linha);
    }

    entrada.value = "";
    entrada.disabled = false;
    enviar.disabled = false;

    mensagem.textContent = "Boa sorte!";
    entrada.focus();
}

function verificarPalavra(palpite) {
    const resposta = palavraSecreta.split("");
    const letras = palpite.split("");
    const resultado = Array(5).fill("errada");

    for (let i = 0; i < 5; i++) {
        if (letras[i] === resposta[i]) {
            resultado[i] = "correta";
            resposta[i] = null;
            letras[i] = null;
        }
    }

    for (let i = 0; i < 5; i++) {
        if (letras[i] === null) continue;

        const posicao = resposta.indexOf(letras[i]);

        if (posicao !== -1) {
            resultado[i] = "presente";
            resposta[posicao] = null;
        }
    }

    return resultado;
}

function jogar(evento) {
    evento.preventDefault();

    if (terminou || !carregado) return;

    const palpite = normalizar(entrada.value);

    if (!/^[A-Z]{5}$/.test(palpite)) {
        mensagem.textContent =
            "Digite uma palavra com exatamente 5 letras.";
        return;
    }

    if (!dicionario.has(palpite)) {
        mensagem.textContent =
            "Essa palavra não está no dicionário. Tente outra!";
        entrada.select();
        return;
    }

    const linhas = tabuleiro.querySelectorAll(".linha");
    const celulas = linhas[tentativas].querySelectorAll(".letra");
    const cores = verificarPalavra(palpite);

    for (let i = 0; i < 5; i++) {
        celulas[i].textContent = palpite[i];
        celulas[i].classList.add(cores[i]);
    }

    tentativas++;
    entrada.value = "";

    if (palpite === palavraSecreta) {
        mensagem.textContent =
            `Parabéns! Você acertou em ${tentativas} tentativa(s)!`;

        terminarJogo();
        return;
    }

    if (tentativas === maxTentativas) {
        mensagem.textContent =
            `Fim de jogo! A palavra era ${palavraSecreta}.`;

        terminarJogo();
        return;
    }

    mensagem.textContent =
        `Tentativa ${tentativas} de ${maxTentativas}. Tente novamente!`;

    entrada.focus();
}

function terminarJogo() {
    terminou = true;
    entrada.disabled = true;
    enviar.disabled = true;
}

formulario.addEventListener("submit", jogar);
novoJogo.addEventListener("click", iniciarJogo);

carregarDicionario();
