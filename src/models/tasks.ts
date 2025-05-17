export class Task {
    id: number;
    name: string;
    responsible: string;
    duration: number;
    dependency: Task | null;
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
                dependency: Task | null = null) {
      this.id = id;
      this.name = name;
      this.responsible = responsible;
      this.duration = duration;
      this.dependency = dependency;
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


    createEdges (i: number) {
        let edge = {
            id: `"edge-${this.id}"`,
            fromNode: `${this.dependency!.id}`,
            fromSide: "right",
            toNode: `${this.id}`,
            toSide: "left",
        }
        return edge;
    }
}

  
