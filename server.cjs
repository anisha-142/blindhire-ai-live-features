const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ts = require('./typescript.min.js');

const PORT = 3000;
const ROOT = __dirname;

// Server-side only. Never sent to the browser. Set this in your shell or a
// local .env-style file that you load before starting the server, e.g.:
//   GEMINI_API_KEY=xxxx node server.cjs
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Proxies a Gemini generateContent call. The API key never leaves this
 * process — the browser only ever talks to /api/ai/generate on localhost.
 */
function proxyGeminiRequest(reqBody) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) {
      const err = new Error('NO_API_KEY');
      err.code = 'NO_API_KEY';
      return reject(err);
    }
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: reqBody.prompt || '' }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        ...(reqBody.temperature != null ? { temperature: reqBody.temperature } : {})
      }
    });

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.ts': 'application/javascript; charset=UTF-8',
  '.tsx': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function transpileCode(code, filePath) {
  try {
    const res = ts.transpileModule(code, {
      compilerOptions: {
        jsx: 2, // React.createElement
        module: 99, // ESNext
        target: 7, // ES2020
        isolatedModules: true
      },
      fileName: filePath
    });

    let jsCode = res.outputText;

    // Rewrite relative imports to include extensions for browser ES modules
    const dir = path.dirname(filePath);
    jsCode = jsCode.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, relPath) => {
      if (relPath.endsWith('.tsx') || relPath.endsWith('.ts') || relPath.endsWith('.js') || relPath.endsWith('.json')) {
        return match;
      }
      for (const ext of ['.tsx', '.ts', '.jsx', '.js', '.json']) {
        if (fs.existsSync(path.join(dir, relPath + ext))) {
          return `from '${relPath}${ext}'`;
        }
      }
      return match;
    });

    return jsCode;
  } catch (err) {
    console.error(`Transpilation error in ${filePath}:`, err);
    return `console.error("Transpilation error in ${filePath}:", ${JSON.stringify(err.message)});`;
  }
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  // --- Server-side AI proxy: keeps GEMINI_API_KEY out of the browser ---
  if (reqPath === '/api/ai/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const result = await proxyGeminiRequest(parsed);
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.body));
      } catch (err) {
        // No key configured (or upstream failure) — the client falls back
        // to its deterministic offline mode when it sees a non-2xx status.
        const status = err.code === 'NO_API_KEY' ? 501 : 502;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'AI proxy error' }));
      }
    });
    return;
  }

  let filePath = path.join(ROOT, reqPath);

  // Extension resolution
  if (!fs.existsSync(filePath)) {
    for (const ext of ['.tsx', '.ts', '.jsx', '.js', '.json']) {
      if (fs.existsSync(filePath + ext)) {
        filePath = filePath + ext;
        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + reqPath);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  // Transpile TypeScript & TSX files on request
  if (ext === '.ts' || ext === '.tsx') {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const transpiled = transpileCode(rawContent, filePath);

    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(transpiled);
    return;
  }

  // HTML handling: no secrets are injected into the page anymore.
  // AI calls now go through the same-origin /api/ai/generate proxy above,
  // which reads GEMINI_API_KEY from the server process's environment only.
  if (ext === '.html') {
    let html = fs.readFileSync(filePath, 'utf-8');
    if (!html.includes('window.process')) {
      html = html.replace('<head>', '<head><script>window.process = { env: {} };</script>');
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(html);
    return;
  }

  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });

  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BlindHire AI Server running at http://localhost:${PORT}`);
});
