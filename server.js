const http = require('http');
const fs = require('fs').promises;
const formidable = require('formidable');
const path = require('path');
const url = require('url');

const dataFile = 'items.json';
const uploadDir = 'uploads';

// Initialize with an empty array if the file does not exist
fs.access(dataFile).catch(() => fs.writeFile(dataFile, JSON.stringify([])));
fs.access(uploadDir).catch(() => fs.mkdir(uploadDir));

// Helper function to read and write data from/to the file
const readData = async () => {
    const data = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(data);
};

const writeData = async (data) => {
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
};

// Create the server
const server = http.createServer(async (req, res) => {
    const { method } = req;
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json');

    try {
        // Handle GET requests with optional id query param
        if (pathName === '/items' && method === 'GET') {
            const items = await readData();

            if (query.id) {
                const item = items.find(i => i.id === query.id);
                if (item) {
                    res.writeHead(200);
                    res.end(JSON.stringify(item));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Item not found');
                }
            } else {
                res.writeHead(200);
                res.end(JSON.stringify(items));
            }
        }
        // Handle POST requests to add new items
        else if (pathName === '/items' && method === 'POST') {
            const form = new formidable.IncomingForm();
            form.uploadDir = uploadDir;
            form.keepExtensions = true;
            form.maxFileSize = 10 * 1024 * 1024;

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error('Error processing form:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error processing image upload');
                    return;
                }

                if (!fields.id || !fields.name || !files.image) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Missing required fields');
                    return;
                }

                const newItem = {
                    id: fields.id,
                    name: fields.name,
                    imageUrl: `/uploads/${path.basename(files.image.path)}`
                };

                const items = await readData();
                items.push(newItem);
                await writeData(items);
                res.writeHead(201);
                res.end(JSON.stringify(newItem));
            });
        }
        // Handle PUT requests to update an item by id (replace entire item)
        else if (pathName === '/items' && method === 'PUT') {
            const items = await readData();
            const id = query.id;
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const updatedItem = JSON.parse(body);
                const itemIndex = items.findIndex(i => i.id === id);

                if (itemIndex !== -1) {
                    items[itemIndex] = { ...items[itemIndex], ...updatedItem };
                    await writeData(items);
                    res.writeHead(200);
                    res.end(JSON.stringify(items[itemIndex]));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Item not found');
                }
            });
        }
        // Handle PATCH requests to partially update an item by id
        else if (pathName === '/items' && method === 'PATCH') {
            const items = await readData();
            const id = query.id;
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                const updates = JSON.parse(body);
                const itemIndex = items.findIndex(i => i.id === id);

                if (itemIndex !== -1) {
                    // Only update the fields provided in the PATCH request
                    items[itemIndex] = { ...items[itemIndex], ...updates };
                    await writeData(items);
                    res.writeHead(200);
                    res.end(JSON.stringify(items[itemIndex]));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Item not found');
                }
            });
        }
        // Handle DELETE requests to remove an item by id
        else if (pathName === '/items' && method === 'DELETE') {
            const items = await readData();
            const id = query.id;
            const newItems = items.filter(item => item.id !== id);

            if (newItems.length !== items.length) {
                await writeData(newItems);
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Item not found');
            }
        }
        // Handle image fetching for uploads
        else if (pathName.startsWith('/uploads/') && method === 'GET') {
            const filePath = path.join(__dirname, pathName);
            try {
                const data = await fs.readFile(filePath);
                const ext = path.extname(filePath).toLowerCase();
                let contentType = 'application/octet-stream';
                if (ext === '.jpg' || ext === '.jpeg') {
                    contentType = 'image/jpeg';
                } else if (ext === '.png') {
                    contentType = 'image/png';
                }

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            } catch (err) {
                console.error('Error serving image:', err);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Route not found');
        }
    } catch (err) {
        console.error('Server error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
