import { Task } from "src/models/tasks";
import { App, Notice, normalizePath } from "obsidian";


export class TaskRepository {
    static async readTasksFromJson(app: App, filename: string): Promise<Task[]> {
      try {
        const activeFile = app.workspace.getActiveFile();
        const folderPath = activeFile?.parent ? activeFile.parent.path : "";
        const filePath = normalizePath(`${folderPath}/${filename}`);

        if (!await app.vault.adapter.exists(filePath)) {
          new Notice(`Arquivo ${filename} não encontrado na pasta da nota ativa.`);
          console.log(`Arquivo não encontrado: ${filePath}`);
          return [];
        }
        const fileContent = await app.vault.adapter.read(filePath);
        const rawTasks: any[] = JSON.parse(fileContent);
        new Notice(`Arquivo ${filename} carregado com ${rawTasks.length} tarefas.`);
  
        const tasks: Task[] = rawTasks.map(rawTask => {
          const task = new Task(
            rawTask.id,
            rawTask.name,
            rawTask.responsible,
            rawTask.duration
          );
          task.earlyStart = rawTask.earlyStart;
          task.earlyFinish = rawTask.earlyFinish;
          task.lateFinish = rawTask.lateFinish;
          task.lateStart = rawTask.lateStart;
          task.slack = rawTask.slack;
          task.isCritical = rawTask.isCritical;
          return task;
        });
  
        const taskMap = new Map<number, Task>(tasks.map(task => [task.id, task]));
        tasks.forEach(task => {
          const rawTask = rawTasks.find(rt => rt.id === task.id);
          if (rawTask?.dependency && typeof rawTask.dependency === 'object' && rawTask.dependency.id !== undefined) {
            task.dependency = taskMap.get(rawTask.dependency.id) || null;
          } else if (typeof rawTask?.dependency === 'number') {
            task.dependency = taskMap.get(rawTask.dependency) || null;
          } else {
            task.dependency = null;
          }
        });
        return tasks; 
  
      } catch (error) {
        new Notice(`Erro ao ler ou analisar o arquivo ${filename}: ${error.message}`);
        console.error(`Erro ao ler ou analisar o arquivo JSON (${filename}):`, error);
        return [];
      }
    }

     static async saveTasksToJson(app: App, filename: string, tasks: Task[]): Promise<void> {
      try {
        const activeFile = app.workspace.getActiveFile();
        const folderPath = activeFile?.parent ? activeFile.parent.path : "";
        const filePath = normalizePath(`${folderPath}/${filename}`);

        const rawTasksToSave = tasks.map(task => ({
          id: task.id,
          name: task.name,
          responsible: task.responsible,
          duration: task.duration,
          dependency: task.dependency ? task.dependency.id : null,
          earlyStart: task.earlyStart,
          earlyFinish: task.earlyFinish,
          lateFinish: task.lateFinish,
          lateStart: task.lateStart,
          slack: task.slack,
          isCritical: task.isCritical,
        }));

        const jsonString = JSON.stringify(rawTasksToSave, null, 2);
        await app.vault.adapter.write(filePath, jsonString);
        new Notice(`Tarefas salvas em ${filename} (${tasks.length} tarefas).`);
      } catch (error) {
        new Notice(`Erro ao salvar tarefas em ${filename}: ${error.message}`);
        console.error(`Erro ao salvar tarefas no arquivo JSON (${filename}):`, error);
      }
    }

  }
  