import { Task } from "../models/tasks";


export function calculateCPM(taskList: Task[]) {
    const sorted = [...taskList].sort((a, b) => a.id - b.id);    
    let maxEndDate = 0;
  
    for (const task of sorted) {
  
      if (task.dependency !== null && task.dependency) {
        task.earlyStart = task.dependency.earlyFinish || 0;
      }
  
      task.earlyFinish = task.earlyStart! + task.duration;
      task.lateFinish = 0;
      task.lateStart = 0;
      task.slack = 0;
      task.isCritical = false;
      maxEndDate = Math.max(maxEndDate, task.earlyFinish!);
    }
  
    for (const task of [...sorted].reverse()) {
      let lateFinish = maxEndDate;
  
      const dependents = sorted.filter(t => t.dependency === task);
      if (dependents.length > 0) {
        lateFinish = Math.min(...dependents.map(t => t.lateStart || 0));
      }
  
      task.lateFinish = lateFinish;
      task.lateStart = lateFinish - task.duration;
      task.slack = (task.lateFinish - task.earlyFinish!) || 0;
      task.isCritical = task.slack === 0;
    }
  
    return { tasks: sorted, maxEndDate };
  }