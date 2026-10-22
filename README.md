# IFCaça palavras

Jogo de adivinhação em português brasileiro, para navegador. Escolha o desafio diário ou jogue partidas ilimitadas. Cada partida usa uma palavra de cinco letras e permite até sete tentativas.

## Abrir o jogo

Abra um terminal nesta pasta e execute:

```sh
python -m http.server 8000
```

Depois, acesse `http://localhost:8000` no navegador. O jogo não usa cadastro, anúncios, dependências externas nem serviços online. O progresso fica salvo no armazenamento local do navegador.

## Vocabulário

`words.js` contém as palavras aceitas para palpites. A lista foi gerada a partir de [pythonprobr/palavras](https://github.com/pythonprobr/palavras), derivada do corretor ortográfico pt_BR do LibreOffice e licenciada sob MPL-2.0. O arquivo de licença está em `WORDLIST-LICENSE.txt`; o arquivo original está em `wordlist-source.txt`.

`answers.js` mantém uma lista menor de soluções comuns separada do vocabulário aceito. A ordem define a sequência diária compartilhada; revise e amplie essa lista antes de publicar o jogo por um período longo.

Para reconstruir a lista filtrada após alterar a origem ou o bloqueio de termos, execute `python build_words.py`. O filtro conserva entradas em minúsculas com cinco letras, remove duplicatas que diferem apenas por acentos e exclui alguns termos ofensivos conhecidos.
