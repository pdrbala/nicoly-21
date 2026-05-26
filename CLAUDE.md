# Regras do projeto

## Limite de tamanho de arquivo

**Nunca crie um arquivo com mais de 500 linhas.** Se um arquivo passar de 500 linhas (ou estiver chegando perto), separe em arquivos menores antes de continuar — por responsabilidade, por feature, ou por camada.

- Aplica-se a código (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`) e a config (`.json`, `.yaml`).
- Não vale "ignorar pra essa task específica e refatorar depois". Refatora antes de adicionar mais conteúdo.
- Se um arquivo *já existente* passar de 500 linhas, ao editá-lo: separe primeiro, depois faça a mudança planejada no(s) arquivo(s) novo(s).

**Por quê:** arquivos longos viram caixas-pretas — difíceis de revisar, de fazer diff, e de o próprio modelo manter coerência ao editar. Separar cedo é mais barato que separar depois.

**Como aplicar:**
- Componentes React: 1 componente por arquivo (com seus hooks/helpers locais se forem só dele).
- Stores Zustand: 1 store por arquivo.
- CSS: agrupar por feature/componente em vez de um `global.css` monolítico.
- Utilities: agrupar por domínio (`audio/`, `anim/`, `geometry/`...), não em um `utils.ts` catch-all.
