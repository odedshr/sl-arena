import http from 'http';
import { readFile } from 'fs';
import { extname } from 'path';

type Response = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
};

const ROOT_FOLDER = 'docs';

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

function startHttpServer(hostname: string, port: number): Promise<http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>> {
  return new Promise(resolve => {
    // https.createServer({
    //   cert: readFileSync('var/ssl/cert.pem'),
    //   key: readFileSync('var/ssl/key.pem')
    // })
    const server = http.createServer((req, res) => {
      let filePath = `./${ROOT_FOLDER}${req.url}`;
      if (filePath === `./${ROOT_FOLDER}/`) {
        filePath = `./${ROOT_FOLDER}/index.html`;
      }

      const fileExt = String(extname(filePath)).toLowerCase();
      const contentType: string = mimeTypes[fileExt] || 'application/octet-stream';

      readFile(filePath, (error, content) => error ? errorReadingFile(res, error) : getFile(res, content, contentType));
    });

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
  res.end();
}

function getFile(res: Response, content: Buffer, contentType: string) {
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content, 'utf-8');

}

export default startHttpServer;