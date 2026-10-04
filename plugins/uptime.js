module.exports = {
    name: 'uptime',
    aliases: ['up'],
    description: 'Check how long the bot has been running.',

    async execute(sock, m) {
        try {
            await m.react('⏱️');
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

            // Send a simple text reply
            await m.reply(`*ᴡᴀʙᴏᴛ ᴜᴘᴛɪᴍᴇ*\nᴛʜᴇ ʙᴏᴛ ʜᴀs ʙᴇᴇɴ ʀᴜɴɴɪɴɢ ғᴏʀ:\n${formattedTime}`);
            
        } catch (err) {
            console.error('Uptime error:', err);
            await m.reply('❌ Error checking uptime.');
        }
    }
};