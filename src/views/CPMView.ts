
import { ItemView, WorkspaceLeaf, App, Notice, normalizePath, TFile } from "obsidian";
import { Task } from "../models/tasks";
import {drawGantt} from "../controllers/drawGanttController"
import {calculateCPM} from "../controllers/calculateCPMcontroller"
import { saveToCanvas } from "src/controllers/saveToCanvasController";
import { insertTableInNote } from "src/controllers/insertTableInNoteController";
import { TaskRepository } from "src/repository/repository";


// EN: Defines the unique type for this view.
// PT-BR: Define o tipo único para esta visualização.
export const CPM_VIEW_TYPE = "cpm-view";

// EN: CPMView class, extending ItemView to integrate with Obsidian's UI.
// PT-BR: Classe CPMView, estendendo ItemView para se integrar com a UI do Obsidian.
export class CPMView extends ItemView {
  app: App;
  container: HTMLElement;

  // EN: Returns the view type.
  // PT-BR: Retorna o tipo da visualização.
  getViewType(): string {
    return CPM_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "CPM - Caminho Crítico";
  }

  // EN: Returns the icon for the view tab.
  // PT-BR: Retorna o ícone para a aba da visualização.
  getIcon(): string {
    return "chart-gantt";
  }

  async onOpen() {
    this.container = this.containerEl.children[1] as HTMLElement;
    this.container.empty();
    await this.renderCPMInterface(); 
  }

  // EN: Renders the main interface for the CPM tool.
  // PT-BR: Renderiza a interface principal para a ferramenta CPM.
  renderCPMInterface() {
    this.container.empty();

    const style = document.createElement("style");
    style.textContent = this.getStyleCSS();
    this.container.appendChild(style);
    this.container.createEl("h4", { text: "Método do Caminho Crítico" });

    const form = this.container.createEl("form", { cls: "task-form" });
    form.innerHTML = `
      <input type="number" id="id" placeholder="ID" required />
      <input type="text" id="name" placeholder="Nome" required />
      <input type="number" id="duration" placeholder="Duração" required />
      <input type="text" id="dependency" placeholder="Dependências (IDs, ex: 1,2)" />
      <input type="text" id="responsible" placeholder="Responsável" />
      <button type="submit">Adicionar Tarefa</button>
    `;

    const table = this.container.createEl("table");
    table.id = "tasks-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th><th>Nome</th><th>Duração</th><th>Dependência</th><th>Responsável</th>
          <th>Início</th><th>Fim</th><th>Slack</th><th>Crítica</th><th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const actionsDiv = this.container.createDiv({ cls: "action-buttons" });
    actionsDiv.createEl("button", { text: "Inserir Tabela na nota", attr: { id: "insert-md-table" } });
    actionsDiv.createEl("button", { text: "Salvar para Canvas", attr: { id: "save-canvas-btn" } });

    const ganttWrapper = this.container.createEl("div");
    ganttWrapper.id = "gantt-wrapper";
    ganttWrapper.style.marginTop = "20px";
    ganttWrapper.style.overflowX = "auto";
    ganttWrapper.style.height = "300px";
    ganttWrapper.style.border = "1px solid #ddd";

    const ganttChart = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
    ganttChart.setAttribute("id", "gantt-chart");
    ganttChart.setAttribute("width", "100%");
    ganttChart.setAttribute("height", "auto");
    ganttWrapper.appendChild(ganttChart);

    this.setupEventListeners(ganttChart, table.querySelector("tbody")!);
  }

  // EN: Sets up event listeners for form submission, button clicks, and table interactions.
  // PT-BR: Configura os ouvintes de eventos para submissão de formulário, cliques em botões e interações na tabela.
  async setupEventListeners(ganttChart: SVGSVGElement, tbody: HTMLTableSectionElement) {
    const form = this.container.querySelector(".task-form") as HTMLFormElement;
    const insertMdBtn = this.container.querySelector("#insert-md-table") as HTMLButtonElement | null;
    const saveCanvasBtn = this.container.querySelector("#save-canvas-btn") as HTMLButtonElement | null;
    const dbFileName = 'db.json'; 

    const idInput = form.querySelector("#id") as HTMLInputElement;
    const nameInput = form.querySelector("#name") as HTMLInputElement;
    const durationInput = form.querySelector("#duration") as HTMLInputElement;
    const dependencyInput = form.querySelector("#dependency") as HTMLInputElement;
    const responsibleInput = form.querySelector("#responsible") as HTMLInputElement;
    const submitButton = form.querySelector("button[type='submit']") as HTMLButtonElement;

   
    // EN: Asynchronous function to update the tasks table, Gantt chart, and save data.
    // PT-BR: Função assíncrona para atualizar a tabela de tarefas, o gráfico de Gantt e salvar os dados.
    const updateTasks = async () => { 
      if (tasks.length === 0) {
        tbody.innerHTML = "<tr><td colspan='9'>Nenhuma tarefa adicionada ou carregada.</td></tr>";
        drawGantt([], 0, ganttChart); 

        try {
          await TaskRepository.saveTasksToJson(this.app, dbFileName, tasks);
        } catch (error) {
          console.error("Erro ao salvar lista de tarefas vazia:", error);
        }
       
        try {
           await saveToCanvas(tasks, this.app); 
        } catch (error) {
           console.error("Erro ao salvar canvas com lista vazia:", error);
        }
        return;
      }
      // EN: Calculate Critical Path Method.
      // PT-BR: Calcula o Método do Caminho Crítico.
      const { tasks: calculatedTasks, maxEndDate } = calculateCPM(tasks);
      tbody.innerHTML = "";

      // EN: Populate the tasks table with calculated data.
      // PT-BR: Preenche a tabela de tarefas com os dados calculados.
      calculatedTasks.forEach(task => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${task.id}</td>
          <td>${task.name}</td>
          <td>${task.duration}</td>
          <td>${task.dependency.map(dep => dep.name).join(', ') || "-"}</td>
          <td>${task.responsible}</td>
          <td>${task.earlyStart!+1}</td>
          <td>${task.earlyFinish}</td>
          <td>${task.slack}</td>
          <td>${task.isCritical ? "Sim" : "Não"}</td>
          <td>
            <button class="edit-task-btn" data-task-id="${task.id}" title="Editar Tarefa">✏️</button>
            <button class="delete-task-btn" data-task-id="${task.id}" title="Apagar Tarefa">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // EN: Draw the Gantt chart with the calculated tasks.
      // PT-BR: Desenha o gráfico de Gantt com as tarefas calculadas.
      drawGantt(calculatedTasks, maxEndDate, ganttChart);

      // EN: Save the updated tasks list to JSON.
      // PT-BR: Salva a lista de tarefas atualizada para JSON.
      try {
        await TaskRepository.saveTasksToJson(this.app, dbFileName, tasks);
      } catch (error) {
        console.error("Erro ao salvar tarefas após atualização:", error);
        new Notice("Falha ao salvar as tarefas automaticamente.");
      }
    };

    // EN: Array to hold the tasks.
    // PT-BR: Array para armazenar as tarefas.
    let tasks: Task[] = [];
    try {
      // EN: Load tasks from JSON file on initialization.
      // PT-BR: Carrega as tarefas do arquivo JSON na inicialização.
      tasks = await TaskRepository.readTasksFromJson(this.app, dbFileName);
      updateTasks(); 
  } catch (error) {
      console.error("Erro ao carregar tarefas do arquivo:", error);
  }

    // EN: Variable to store the ID of the task being edited.
    // PT-BR: Variável para armazenar o ID da tarefa que está sendo editada.
    let editingTaskId: number | null = null;

    const startEditTask = (taskIdToEdit: number) => {
        const taskToEdit = tasks.find(task => task.id === taskIdToEdit);
        if (!taskToEdit) return;

        editingTaskId = taskIdToEdit;

        idInput.value = taskToEdit.id.toString();
        idInput.readOnly = true; 
        nameInput.value = taskToEdit.name;
        durationInput.value = taskToEdit.duration.toString();
        dependencyInput.value = taskToEdit.dependency.map(dep => dep.id).join(',');
        responsibleInput.value = taskToEdit.responsible;
        submitButton.textContent = "Atualizar Tarefa";
        form.scrollIntoView({ behavior: "smooth" });
    };

    // EN: Function to delete a task.
    // PT-BR: Função para apagar uma tarefa.
    const deleteTask = (taskIdToDelete: number) => {
        if (!confirm(`Tem certeza que deseja apagar a tarefa ID ${taskIdToDelete}? As tarefas que dependem dela perderão essa dependência.`)) {
            return;
        }

        tasks = tasks.filter(task => task.id !== taskIdToDelete);

        // EN: Remove the deleted task from other tasks' dependency lists.
        // PT-BR: Remove a tarefa apagada das listas de dependência de outras tarefas.
        tasks.forEach(task => {
            task.dependency = task.dependency.filter(dep => dep.id !== taskIdToDelete);
        });

        updateTasks();
        new Notice(`🗑️ Tarefa ID ${taskIdToDelete} apagada.`);
    };

    // EN: Event listener for clicks on the tasks table (edit and delete buttons).
    // PT-BR: Ouvinte de eventos para cliques na tabela de tarefas (botões de editar e apagar).
    tbody.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const button = target.closest('button');
        if (!button) return;

        const taskIdAttr = button.dataset.taskId;

        if (taskIdAttr) {
            const taskId = parseInt(taskIdAttr);
            if (button.classList.contains('edit-task-btn')) {
                startEditTask(taskId);
            } else if (button.classList.contains('delete-task-btn')) {
                deleteTask(taskId);
            }
        }
    });

    // EN: Event listener for form submission (add or update task).
    // PT-BR: Ouvinte de eventos para submissão do formulário (adicionar ou atualizar tarefa).
    form.addEventListener("submit", (e: Event) => {
      e.preventDefault();

      const currentIdStr = idInput.value;
      const name = nameInput.value.trim();
      const durationStr = durationInput.value;
      const dependencyIDInput = dependencyInput.value.trim();
      const responsible = responsibleInput.value.trim() || "";
      const duration = parseInt(durationStr);

      // EN: Validate form inputs.
      // PT-BR: Valida as entradas do formulário.
      if (!name || isNaN(duration) || duration <= 0) {
        new Notice("⚠️ Dados inválidos. Nome e Duração (positiva) são obrigatórios.");
        return;
      }

      const currentId = parseInt(currentIdStr);
      
      // EN: Parse dependency IDs and find corresponding tasks.
      // PT-BR: Analisa os IDs de dependência e encontra as tarefas correspondentes.
      const dependencyIDs: number[] = dependencyIDInput
        ? dependencyIDInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [];

      let dependencyTasks: Task[] = [];
      if (dependencyIDs.length > 0) {
          for (const depId of dependencyIDs) {
              // Check for self-dependency
              if (depId === currentId && editingTaskId === null) { // Ao adicionar
                   new Notice(`⚠️ Uma tarefa não pode depender de si mesma (ID ${currentId}).`);
                   return;
              }
              if (editingTaskId !== null && depId === editingTaskId) { // Ao atualizar
                  new Notice(`⚠️ Uma tarefa não pode depender de si mesma (ID ${editingTaskId}).`);
                  return;
              }

              const foundDep = tasks.find(t => t.id === depId);
              if (!foundDep) {
                  new Notice(`⚠️ Dependência com ID ${depId} não encontrada.`);
                  return; 
              }
              dependencyTasks.push(foundDep);
          }
          // TODO: Adicionar detecção de ciclo de dependência aqui, se necessário.
      }
      // EN: If editingTaskId is not null, update the existing task.
      // PT-BR: Se editingTaskId não for nulo, atualiza a tarefa existente.
      if (editingTaskId !== null) { 
          const taskToUpdate = tasks.find(task => task.id === editingTaskId);
          if (taskToUpdate) {
              taskToUpdate.name = name;
              taskToUpdate.duration = duration;
              taskToUpdate.responsible = responsible;
              taskToUpdate.dependency = dependencyTasks;
              new Notice(`✅ Tarefa ID ${editingTaskId} atualizada.`);
          }
          editingTaskId = null;
          idInput.readOnly = false;
          submitButton.textContent = "Adicionar Tarefa";
      } else {
          // EN: Otherwise, add a new task.
          // PT-BR: Caso contrário, adiciona uma nova tarefa.
          if (isNaN(currentId) || currentId <= 0) {
              new Notice("⚠️ ID da tarefa inválido. Deve ser um número positivo.");
              return;
          }
          if (tasks.some(t => t.id === currentId)) {
              new Notice(`⚠️ Já existe uma tarefa com o ID ${currentId}.`);
              return;
          }
          tasks.push(new Task(currentId, name, responsible, duration, dependencyTasks));
          new Notice("✅ Tarefa adicionada.");
      }
      updateTasks();
      form.reset();
    });

    // EN: Event listener for the "Insert Table in Note" button.
    // PT-BR: Ouvinte de eventos para o botão "Inserir Tabela na nota".
    insertMdBtn?.addEventListener("click", () => {
      if (tasks.length === 0) {
        new Notice("⚠️ Nenhuma tarefa para exportar.");
        return;
      }
      
      insertTableInNote(tasks, this.app);
    });

    // EN: Event listener for the "Save to Canvas" button.
    // PT-BR: Ouvinte de eventos para o botão "Salvar para Canvas".
    saveCanvasBtn?.addEventListener("click", () => {
      if (!this.app.workspace.getActiveFile()) {
        new Notice("⚠️ Nenhuma nota ativa para salvar o canvas.");
        return;
      }
      saveToCanvas(tasks, this.app);
    });
  }

  // EN: Returns the CSS styles for the view.
  // PT-BR: Retorna os estilos CSS para a visualização.
  getStyleCSS(): string {
    return `
      body { font-family: sans-serif; padding: 10px; }
      input, button { display: block; width: 100%; margin-bottom: 8px; padding: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
      .gantt-container { overflow-x: auto; height: 300px; border: 1px solid #ddd; }
      #gantt-chart { min-width: 1000px; height: auto; }
      .action-buttons { margin-top: 10px; }
      .action-buttons button, .task-form button { margin-right: 5px; display: inline-block; width: auto; }
      #tasks-table button {
          padding: 3px 6px;
          margin: 0 2px;
          font-size: 1em; /* Emojis são caracteres, então o tamanho da fonte os afeta */
          cursor: pointer;
          border: none; /* Remove borda padrão */
          background: none; /* Remove fundo padrão */
          line-height: 1; /* Para alinhar melhor os emojis */
      }
    `;
  }
}
