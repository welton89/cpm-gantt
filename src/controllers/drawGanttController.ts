import { Task } from "../models/tasks";


export function drawGantt(tasks: Task[], maxEndDate: number, chartContainer: SVGSVGElement) {
    chartContainer.innerHTML = "";
    const chartWidth = 500;
    const scale = chartWidth / (maxEndDate || 1);
    const barHeight = 20;
    const rowHeight = 30;
  
    chartContainer.setAttribute("height", (tasks.length * rowHeight + 20).toString());
  
    for (let i = 0; i <= maxEndDate; i++) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (i * scale).toString());
      text.setAttribute("y", "15");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#333");
      text.textContent = i.toString();
      chartContainer.appendChild(text);
    }
  
    tasks.forEach((task, index) => {
      const x = (task.earlyStart || 0) * scale;
      const y = index * rowHeight + 10;
      const width = (task.duration || 0) * scale;
  
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", width.toString());
      rect.setAttribute("height", barHeight.toString());
      rect.setAttribute("fill", task.isCritical ? "#ef4444" : "#3b82f6");
      rect.setAttribute("rx", "5");
      chartContainer.appendChild(rect);
  
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", (x + 5).toString());
      label.setAttribute("y", (y + barHeight / 2 + 5).toString());
      label.setAttribute("fill", "white");
      label.setAttribute("font-size", "12");
      label.textContent = task.name;
      chartContainer.appendChild(label);
    });
  }