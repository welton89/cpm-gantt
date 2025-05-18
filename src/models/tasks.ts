export class Task {
    id: number;
    name: string;
    responsible: string;
    duration: number;
    dependency: Task[]; // Alterado de Task | null para Task[]
    earlyStart?: number; 
    earlyFinish?: number; 
    lateFinish?: number;
    lateStart?: number;
    slack?: number;
    isCritical?: boolean; 
  
    constructor(id: number,
                name: string, 
                responsible: string, 
                duration: number,
                dependency: Task[] = []) { // Valor padrão e tipo alterados
      this.id = id;
      this.name = name;
      this.responsible = responsible;
      this.duration = duration;
      this.dependency = dependency; // Agora é um array
      this.earlyStart = 0;
      this.earlyFinish = 0;
      this.lateFinish = 0;
      this.lateStart = 0;
      this.slack = 0;
      this.isCritical = false;
    }


    createNode(i: number) {
        let node = {
            id: `${this.id}` ,
            type:"text",
            text:`[[${this.name}]]`,
            x: `${this.earlyStart!*130}`,
            y:`${i*50}`,
            width:`${this.duration * 130} `,
            height:50,
            color:`${this.isCritical ? 1 : 5}`,
        }
        return node;
    }


    // Gera arestas para TODAS as dependências desta tarefa
    createEdges (): any[] { // Removido parâmetro 'i' não utilizado, retorna array de arestas
        const edges = [];
        for (const depTask of this.dependency) {
            edges.push({
                id: `edge-${depTask.id}-to-${this.id}`, // ID da aresta mais específico
                fromNode: `${depTask.id}`,
                fromSide: "right",
                toNode: `${this.id}`,
                toSide: "left",
            });
        }
        return edges;
    }
}

  
