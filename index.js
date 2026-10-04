require('./config');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, generateWAMessageContent, generateWAMessageFromContent, generateMessageID, prepareWAMessageMedia, fetchLatestWaWebVersion, proto, generateProfilePicture, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Boom } = require('@hapi/boom');
const serializeMessage = require('./handler.js');
const JimpImport = require('jimp');

const Jimp =
  JimpImport.read
    ? JimpImport
    : JimpImport.Jimp
    ? JimpImport.Jimp
    : JimpImport.default;

global.generateWAMessageContent = generateWAMessageContent;
global.generateWAMessageFromContent = generateWAMessageFromContent;
global.generateMessageID = generateMessageID;
global.prepareWAMessageMedia = prepareWAMessageMedia;
global.proto = proto;
global.Jimp = Jimp;
global.generateProfilePicture = generateProfilePicture;
global.downloadMediaMessage = downloadMediaMessage;
global.bannedChats = global.bannedChats || [];

if (!fs.existsSync(__dirname + '/session/creds.json') && global.sessionid) {
    try {
        const sessionData = JSON.parse(global.sessionid);
        fs.mkdirSync(__dirname + '/session', { recursive: true });
        fs.writeFileSync(__dirname + '/session/creds.json', JSON.stringify(sessionData, null, 2));
    } catch (err) {
        console.error('Error restoring session:', err);
    }
}

const AUTH_FOLDER = './session';
const PLUGIN_FOLDER = './plugins';
const PORT = process.env.PORT || 3000;

let botStatus = 'disconnected';
let presenceInterval = null;
let sock = null;
let isConnecting = false;

function loadPrefix() {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.prefix) {
                global.BOT_PREFIX = config.prefix;
                console.log(`Loaded prefix: ${global.BOT_PREFIX}`);
            }
        } catch (err) {
            console.error('Error loading config:', err);
        }
    }
    startBot();
}

function startBot() {
    console.log('Starting WhatsApp Bot...');
    isConnecting = true;

    if (!fs.existsSync(AUTH_FOLDER)) {
        fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const credsPath = path.join(AUTH_FOLDER, 'creds.json');
    if (fs.existsSync(credsPath)) {
        try {
            const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            if (creds.noiseKey && creds.noiseKey.private) {
                console.log('Using existing session...');
            } else {
                console.log('Invalid session detected, will create new one...');
            }
        } catch (err) {
            console.log('Corrupted session, will create new one...');
        }
    }

    (async () => {
        try {
            const { version, isLatest } = await fetchLatestWaWebVersion();
            console.log(`Using WA v${version.join(".")}, isLatest: ${isLatest}`);

            const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
            
            sock = makeWASocket({
                version, 
                logger: pino({ level: 'silent' }),
                auth: state,
                keepAliveIntervalMs: 10000,
                markOnlineOnConnect: true,
                syncFullHistory: false,
                browser: Browsers.ubuntu('Chrome'),
                connectTimeoutMs: 60000
            });
            
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'close') {
                    botStatus = 'disconnected';
                    isConnecting = false;

                    if (presenceInterval) {
                        clearInterval(presenceInterval);
                        presenceInterval = null;
                    }

                    const statusCode = (lastDisconnect?.error instanceof Boom)
                        ? lastDisconnect.error.output.statusCode
                        : 0;

                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                    if (shouldReconnect) {
                        setTimeout(() => startBot(), 5000);
                    } else {
                        if (fs.existsSync(AUTH_FOLDER)) {
                            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                        }
                        setTimeout(() => startBot(), 3000);
                    }
                } 
                else if (connection === 'open') {
                    botStatus = 'connected';
                    isConnecting = false;

                    if (!global.owners) global.owners = [];

                    if (!global.owners.includes(sock.user.id)) {
                        global.owners.push(sock.user.id);
                    }

                    presenceInterval = setInterval(() => {
                        if (sock?.ws?.readyState === 1) {
                            sock.sendPresenceUpdate('available');
                        }
                    }, 10000);

                    try {
                        await sock.sendMessage(sock.user.id, {
                            text: `Bot linked successfully!\nCurrent prefix: ${global.BOT_PREFIX}\nOwners: ${global.owners.length}\nConnected at: ${new Date().toLocaleString()}`
                        });
                    } catch (err) {}
                } 
                else if (connection === 'connecting') {
                    botStatus = 'connecting';
                    isConnecting = true;
                }
            });

            sock.ev.on('creds.update', async () => {
                await saveCreds();
                console.log('Credentials updated');
            });

            const plugins = new Map();
            const pluginPath = path.join(__dirname, PLUGIN_FOLDER);
            
            if (fs.existsSync(pluginPath)) {
                try {
                    const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));
                    
                    for (const file of pluginFiles) {
                        try {
                            const plugin = require(path.join(pluginPath, file));
                            if (plugin.name && typeof plugin.execute === 'function') {
                                plugins.set(plugin.name.toLowerCase(), plugin);
                                if (Array.isArray(plugin.aliases)) {
                                    plugin.aliases.forEach(alias => {
                                        plugins.set(alias.toLowerCase(), plugin);
                                    });
                                }
                                console.log(`Loaded plugin: ${plugin.name}`);
                            } else {
                                console.warn(`Invalid plugin structure in ${file}`);
                            }
                        } catch (error) {
                            console.error(`Failed to load plugin ${file}:`, error.message);
                        }
                    }
                    console.log(`Total plugins loaded: ${plugins.size}`);
                } catch (error) {
                    console.error('Error loading plugins:', error);
                }
            } else {
                console.log('No plugins folder found');
            }
           
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify' && type !== 'append') return;
                
                // Status auto-viewer logic (kept intact)
                for (const rawMsg of messages) {
                    if (rawMsg.key.remoteJid === 'status@broadcast' && rawMsg.key.participant) {
                        try {
                            console.log(`Status detected from: ${rawMsg.key.participant}`);
                            await sock.readMessages([rawMsg.key]);
                            continue;
                        } catch (err) {
                            console.log('Status viewer error:', err.message);
                        }
                    }
                }

                const rawMsg = messages[0];
                if (!rawMsg.message) return;

                const m = await serializeMessage(sock, rawMsg);

                for (const plugin of plugins.values()) {
                    if (typeof plugin.onMessage === 'function') {
                        try { 
                            const blocked = await plugin.onMessage(sock, m);
                            if (blocked === true) return;
                        } catch (err) { 
                            console.error(`onMessage error (${plugin.name}):`, err); 
                        }
                    }
                }

                if (m.body && m.body.startsWith(global.BOT_PREFIX)) {
                    const args = m.body.slice(global.BOT_PREFIX.length).trim().split(/\s+/);
                    const commandName = args.shift().toLowerCase();
                    const plugin = plugins.get(commandName);
                    
                    if (plugin) {
                        try { 
                            await plugin.execute(sock, m, args); 
                        } catch (err) { 
                            console.error(`Plugin error (${commandName}):`, err); 
                            await m.reply('Error running command.'); 
                        }
                    }
                }
            });

            // REMOVED: group-participants.update (Welcome/Goodbye) event listener

            sock.ev.on('messages.reaction', async (reactions) => {
                console.log('Reaction update:', reactions);
            });

        } catch (error) {
            console.error('Bot startup error:', error);
            isConnecting = false;
            setTimeout(() => startBot(), 10000);
        }
    })();
}

// Simplified HTTP Server
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/qr') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Bot Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f2f5;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 90%;
        }
        h1 { color: #075e54; margin-bottom: 10px; }
        p { color: #555; margin-bottom: 25px; }
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background-color: #25D366;
            color: white;
            text-decoration: none;
            font-size: 18px;
            font-weight: bold;
            border-radius: 8px;
            transition: background 0.3s ease;
        }
        .btn:hover {
            background-color: #128C7E;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WhatsApp Bot</h1>
        <p>For get your session id please click me</p>
        <!-- REPLACE THE URL BELOW WITH YOUR ACTUAL WEBSITE URL -->
        <a href="https://wabot-paircode.vercel.pk/" class="btn">Get Session ID</a>
    </div>
</body>
</html>`);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<center><h1>404 - Page Not Found</h1><a href="/">Go Home</a></center>`);
    }
});

server.listen(PORT, () => {
    console.log(`Web server running at http://localhost:${PORT}`);
    console.log(`Session folder: ${path.resolve(AUTH_FOLDER)}`);
    loadPrefix();
});

process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    if (presenceInterval) clearInterval(presenceInterval);
    if (sock) sock.end();
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});