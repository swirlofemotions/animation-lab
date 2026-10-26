const fs=require('fs'),http=require('http'),path=require('path');const root=__dirname;http.createServer((req,res)=>{let url=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(root,'.'+url);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end()}if(url.endsWith('/'))file=path.join(file,'index.html');fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data)})}).listen(4183,'127.0.0.1',()=>console.log('http://127.0.0.1:4183'));




