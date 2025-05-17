# Plugin CPM Gantt para Obsidian

Este plugin para o Obsidian permite gerenciar projetos utilizando o Método do Caminho Crítico (CPM) e visualizar as tarefas em um gráfico de Gantt interativo, além de integrar essas informações diretamente em suas notas e no Canvas do Obsidian.

## Funcionalidades Principais

*   **Gerenciamento de Tarefas:** Adicione, edite e exclua tarefas com informações como ID, nome, duração, dependências e responsável.
*   **Cálculo CPM Automático:** Calcula automaticamente o caminho crítico, datas de início/fim mais cedo/tarde, folgas (slack) e identifica tarefas críticas.
*   **Visualização em Tabela:** Exibe todas as tarefas e seus dados CPM em uma tabela clara e organizada.
*   **Gráfico de Gantt Dinâmico:** Gera um gráfico de Gantt em SVG diretamente na visualização do plugin, atualizado em tempo real conforme as tarefas são modificadas.
*   **Integração com Notas:**
    *   Insira uma tabela formatada em Markdown com os dados das tarefas diretamente na nota ativa.
    *   Exporte o gráfico de Gantt para um arquivo de Canvas do Obsidian (`.canvas`), criando um link para ele na nota ativa.
*   **Persistência de Dados:** Salva e carrega as tarefas de um arquivo `db.json` localizado na pasta da nota ativa, permitindo diferentes projetos por pasta.
*   **Interface Intuitiva:** Formulário para fácil entrada de dados e botões de ação para as principais funcionalidades.

## Instalação

### Automática (Recomendado)
1.  Abra o Obsidian e vá em `Configurações` -> `Plugins da Comunidade`.
2.  Desative o `Modo restrito`.
3.  Clique em `Procurar` e busque por "CPM Gantt" (Nota: o nome exato pode variar dependendo de como for publicado).
4.  Clique em `Instalar` e depois em `Ativar`.

### Manual
1.  Baixe a versão mais recente do plugin (arquivos `main.js`, `styles.css`, `manifest.json`) do repositório.
2.  Crie uma pasta chamada `cpm-gantt` (ou o ID do plugin definido no `manifest.json`) dentro da pasta de plugins do seu cofre Obsidian (`SeuCofre/.obsidian/plugins/`).
3.  Copie os arquivos baixados (`main.js`, `styles.css`, `manifest.json`) para dentro da pasta `cpm-gantt`.
4.  Abra o Obsidian, vá em `Configurações` -> `Plugins da Comunidade`, e ative o plugin "CPM Gantt".

## Como Utilizar

### 1. Acessando a Visualização do Plugin

*   Após a instalação e ativação, o plugin adicionará um ícone de "gráfico de Gantt" (ou similar) na barra lateral esquerda do Obsidian. Clique neste ícone para abrir a visualização "CPM - Caminho Crítico".
*   Alternativamente, você pode abrir a paleta de comandos (Ctrl/Cmd + P) e procurar por um comando como "CPM Gantt: Abrir visualização" (o nome exato pode variar).

### 2. Gerenciando Tarefas

A visualização do plugin apresentará um formulário para adicionar/editar tarefas, uma tabela para listar as tarefas e um gráfico de Gantt.

*   **Adicionando Tarefas:**
    1.  Preencha os campos do formulário:
        *   **ID:** Um número único para identificar a tarefa.
        *   **Nome:** Descrição da tarefa.
        *   **Duração:** Tempo necessário para completar a tarefa (em unidades de tempo, ex: dias).
        *   **Dependência (Opcional):** O ID da tarefa da qual esta tarefa depende. A tarefa atual só começará após a conclusão da tarefa dependente.
        *   **Responsável (Opcional):** Nome da pessoa ou equipe responsável.
    2.  Clique em "Adicionar Tarefa". A tarefa será adicionada à tabela, e o CPM e o gráfico de Gantt serão recalculados.

*   **Editando Tarefas:**
    1.  Na tabela de tarefas, clique no ícone de lápis (✏️) na linha da tarefa que deseja editar.
    2.  Os dados da tarefa preencherão o formulário. O campo ID ficará bloqueado.
    3.  Modifique os campos desejados.
    4.  Clique em "Atualizar Tarefa".

*   **Excluindo Tarefas:**
    1.  Na tabela de tarefas, clique no ícone de lixeira (🗑️) na linha da tarefa que deseja excluir.
    2.  Confirme a exclusão. As tarefas que dependiam da tarefa excluída perderão essa dependência.

### 3. Entendendo a Tabela de Tarefas

A tabela exibe as seguintes colunas para cada tarefa:

*   **ID:** Identificador único.
*   **Nome:** Nome da tarefa.
*   **Duração:** Duração da tarefa.
*   **Dependência:** Nome da tarefa da qual depende (ou "-" se não houver).
*   **Responsável:** Pessoa/equipe responsável.
*   **Início:** Data de início mais cedo calculada (1-indexado, ex: dia 1).
*   **Fim:** Data de fim mais cedo calculada.
*   **Slack (Folga):** Tempo que a tarefa pode atrasar sem impactar o projeto.
*   **Crítica:** "Sim" se a tarefa está no caminho crítico (folga zero), "Não" caso contrário.
*   **Ações:** Botões para editar (✏️) e apagar (🗑️) a tarefa.

### 4. Interpretando o Gráfico de Gantt (na View do Plugin)

Abaixo da tabela, um gráfico de Gantt em SVG é renderizado:

*   Cada tarefa é representada por uma barra.
*   O eixo horizontal representa a linha do tempo do projeto.
*   A posição e o comprimento da barra indicam o início mais cedo e a duração da tarefa.
*   Tarefas críticas são destacadas com uma cor diferente (vermelho) das não críticas (azul).
*   O nome da tarefa é exibido dentro da barra.

### 5. Integração com Notas

*   **Inserir Tabela na Nota Ativa:**
    *   Clique no botão "Inserir Tabela na nota".
    *   Uma tabela formatada em Markdown, contendo os dados de todas as tarefas atuais, será anexada ao final da nota que estiver ativa no momento.

*   **Salvar Gráfico de Gantt no Canvas do Obsidian:**
    1.  Certifique-se de que uma nota esteja ativa (aberta e em foco).
    2.  Clique no botão "Salvar para Canvas".
    3.  Um novo arquivo de Canvas com o nome `[NomeDaNotaAtiva]Gantt.canvas` será criado (ou atualizado se já existir) na mesma pasta da nota ativa.
    4.  Este arquivo Canvas conterá uma representação visual das tarefas e suas dependências, similar a um gráfico de Gantt.
        *   As tarefas são nós de texto (com link para a nota da tarefa, se o nome da tarefa corresponder a uma nota).
        *   As dependências são representadas por setas entre os nós.
        *   Tarefas críticas são destacadas com uma cor diferente.
    5.  Se um novo arquivo Canvas for criado, um link de embutir (ex: `![[NomeDaNotaAtivaGantt.canvas]]`) será automaticamente adicionado à nota ativa.

## Armazenamento de Dados

*   As tarefas criadas através do plugin são salvas automaticamente em um arquivo chamado `db.json`.
*   Este arquivo `db.json` é armazenado na **mesma pasta da nota que estava ativa** quando as tarefas foram modificadas ou quando a visualização do plugin foi aberta pela primeira vez e tentou carregar dados.
*   Isso permite que você tenha listas de tarefas e projetos CPM/Gantt diferentes para diferentes contextos ou pastas dentro do seu cofre Obsidian.
*   Ao abrir a visualização do plugin, ele tentará carregar as tarefas do `db.json` localizado na pasta da nota atualmente ativa.


---

Espero que este plugin seja útil para o seu gerenciamento de projetos no Obsidian!
