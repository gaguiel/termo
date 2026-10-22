"""Build the game's local five-letter bank from the attributed source list."""

from pathlib import Path
import re
import unicodedata


SOURCE = Path(__file__).with_name("wordlist-source.txt")
OUTPUT = Path(__file__).with_name("words.js")

# A small explicit blocklist keeps common profanity and slurs out of the game.
BLOCKED = {
    "bicha", "bosta", "carai", "cuzao", "foder", "fodeu", "fudido",
    "merda", "porra", "putas", "putos", "viado",
}


def normalize(word: str) -> str:
    decomposed = unicodedata.normalize("NFD", word.casefold())
    return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")


def main() -> None:
    words: list[str] = []
    seen: set[str] = set()

    for raw in SOURCE.read_text(encoding="utf-8").splitlines():
        word = raw.strip()
        if not word or not word.isalpha() or not word.islower():
            continue
        normalized = normalize(word)
        if not re.fullmatch(r"[a-z]{5}", normalized):
            continue
        if normalized in BLOCKED or normalized in seen:
            continue
        seen.add(normalized)
        words.append(word)

    if not words:
        raise SystemExit("A lista filtrada ficou vazia; confira o arquivo de origem.")

    header = (
        "/* Generated from pythonprobr/palavras (MPL-2.0). "
        "Run `python build_words.py` to rebuild this file. */\n"
        "window.WORD_BANK = "
    )
    OUTPUT.write_text(header + repr(words).replace("'", '"') + ";\n", encoding="utf-8")
    print(f"Vocabulário local criado: {len(words)} palavras únicas de cinco letras.")


if __name__ == "__main__":
    main()
