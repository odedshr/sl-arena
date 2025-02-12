import { Server, IncomingMessage, ServerResponse, createServer } from 'http';
import { readFile } from 'fs';
import { extname } from 'path';
import { Endpoint } from './types';

type Response = ServerResponse<IncomingMessage> & {
  req: IncomingMessage;
};

const ROOT_FOLDER = 'docs';
const endpoints:Endpoint[] = [];

const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.svg': 'application/image/svg+xml'
};

function handleRequest(req: IncomingMessage, res: Response) {
  const endpoint = endpoints.find(endpoint => isMatch(req.method, endpoint.method, req.url,  endpoint.url));
  if (endpoint) {
    outputResult(res, endpoint.handle(req));
  }

  let filePath = `./${ROOT_FOLDER}${req.url}`;
  if (filePath === `./${ROOT_FOLDER}/`) {
    filePath = `./${ROOT_FOLDER}/index.html`;
  }

  const fileExt = String(extname(filePath)).toLowerCase();
  const contentType: string = mimeTypes[fileExt] || 'application/octet-stream';

  readFile(filePath, (error, content) => error ? errorReadingFile(res, error) : getFile(res, content, contentType));
}

function isMatch(method: string | undefined, method1: string, url: string | undefined, url1: string | RegExp): boolean {
  if (!method || !url || method !== method1) {
    return false;
  }

  if (typeof url1 === 'string') {
    return url === url1;
  } else {
    return url1.test(url);
  }
}

function outputResult(res: Response, result: any) {
  if (typeof result === 'string') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(result, 'utf-8');
  } else if (typeof result === 'object') {
    if (result.then) {
      result.then((data:any) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data), 'utf-8');
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result), 'utf-8');
    }
  }
}

function startHttpServer(hostname: string, port: number): Promise<Server<typeof IncomingMessage, typeof ServerResponse>> {
  return new Promise(resolve => {
    // https.createServer({
    //   cert: readFileSync('var/ssl/cert.pem'),
    //   key: readFileSync('var/ssl/key.pem')
    // })
    const server = createServer(handleRequest);

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      resolve(server);
    });
  });
}

function errorReadingFile(res: Response, error: NodeJS.ErrnoException) {
  if (error.code == 'ENOENT') {
    return readFile(`./${ROOT_FOLDER}/404.html`, (error, content) => {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    });
  }

  res.writeHead(500);
  res.end('Sorry, there was an error: ' + error.code + ' ..\n');
}

function getFile(res: Response, content: Buffer, contentType: string) {
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content, 'utf-8');
}

export default startHttpServer;
