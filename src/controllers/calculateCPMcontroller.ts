import { Task } from "../models/tasks";


export function calculateCPM(taskList: Task[]) {
    // Garante que todas as tarefas tenham as propriedades CPM inicializadas
    taskList.forEach(task => {
        task.earlyStart = 0;
        task.earlyFinish = 0;
        task.lateStart = 0;
        task.lateFinish = 0;
        task.slack = 0;
        task.isCritical = false;
    });

    // Forward Pass: Calcula Início Cedo (ES) e Fim Cedo (EF)
    // Assume que taskList pode ser processada na ordem atual ou que os IDs implicam ordem.
    // Para robustez, uma ordenação topológica ou cálculo iterativo até convergência seria necessário
    // se as dependências puderem apontar para tarefas posteriores no array.
    taskList.forEach(task => {
        if (task.dependency.length > 0) {
            // ES é o máximo EF de todos os seus predecessores diretos
            const maxPredecessorEF = Math.max(0, ...task.dependency.map(dep => {
                // Encontra o objeto da tarefa real para a dependência na lista atual
                const predecessor = taskList.find(p => p.id === dep.id);
                return predecessor?.earlyFinish || 0; // Usa 0 se o predecessor não for encontrado ou EF não estiver definido
            }));
            task.earlyStart = maxPredecessorEF;
        } else {
            task.earlyStart = 0; // Tarefas sem dependências começam em 0
        }
        task.earlyFinish = (task.earlyStart || 0) + task.duration;
    });

    let maxEndDate = 0;
    taskList.forEach(task => {
        if (task.earlyFinish !== undefined) {
            maxEndDate = Math.max(maxEndDate, task.earlyFinish);
        }
    });

    // Backward Pass: Calcula Fim Tarde (LF) e Início Tarde (LS)
    [...taskList].reverse().forEach(task => {
        // Encontra tarefas que dependem da tarefa atual (seus sucessores)
        const successors = taskList.filter(successor =>
            successor.dependency.some(dep => dep.id === task.id)
        );

        if (successors.length > 0) {
            // LF é o mínimo LS de todos os seus sucessores diretos
            task.lateFinish = Math.min(...successors.map(s => s.lateStart === undefined ? Infinity : s.lateStart));
        } else {
            // Tarefas sem sucessores terminam na data máxima de término do projeto
            task.lateFinish = maxEndDate;
        }

        task.lateStart = (task.lateFinish === undefined ? maxEndDate : task.lateFinish) - task.duration;
        task.slack = (task.lateStart || 0) - (task.earlyStart || 0);
        task.isCritical = task.slack === 0;
        if (Object.is(task.slack, -0)) task.slack = 0; // Corrige -0 para 0
        task.isCritical = task.slack === 0;
    });

    return { tasks: taskList, maxEndDate };
  }