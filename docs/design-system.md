# Design do TripShare

O TripShare é uma aplicação de planejamento de viagens. A interface prioriza criar uma viagem, abrir seu roteiro e descobrir lugares. A direção visual é um diário de viagem contemporâneo, com percursos, cartões de destino e tipografia expressiva. A cor coral foi escolhida explicitamente para substituir o azul da marca.

## Paleta e tipografia

| Papel | Token | Cor |
| --- | --- | --- |
| Marca e ações principais | `--color-primary` | `#FF645C` |
| Texto sobre coral | `--color-on-primary` | `#302026` |
| Texto principal | `--color-text` | `#2C2932` |
| Superfícies | `--color-surface` | `#FFFFFF` |
| Fundo | `--color-background` | `#F7F8FA` |
| Links e foco em fundo claro | `--color-link` | `#A8322B` |
| Destaques suaves | `--color-surface-accent` | `#FFEDE8` |
| Catálogo e detalhes ilustrados | `--color-sun` | `#FFE5A3` |
| Cartões e perfil | `--color-mint` | `#DCEBE3` |

Bricolage Grotesque dá personalidade aos títulos e à marca. DM Sans mantém formulários, metadados e controles legíveis. Os dois arquivos WOFF2 variáveis somam aproximadamente 78 KB e são servidos pelo frontend. As licenças SIL Open Font License estão ao lado das fontes em `web/public/fonts/`. Não há dependência de Google Fonts no navegador. Se a fonte não carregar, as famílias alternativas continuam disponíveis.

Os tokens globais ficam em `web/src/commons/styles/global.css`. Cores de turnos e mapas conservam seu significado. O coral não substitui cores de avisos, turnos ou ícones oficiais de terceiros.

## Composição por tela

- Login e cadastro usam `AuthLayout`, com um painel coral e uma ilustração de percurso. Em celular, esse painel vira uma abertura compacta. O formulário mantém seu foco e seus valores durante a digitação.
- Minhas Viagens tem um cabeçalho ilustrado e cartões inspirados em cartões de viagem. Cidade, título, datas e duração têm hierarquias diferentes. Os totais vêm dos dados disponíveis.
- O catálogo usa uma abertura amarela com bússola, fotografias do catálogo e informação de bairro e horário. Imagens ausentes têm uma ilustração identificada como ausência de foto.
- O detalhe do lugar dá espaço ao título, à imagem e às informações organizadas em duas colunas no desktop.
- O roteiro usa uma faixa de identificação da viagem, navegação pelos dias, agenda e mapa de apoio. Em celular, a agenda aparece antes do mapa.
- O perfil tem capa coral, iniciais e informações pessoais. A edição usa formulário e painel de apoio. Conteúdo indisponível permanece identificado como tal.
- Recuperação de senha e página não encontrada usam uma composição central com orientação para voltar.

`Brand` e `JourneyArt` são componentes reutilizáveis. A ilustração de percurso é decorativa e não representa uma localização geográfica. Nenhum indicador, avaliação, funcionalidade ou destino foi inventado para preencher a interface.

## Movimento e acessibilidade

A entrada da ilustração de autenticação dura menos de dois segundos. Cartões respondem ao ponteiro com deslocamento de 2 px e as fotos ampliam discretamente dentro do recorte. Botões e diálogos indicam a interação com transições curtas. Não há animação contínua decorativa ou efeito vinculado à rolagem.

O cabeçalho usa transparência e desfoque leve com fundo alternativo. O diálogo usa desfoque no fundo, mantendo o formulário nítido. `prefers-reduced-motion: reduce` desliga animações e transições. O indicador de carregamento mantém texto visível mesmo sem animação.

Links de salto levam ao conteúdo ou formulário. Foco é visível, diálogos mantêm o foco e devolvem-no ao controle de origem. O menu da conta aceita Escape e fecha ao perder foco. Os controles mantêm tamanho de toque de pelo menos 44 px. Texto sobre coral é escuro, pois branco sobre `#FF645C` não tem contraste suficiente para texto pequeno.

## Como verificar

Execute `npm run lint`, `npm run typecheck`, `npm run test` e `npm run build` em `web/`. Revise autenticação, viagens, catálogo, detalhes, perfis e páginas de estado em 320, 390, 768, 1024 e 1440 px. Inclua formulários com erros, diálogos, navegação por teclado e movimento reduzido.

O modo de demonstração continua controlado por `VITE_USE_MOCKS=true`. A autenticação por Bearer, o isolamento de sessão, as URLs e os contratos HTTP existentes permanecem os mesmos.
