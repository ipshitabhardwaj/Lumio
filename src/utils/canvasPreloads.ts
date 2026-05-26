/**
 * Utility to generate mock homework hand-drawn drawings as actual base64 PNG images.
 * This demonstrates the multimodal capabilities of the Gemini solver.
 */

export function generateGeometrySketch(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // White base background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines to look like graph paper
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw hand-drawn right triangle
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Hypothetical hand shaking offset
  ctx.beginPath();
  ctx.moveTo(82, 63);
  ctx.lineTo(80, 241);
  ctx.lineTo(298, 239);
  ctx.closePath();
  ctx.stroke();

  // Draw right angle symbol
  ctx.beginPath();
  ctx.moveTo(80, 220);
  ctx.lineTo(100, 220);
  ctx.lineTo(100, 240);
  ctx.stroke();

  // Draw angle arc
  ctx.beginPath();
  ctx.arc(298, 239, 30, Math.PI, 1.25 * Math.PI, false);
  ctx.strokeStyle = "#db2777";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Custom educational labels with pencil vibe
  ctx.fillStyle = "#2563eb";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("x", 255, 225);

  ctx.fillStyle = "#1e293b";
  ctx.font = "italic bold 16px sans-serif";
  ctx.fillText("c = 10", 185, 135); // Hypotenuse
  ctx.fillText("a = 5", 40, 160); // Side

  // Annotation text
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Find the value of angle x in degrees.", 40, 280);

  return canvas.toDataURL("image/png");
}

export function generateChemicalFormula(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw an ester or organic compound skeletal structure (Ethanol/Ethanol-like)
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Skeletal vertices
  // Zig-zag line
  ctx.beginPath();
  ctx.moveTo(60, 150);  // Left CH3
  ctx.lineTo(130, 100); // CH2
  ctx.lineTo(200, 150); // CH2
  ctx.lineTo(270, 100); // Carbonyl C
  ctx.stroke();

  // Double bond O (carbonyl oxygen)
  ctx.beginPath();
  ctx.moveTo(260, 95);
  ctx.lineTo(260, 35);
  ctx.moveTo(280, 95);
  ctx.lineTo(280, 35);
  ctx.stroke();

  // Oxygen single bond O-H
  ctx.beginPath();
  ctx.moveTo(270, 100);
  ctx.lineTo(330, 135);
  ctx.stroke();

  // Text notations
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("O", 262, 30);
  ctx.fillText("OH", 335, 142);
  
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 13px font-mono";
  ctx.fillText("CH₃", 25, 155);

  ctx.fillStyle = "#4b5563";
  ctx.font = "14px sans-serif";
  ctx.fillText("What is the IUPAC name, molecular weight,", 45, 230);
  ctx.fillText("and key functional group of this compound?", 45, 255);

  return canvas.toDataURL("image/png");
}

export function generatePhysicsSketch(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // White base background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw ground and cliff
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(150, 80);
  ctx.lineTo(150, 240);
  ctx.lineTo(370, 240);
  ctx.stroke();

  // Ball being thrown
  ctx.beginPath();
  ctx.arc(148, 68, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
  ctx.stroke();

  // Trajectory dashed curve
  ctx.beginPath();
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 2;
  ctx.moveTo(148, 68);
  ctx.quadraticCurveTo(240, 10, 310, 240);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Draw arrows for initial speed vector
  ctx.beginPath();
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.moveTo(148, 68);
  ctx.lineTo(210, 40);
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  ctx.moveTo(210, 40);
  ctx.lineTo(202, 35);
  ctx.lineTo(206, 48);
  ctx.closePath();
  ctx.fill();

  // Labels
  ctx.fillStyle = "#2563eb";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("v₀ = 20 m/s at θ = 30°", 175, 30);

  ctx.fillStyle = "#1e293b";
  ctx.font = "italic bold 13px sans-serif";
  ctx.fillText("h = 50 m", 75, 160);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Calculate the range (d) of the projectile.", 40, 280);

  return canvas.toDataURL("image/png");
}
