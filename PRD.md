# PRD: Termo

**Status:** Rascunho para validação  
**Produto:** Jogo casual de adivinhação de palavras  
**Plataforma inicial:** Web responsiva

## 1. Visão do produto

Termo é um jogo de palavras em português do Brasil, rápido de aprender e adequado a sessões curtas. A experiência combina um desafio diário compartilhável com partidas ilimitadas para prática. O jogador tenta descobrir uma palavra de cinco letras usando até sete tentativas e recebe feedback sobre cada letra.

O público inicial são pessoas que gostam de palavras e enigmas. O produto deve ser leve e divertido, sem exigir cadastro, oferecer anúncios ou usar pontos como recompensa. Conteúdo educativo é uma possibilidade futura, mas não faz parte do MVP.

## 2. Objetivos

- Oferecer uma partida diária simples e consistente.
- Permitir prática ilimitada sem pontuação.
- Incentivar o retorno diário, principal objetivo de produto.
- Permitir compartilhar o resultado sem revelar a resposta e desafiar outra pessoa por link.
- Funcionar bem em celulares e computadores, com teclado ou toque.
- Manter regras de português e feedback previsíveis, inclusive para palavras com acentos e letras repetidas.

## 3. Fora do escopo do MVP

- Contas e sincronização entre dispositivos.
- Anúncios, compras, assinatura ou sistema de pontos.
- Ranking, placar competitivo ou feed social.
- Conteúdo educativo, como definições, exemplos e curiosidades.
- Modos de dificuldade ou regras adicionais.
- Indicação de distância entre uma letra tentada e sua posição correta.

## 4. Público e plataforma

- **Público primário:** fãs de jogos de palavras e enigmas.
- **Idioma inicial:** português do Brasil.
- **Plataforma:** site responsivo para navegadores em dispositivos móveis e computadores.
- **Conta:** não obrigatória; o estado da partida e estatísticas ficam salvos localmente no navegador.
- **Monetização inicial:** nenhuma; jogo gratuito e sem anúncios.

## 5. Mecânica principal

1. O jogo apresenta uma palavra-alvo de cinco letras.
2. O jogador pode enviar até sete tentativas.
3. Cada tentativa válida deve ser uma palavra aceita pelo vocabulário do jogo.
4. Depois de cada tentativa, cada letra recebe um estado:
   - **Verde:** letra correta na posição correta.
   - **Amarelo:** letra existente na palavra-alvo, mas em outra posição.
   - **Cinza:** letra ausente da palavra-alvo.
5. O feedback não indica o quão perto uma letra está da posição correta.
6. Letras repetidas são permitidas tanto nas tentativas quanto nas respostas.
7. Acentos são normalizados para comparação; a resposta deve ser exibida com a grafia correta.
8. Palavras simples são preferidas para as respostas e plurais são aceitos.
9. Nomes próprios não fazem parte do conjunto de respostas do MVP.
10. Palavras com `ç` não são aceitas como respostas nem como tentativas.

### Regra para letras repetidas

Para evitar feedback inconsistente, a avaliação deve primeiro marcar as letras na posição exata. Em seguida, deve marcar como amarelas apenas as ocorrências restantes que ainda existam na resposta, respeitando a quantidade de cada letra. Por exemplo, uma resposta com um único `A` não deve indicar duas ocorrências de `A` como presentes.

## 6. Modos de jogo

### Desafio diário

- Uma palavra diária compartilhada entre os jogadores.
- A palavra muda à meia-noite no fuso `America/Sao_Paulo`.
- O jogador tem sete tentativas.
- O resultado pode ser compartilhado em formato que não revele a palavra.
- A participação, vitória ou derrota e sequência diária podem ser registradas localmente.

### Prática ilimitada

- O jogador pode iniciar novas partidas sem limite.
- Não há pontos nem placar.
- As tentativas continuam sujeitas à validação do vocabulário do jogo.
- A prática não deve alterar a sequência do desafio diário.

### Arquivo

- Desafios diários anteriores ficam disponíveis gratuitamente.
- Jogar uma partida do arquivo não altera a sequência atual do desafio diário.

## 7. Requisitos funcionais

- **RF-01:** O jogador consegue iniciar o desafio diário sem criar conta.
- **RF-02:** O jogador consegue iniciar partidas ilimitadas de prática.
- **RF-03:** O jogo valida tamanho e vocabulário da tentativa antes de aceitá-la.
- **RF-04:** O jogo avalia posição, presença e ausência de letras, considerando quantidades de letras repetidas.
- **RF-05:** O jogo informa vitória ao encontrar a palavra e derrota após a sétima tentativa sem sucesso.
- **RF-06:** Ao concluir a partida, o jogo revela a resposta correta.
- **RF-07:** O jogador consegue abrir desafios anteriores no arquivo.
- **RF-08:** O jogador consegue compartilhar uma grade de resultado sem a resposta.
- **RF-09:** O jogador consegue compartilhar um link de desafio que abre a partida correspondente.
- **RF-10:** O jogo salva localmente o estado da partida diária e as estatísticas necessárias para a sequência.
- **RF-11:** Uma partida em andamento deve ser restaurada ao recarregar a página no mesmo navegador.
- **RF-12:** A interface oferece entrada por teclado físico e por teclado na tela em dispositivos móveis.

## 8. Acessibilidade e experiência

- Verde, amarelo e cinza não podem ser o único meio de distinguir o feedback. Cada estado também precisa de forma, padrão ou rótulo acessível.
- A interação deve funcionar por teclado e por toque.
- Controles devem ter áreas de interação e espaçamento adequados para telas sensíveis ao toque.
- Texto, teclado e tabuleiro devem permanecer legíveis em telas pequenas.
- O jogador deve conseguir começar sem tutorial obrigatório; as regras ficam disponíveis para consulta.

## 9. Conteúdo e validação de palavras

- Manter uma lista de respostas separada da lista de tentativas aceitas.
- Priorizar vocabulário comum e palavras simples no conjunto de respostas.
- Aceitar plurais, conforme a regra escolhida pelo produto.
- Excluir palavras com `ç` da lista de respostas e das tentativas aceitas.
- Excluir nomes próprios das respostas.
- Revisar a lista de respostas para evitar palavras ofensivas, ambíguas ou excessivamente raras.
- Confirmar a origem e as condições de uso de qualquer lista de palavras externa antes do lançamento.

## 10. Métricas

**Métrica principal:** retorno de jogadores ao desafio diário.

Métricas de apoio sugeridas:

- Retenção no dia seguinte e após sete dias.
- Partidas diárias iniciadas e concluídas.
- Taxa de vitória e distribuição do número de tentativas.
- Uso do modo de prática e do arquivo.
- Compartilhamentos de resultado e aberturas de links de desafio.
- Erros de validação ou relatos de palavras ausentes/inadequadas.

As metas numéricas devem ser definidas após uma primeira versão instrumentada e uma linha de base. Qualquer analítica deve respeitar a decisão de não exigir conta e coletar apenas o necessário.

## 11. Critérios de aceite essenciais

- Uma palavra-alvo de cinco letras pode ser descoberta em até sete tentativas.
- Letras exatas ficam verdes, letras presentes em outra posição ficam amarelas e ausentes ficam cinzas, com indicação não baseada apenas em cor.
- A avaliação de letras repetidas nunca marca mais ocorrências do que existem na resposta.
- A comparação ignora acentos conforme as regras de normalização definidas.
- O desafio muda à meia-noite de Brasília e uma partida em andamento é preservada ao recarregar a página.
- Prática e arquivo não alteram a sequência do desafio diário.
- Compartilhamentos não expõem a resposta antes de o destinatário jogar ou concluir o desafio.
- O jogo pode ser usado em viewport móvel e com teclado físico.

## 12. Decisões pendentes

- Definir se conjugações verbais e formas regionais são aceitas, além dos plurais.
- Definir qual lista de palavras será usada e como será revisada e atualizada.
- Definir como a prática ilimitada escolhe as palavras e se pode repetir respostas recentes.
- Definir se o link de desafio abre o desafio diário, uma palavra específica ou uma partida independente.
- Definir o conteúdo exato das estatísticas locais e se partidas do arquivo aparecem em algum histórico separado.
- Definir metas quantitativas de retenção e compartilhamento após estabelecer a linha de base.
- Definir a identidade visual própria e validar o nome do produto antes do lançamento.

## 13. Referências da pesquisa

- [Wordle, The New York Times](https://www.nytimes.com/games/wordle/index.html): referência pública de palavra diária, cinco letras e seis tentativas.
- [TERMO](https://term.ooo/): referência brasileira de regras de acentuação, letras repetidas e variações de modo.
- [Contexto](https://contexto.me/pt/daily) e [arquivo de jogos](https://contexto.me/pt/previous): referência pública para combinar desafio diário, prática ilimitada e partidas anteriores.
- [WCAG 2.2: Uso de cor](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): orientação para não depender apenas de cor.
- [WCAG 2.2: Teclado](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html): orientação para operação por teclado.
- [Apple Human Interface Guidelines: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games): referência de entrada rápida no jogo, controles e acessibilidade.

Este PRD registra decisões de produto, não uma garantia de conformidade legal ou de acessibilidade. Requisitos finais devem ser verificados na implementação e nos mercados de lançamento.
