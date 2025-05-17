import { Plugin } from "obsidian";
import { CPMView, CPM_VIEW_TYPE } from "./src/views/CPMView";
import { TaskRepository } from "src/repository/repository";

export default class CPMGanttPlugin extends Plugin {
  async onload() {
    this.registerView(CPM_VIEW_TYPE, (leaf) => new CPMView(leaf));
    this.addRibbonIcon("chart-gantt", "Abrir CPM Gantt", () => {
      this.activateView();
    });
  }

  async activateView() {
    // Removendo a leitura do JSON aqui, a view fará isso ao abrir
    // const tasks = await TaskRepository.readTasksFromJson(this.app, 'db.json');
    this.app.workspace.detachLeavesOfType(CPM_VIEW_TYPE);
    await this.app.workspace.getLeaf("split").setViewState({
      type: CPM_VIEW_TYPE,
    });
  }
}