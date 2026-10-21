const fs = require('fs');
const V = process.argv[2] || '14';
['index.html', 'dev/render-produtos.html'].forEach(function (f) {
  if (!fs.existsSync(f)) return;
  let t = fs.readFileSync(f, 'utf8');
  t = t.replace(/src="js\/([a-z]+)\.js(\?v=\d+)?"/g, 'src="js/$1.js?v=' + V + '"');
  t = t.replace(/href="css\/konstruct\.css(\?v=\d+)?"/g, 'href="css/konstruct.css?v=' + V + '"');
  fs.writeFileSync(f, t, 'utf8');
  console.log(f + ' -> v' + V);
});
