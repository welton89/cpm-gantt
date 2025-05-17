import { App, Notice, normalizePath, TFile } from "obsidian";
import { Task } from "../models/tasks";


export async function saveToCanvas(tasks: Task[], app: App) {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice("⚠️ Nenhuma nota ativa. Não é possível salvar o canvas.");
      return;
    }

    const canvasFileName = `${activeFile.basename}Gantt.canvas`;
    const folderPath = activeFile.parent ? activeFile.parent.path : "";
    const newCanvasFilePath = normalizePath(`${folderPath}/${canvasFileName}`);

    let canvasData: { nodes: any[]; edges: any[] }  = {
      nodes: [],
      edges: [],
    };

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.earlyStart !== undefined) {
        let node = task.createNode(i);
        canvasData.nodes.push(node);
        if (task.dependency) {
          const edge = task.createEdges(i); 
          canvasData.edges.push(edge);
        }
      }
    }

    const canvasContent = JSON.stringify(canvasData, null, 2);

    try {
      const existingFile = app.vault.getAbstractFileByPath(newCanvasFilePath); 
      if (existingFile && existingFile instanceof TFile) {
      
        await app.vault.modify(existingFile, canvasContent);
        new Notice(`✅ Canvas "${canvasFileName}" atualizado na pasta da nota!`);
      } else {
        
        await app.vault.create(newCanvasFilePath, canvasContent);
        new Notice(`✅ Canvas "${canvasFileName}" criado na pasta da nota!`);

        
        if (activeFile) { 
          const linkInterno: string = `\n\n![[${canvasFileName}]]\n`; 
          try {
            await app.vault.append(activeFile, linkInterno);
            new Notice("✅ Link para o Canvas inserido na nota!");
          } catch (erro) {
            console.error("Erro ao inserir link do canvas na nota:", erro);
            new Notice("❌ Erro ao inserir link do canvas na nota.");
          }
        }
      }
    } catch (error) {
      console.error("Erro ao salvar/atualizar arquivo canvas:", error);
      new Notice(`❌ Erro ao salvar/atualizar o arquivo canvas: ${error.message}`);
    }
  }