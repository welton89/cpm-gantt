import { App, Notice} from "obsidian";
import { Task } from "../models/tasks";


export async function insertTableInNote(tasks: Task[], app: App) {
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) {
    new Notice("⚠️ Nenhuma nota aberta.");
    return;
  }

  if (!tasks || tasks.length === 0) {
    new Notice("⚠️ Nenhuma tarefa para inserir.");
    return;
  }

  const headers = ["ID", "Nome", "Duração", "Dependência", "Responsável", "Início", "Fim", "Slack", "Crítica"];
  let markdown = "| " + headers.join(" | ") + " |\n";
  markdown += "|---|---|---|---|---|---|---|---|---|\n";

  tasks.forEach(task => {
    markdown += `| ${task.id} | [[${task.name}]] | ${task.duration} | [[${task.dependency?.name ?? "-"}]] | [[${task.responsible ?? "-"}]] | ${task.earlyStart!+1} | ${task.earlyFinish ?? "-"} | ${task.slack ?? "-"} | ${task.isCritical ? "Sim" : "Não"} |\n`;
  });

  try {
    await app.vault.append(activeFile, `\n${markdown}\n`);
    new Notice("✅ Tabela em Markdown inserida com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir na nota:", err);
    new Notice("❌ Erro ao inserir tabela na nota.");
  }
}