(() => {
  "use strict";

  const TIME_ZONE = "America/Sao_Paulo";
  const FIRST_CHALLENGE = "2026-01-01";
  const ATTEMPT_LIMIT = 7;
  const DAILY_PREFIX = "ifcaca:v1:daily:";
  const PRACTICE_KEY = "ifcaca:v1:practice";
  const PRACTICE_HISTORY_KEY = "ifcaca:v1:practice-history";
  const STATS_KEY = "ifcaca:v1:stats";

  const $ = (id) => document.getElementById(id);
  const modeScreen = $("mode-screen");
  const gameScreen = $("game-screen");
  const board = $("board");
  const keyboard = $("keyboard");
  const liveMessage = $("live-message");
  const resultPanel = $("result-panel");
  const resultMessage = $("result-message");
  const answerLine = $("answer-line");
  const triesLabel = $("tries-label");
  const archiveForm = $("archive-form");
  const archiveDate = $("archive-date");
  const helpDialog = $("help-dialog");

  const normalize = (word) => String(word)
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const isFiveLetterWord = (word) => typeof word === "string"
    && /^\p{L}{5}$/u.test(word)
    && !word.toLocaleLowerCase("pt-BR").includes("ç");

  const dictionary = new Set(
    (Array.isArray(window.WORD_BANK) ? window.WORD_BANK : [])
      .filter(isFiveLetterWord)
      .map(normalize)
  );
  const answerBank = (Array.isArray(window.ANSWER_BANK) ? window.ANSWER_BANK : [])
    .filter(isFiveLetterWord)
    .filter((word) => dictionary.has(normalize(word)));

  if (answerBank.length === 0 || dictionary.size === 0) {
    console.error("A lista de palavras não foi carregada. Confira words.js e answers.js.");
    liveMessage.textContent = "Não foi possível carregar as palavras do jogo.";
    $("daily-mode-button").disabled = true;
    $("unlimited-mode-button").disabled = true;
    return;
  }

  let activeGame = null;
  let currentGuess = "";

  function readStorage(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function brasiliaToday() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }

  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.toISOString().slice(0, 10) !== value) return null;
    return date;
  }

  function dayOffset(fromDate, toDate) {
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) return null;
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function addDays(dateString, amount) {
    const date = parseDate(dateString);
    if (!date) return dateString;
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }

  function displayDate(dateString) {
    const date = parseDate(dateString);
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function answerForDate(dateString) {
    const offset = dayOffset(FIRST_CHALLENGE, dateString);
    if (offset === null || offset < 0) return answerBank[0];
    return answerBank[offset % answerBank.length];
  }

  function validChallengeDate(dateString) {
    return Boolean(parseDate(dateString))
      && dateString >= FIRST_CHALLENGE
      && dateString <= brasiliaToday();
  }

  function dailyStorageKey(dateString) {
    return `${DAILY_PREFIX}${dateString}`;
  }

  function safeGuesses(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter((word) => typeof word === "string" && /^[a-z]{5}$/.test(word))
      .slice(0, ATTEMPT_LIMIT);
  }

  function loadDailyGame(dateString) {
    const saved = readStorage(dailyStorageKey(dateString), {});
    return {
      mode: "daily",
      date: dateString,
      target: answerForDate(dateString),
      guesses: safeGuesses(saved && typeof saved === "object" ? saved.guesses : [])
    };
  }

  function randomPracticeAnswer() {
    const previous = readStorage(PRACTICE_HISTORY_KEY, []);
    const recent = Array.isArray(previous) ? previous.slice(-8) : [];
    const candidates = answerBank.filter((word) => !recent.includes(normalize(word)));
    const pool = candidates.length ? candidates : answerBank;
    const random = new Uint32Array(1);
    const index = window.crypto?.getRandomValues
      ? (window.crypto.getRandomValues(random), random[0] % pool.length)
      : Math.floor(Math.random() * pool.length);
    return pool[index];
  }

  function loadPracticeGame() {
    const saved = readStorage(PRACTICE_KEY, null);
    if (saved && typeof saved.target === "string" && dictionary.has(normalize(saved.target))) {
      const game = {
        mode: "practice",
        target: saved.target,
        guesses: safeGuesses(saved.guesses)
      };
      if (!isFinished(game)) return game;
    }
    return createPracticeGame();
  }

  function createPracticeGame() {
    const target = randomPracticeAnswer();
    const history = readStorage(PRACTICE_HISTORY_KEY, []);
    const previous = Array.isArray(history) ? history : [];
    writeStorage(PRACTICE_HISTORY_KEY, [...previous, normalize(target)].slice(-12));
    const game = { mode: "practice", target, guesses: [] };
    writeStorage(PRACTICE_KEY, { target, guesses: [] });
    return game;
  }

  function saveGame() {
    if (!activeGame) return;
    if (activeGame.mode === "daily") {
      writeStorage(dailyStorageKey(activeGame.date), { guesses: activeGame.guesses });
    } else {
      writeStorage(PRACTICE_KEY, {
        target: activeGame.target,
        guesses: activeGame.guesses
      });
    }
  }

  function isWon(game) {
    return game.guesses.some((guess) => normalize(guess) === normalize(game.target));
  }

  function isFinished(game) {
    return isWon(game) || game.guesses.length >= ATTEMPT_LIMIT;
  }

  function evaluateGuess(guess, target) {
    const guessLetters = Array.from(normalize(guess));
    const targetLetters = Array.from(normalize(target));
    const result = Array(5).fill("gray");
    const remaining = new Map();

    for (let index = 0; index < 5; index += 1) {
      if (guessLetters[index] === targetLetters[index]) {
        result[index] = "green";
      } else {
        const letter = targetLetters[index];
        remaining.set(letter, (remaining.get(letter) || 0) + 1);
      }
    }

    for (let index = 0; index < 5; index += 1) {
      if (result[index] === "green") continue;
      const letter = guessLetters[index];
      const count = remaining.get(letter) || 0;
      if (count > 0) {
        result[index] = "yellow";
        remaining.set(letter, count - 1);
      }
    }
    return result;
  }

  function completionStats() {
    const saved = readStorage(STATS_KEY, { days: {} });
    const days = saved && saved.days && typeof saved.days === "object" ? saved.days : {};
    const entries = Object.entries(days).filter(([date, info]) =>
      validChallengeDate(date) && info && typeof info.won === "boolean"
    );
    const games = entries.length;
    const wins = entries.filter(([, info]) => info.won).length;
    let streak = 0;
    let cursor = brasiliaToday();
    if (!days[cursor]) cursor = addDays(cursor, -1);
    while (days[cursor]) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return { games, wins, streak };
  }

  function recordDailyResult() {
    if (!activeGame || activeGame.mode !== "daily" || activeGame.date !== brasiliaToday()) return;
    let stats = readStorage(STATS_KEY, { days: {} });
    if (!stats || typeof stats !== "object" || Array.isArray(stats)) stats = { days: {} };
    if (!stats.days || typeof stats.days !== "object" || Array.isArray(stats.days)) stats.days = {};
    if (stats.days[activeGame.date]) return;
    stats.days[activeGame.date] = {
      won: isWon(activeGame),
      guesses: activeGame.guesses.length
    };
    writeStorage(STATS_KEY, stats);
  }

  function renderStats() {
    const stats = completionStats();
    const dayWord = stats.streak === 1 ? "dia" : "dias";
    $("stats-summary").textContent = `Seus diários: ${stats.games} jogados · ${stats.wins} vitórias · sequência atual de ${stats.streak} ${dayWord}.`;
  }

  function setChallengeUrl(dateString) {
    const url = new URL(window.location.href);
    url.searchParams.set("desafio", dateString);
    window.history.replaceState({}, "", url.toString());
  }

  function clearChallengeUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("desafio");
    window.history.replaceState({}, "", url.toString());
  }

  function openGame(game) {
    activeGame = game;
    currentGuess = "";
    modeScreen.hidden = true;
    gameScreen.hidden = false;
    liveMessage.textContent = "";
    const daily = game.mode === "daily";
    const isToday = daily && game.date === brasiliaToday();
    $("game-mode-label").textContent = daily
      ? (isToday ? "DESAFIO DIÁRIO" : "DESAFIO DO ARQUIVO")
      : "PRÁTICA SEM LIMITE";
    $("game-title").textContent = daily ? (isToday ? "Diário" : "Arquivo") : "Ilimitado";
    $("date-caption").textContent = daily ? displayDate(game.date) : "Uma palavra por partida";
    $("share-challenge-button").hidden = !daily;
    if (daily) setChallengeUrl(game.date);
    else clearChallengeUrl();
    renderGame();
  }

  function openDaily(dateString = brasiliaToday()) {
    if (!validChallengeDate(dateString)) {
      liveMessage.textContent = "Escolha uma data válida para o desafio.";
      return;
    }
    openGame(loadDailyGame(dateString));
  }

  function openPractice() {
    openGame(loadPracticeGame());
  }

  function showModes() {
    gameScreen.hidden = true;
    modeScreen.hidden = false;
    activeGame = null;
    clearChallengeUrl();
    archiveDate.value = "";
    archiveDate.max = brasiliaToday();
    archiveDate.min = FIRST_CHALLENGE;
    renderStats();
  }

  function letterStateMap() {
    const priority = { gray: 1, yellow: 2, green: 3 };
    const states = new Map();
    if (!activeGame) return states;
    activeGame.guesses.forEach((guess) => {
      const statuses = evaluateGuess(guess, activeGame.target);
      Array.from(guess).forEach((letter, index) => {
        const next = statuses[index];
        if (!states.has(letter) || priority[next] > priority[states.get(letter)]) {
          states.set(letter, next);
        }
      });
    });
    return states;
  }

  function renderBoard() {
    const statusesByRow = activeGame.guesses.map((guess) => evaluateGuess(guess, activeGame.target));
    const done = isFinished(activeGame);
    const currentRow = done ? -1 : activeGame.guesses.length;
    board.replaceChildren();

    for (let rowIndex = 0; rowIndex < ATTEMPT_LIMIT; rowIndex += 1) {
      const row = document.createElement("div");
      row.className = "board-row";
      row.setAttribute("role", "row");
      const guess = activeGame.guesses[rowIndex] || (rowIndex === currentRow ? currentGuess : "");
      const statuses = statusesByRow[rowIndex] || [];

      for (let column = 0; column < 5; column += 1) {
        const tile = document.createElement("div");
        const letter = guess[column] || "";
        tile.className = `tile${letter ? " tile-filled" : ""}`;
        tile.setAttribute("role", "gridcell");
        tile.textContent = letter.toLocaleUpperCase("pt-BR");
        if (statuses[column]) {
          tile.classList.add(`tile-${statuses[column]}`);
          tile.dataset.state = statuses[column];
          const labels = {
            green: "letra correta na posição certa",
            yellow: "letra presente em outra posição",
            gray: "letra ausente"
          };
          tile.setAttribute("aria-label", `${letter.toLocaleUpperCase("pt-BR")}: ${labels[statuses[column]]}`);
        } else {
          tile.setAttribute("aria-label", letter ? `Letra ${letter.toLocaleUpperCase("pt-BR")}` : "Vazio");
        }
        row.append(tile);
      }
      board.append(row);
    }
  }

  function renderKeyboard() {
    const states = letterStateMap();
    keyboard.replaceChildren();
    const rows = [
      Array.from("QWERTYUIOP"),
      Array.from("ASDFGHJKL"),
      ["ENTER", ..."ZXCVBNM", "DELETE"]
    ];

    rows.forEach((rowKeys) => {
      const row = document.createElement("div");
      row.className = "keyboard-row";
      rowKeys.forEach((key) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "key";
        button.dataset.key = key;
        if (key === "ENTER") {
          button.classList.add("key-wide");
          button.textContent = "Enviar";
          button.setAttribute("aria-label", "Enviar palpite");
        } else if (key === "DELETE") {
          button.classList.add("key-wide", "key-delete");
          button.textContent = "⌫";
          button.setAttribute("aria-label", "Apagar uma letra");
        } else {
          button.textContent = key;
          const state = states.get(key.toLowerCase());
          if (state) {
            button.classList.add(`key-${state}`);
            button.dataset.state = state;
          }
          const descriptions = { green: "posição correta", yellow: "presente em outra posição", gray: "ausente" };
          button.setAttribute("aria-label", state ? `${key}, ${descriptions[state]}` : key);
        }
        button.addEventListener("click", () => handleKey(key));
        row.append(button);
      });
      keyboard.append(row);
    });
  }

  function renderResult() {
    const done = isFinished(activeGame);
    const won = isWon(activeGame);
    resultPanel.hidden = !done;
    $("replay-button").hidden = !done || activeGame.mode !== "practice";
    $("continue-button").hidden = !done || activeGame.mode !== "daily";
    $("share-result-button").hidden = !done;
    answerLine.hidden = !done;
    if (!done) return;

    resultMessage.textContent = won
      ? `Você encontrou em ${activeGame.guesses.length} ${activeGame.guesses.length === 1 ? "tentativa" : "tentativas"}!`
      : "As tentativas acabaram. Tente outra palavra!";
    answerLine.replaceChildren();
    const text = document.createTextNode("A resposta era ");
    const word = document.createElement("strong");
    word.className = "answer-word";
    word.textContent = activeGame.target.toLocaleUpperCase("pt-BR");
    answerLine.append(text, word, document.createTextNode("."));
    $("continue-button").textContent = "Ir para o Ilimitado";
  }

  function renderGame() {
    if (!activeGame) return;
    const remaining = Math.max(0, ATTEMPT_LIMIT - activeGame.guesses.length);
    triesLabel.textContent = `${remaining} ${remaining === 1 ? "tentativa" : "tentativas"}`;
    renderBoard();
    renderKeyboard();
    renderResult();
    if (isFinished(activeGame)) recordDailyResult();
    renderStats();
  }

  function announce(message) {
    liveMessage.textContent = message;
  }

  function submitGuess() {
    if (!activeGame || isFinished(activeGame)) return;
    const guess = currentGuess;
    if (guess.length !== 5) {
      announce("Digite cinco letras antes de enviar.");
      return;
    }
    if (!dictionary.has(guess)) {
      announce("Essa palavra não está na lista aceita.");
      return;
    }

    activeGame.guesses.push(guess);
    currentGuess = "";
    saveGame();
    renderGame();
    if (isWon(activeGame)) announce("Você encontrou a palavra!");
    else if (isFinished(activeGame)) announce("As tentativas acabaram.");
    else announce(`Palpite registrado. Restam ${ATTEMPT_LIMIT - activeGame.guesses.length} tentativas.`);
  }

  function handleKey(key) {
    if (!activeGame || isFinished(activeGame)) return;
    if (key === "ENTER") {
      submitGuess();
      return;
    }
    if (liveMessage.textContent) announce("");
    if (key === "DELETE") {
      currentGuess = currentGuess.slice(0, -1);
      renderBoard();
      return;
    }
    if (/^[a-z]$/i.test(key) && currentGuess.length < 5) {
      currentGuess = `${currentGuess}${key.toLowerCase()}`;
      renderBoard();
    }
  }

  function createShareGrid() {
    return activeGame.guesses.map((guess) => evaluateGuess(guess, activeGame.target)
      .map((state) => ({ green: "🟩", yellow: "🟨", gray: "⬛" })[state])
      .join("")).join("\n");
  }

  function shareResultText() {
    const score = isWon(activeGame) ? activeGame.guesses.length : "X";
    const day = activeGame.mode === "daily" ? ` · ${displayDate(activeGame.date)}` : " · Prática";
    return `IFCaça palavras${day}\n${score}/${ATTEMPT_LIMIT}\n\n${createShareGrid()}`;
  }

  async function copyText(text) {
    if (navigator.share) {
      try {
        await navigator.share({ title: "IFCaça palavras", text });
        announce("Compartilhamento aberto.");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      announce("Resultado copiado para compartilhar.");
      return;
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand("copy"); } catch { copied = false; }
      field.remove();
      announce(copied ? "Resultado copiado para compartilhar." : "Não foi possível copiar. Tente novamente.");
    }
  }

  function shareChallenge() {
    if (!activeGame || activeGame.mode !== "daily") return;
    const url = new URL(window.location.href);
    url.searchParams.set("desafio", activeGame.date);
    copyText(`Jogue este desafio do IFCaça palavras: ${url.toString()}`);
  }

  $("daily-mode-button").addEventListener("click", () => openDaily());
  $("unlimited-mode-button").addEventListener("click", openPractice);
  $("back-to-modes").addEventListener("click", showModes);
  $("result-modes-button").addEventListener("click", showModes);
  $("replay-button").addEventListener("click", () => openGame(createPracticeGame()));
  $("continue-button").addEventListener("click", openPractice);
  $("share-result-button").addEventListener("click", () => copyText(shareResultText()));
  $("share-challenge-button").addEventListener("click", shareChallenge);
  $("help-button").addEventListener("click", () => helpDialog.showModal());
  $("close-help-button").addEventListener("click", () => helpDialog.close());
  $("done-help-button").addEventListener("click", () => helpDialog.close());

  archiveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openDaily(archiveDate.value);
  });

  document.addEventListener("keydown", (event) => {
    if (gameScreen.hidden || helpDialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "Enter") {
      event.preventDefault();
      handleKey("ENTER");
    } else if (event.key === "Backspace") {
      event.preventDefault();
      handleKey("DELETE");
    } else if (/^[a-z]$/i.test(event.key)) {
      event.preventDefault();
      handleKey(event.key);
    }
  });

  archiveDate.min = FIRST_CHALLENGE;
  archiveDate.max = brasiliaToday();
  renderStats();

  const requestedDate = new URLSearchParams(window.location.search).get("desafio");
  if (requestedDate && validChallengeDate(requestedDate)) {
    openDaily(requestedDate);
  }
})();
