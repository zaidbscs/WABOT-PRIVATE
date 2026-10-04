module.exports = {
    name: 'ping',
    aliases: ['speed', 'latency'],
    description: 'Check bot response speed',

    async execute(sock, m, args) {
        try {
            await m.react('⏱️');
            
            const start = Date.now();
            // Send initial message to measure actual round-trip time
            const sentMsg = await m.reply('Pinging...');
            const latency = Date.now() - start;
            
            // Send a NEW message with the result instead of editing
            await sock.sendMessage(m.from, { 
                text: `> Latency: ${latency} ms`
            }, { quoted: sentMsg });

        } catch (err) {
            console.error('Ping error:', err);
            await m.reply('❌ Error checking ping.');
        }
    }
};