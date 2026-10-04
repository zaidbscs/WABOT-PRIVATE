module.exports = {
    name: 'alive',
    description: 'Check if the bot is alive',
    aliases: [],
    tags: ['main'],
    command: /^(alive)$/i,

    async execute(sock, m) {
        try {
            // React with a lightning bolt
            await m.react('⚡');
            
            // Send a simple text message
            await sock.sendMessage(m.from, { 
                text: '*ᴡᴀʙᴏᴛ ᴀʟɪᴠᴇ*\nʜᴇʟʟᴏ, ɪ ᴀᴍ ᴡᴀʙᴏᴛ, ɪ ᴀᴍ ᴀʟɪᴠᴇ ʏᴇᴛ.' 
            }, { quoted: m });

        } catch (err) {
            console.error('❌ Alive plugin error:', err);
        }
    },
};