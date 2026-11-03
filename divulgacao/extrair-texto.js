// Extrai o texto visivel do index.html para arquivo (apoio a traducao)
const fs = require("fs");
const path = require("path");
let h = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
h = h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
const out = [];
h.split("\n").forEach((l, i) => {
  const t = l
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (t) out.push(i + 1 + ": " + t);
});
fs.writeFileSync(path.join(__dirname, "texto-index.txt"), out.join("\n"), "utf8");
console.log(out.length + " linhas de texto");
