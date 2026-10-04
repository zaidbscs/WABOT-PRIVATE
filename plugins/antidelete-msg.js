module.exports = {
    name: 'antidelete',
    description: 'Explains how the antidelete feature works',
    aliases: ['ad', 'antidel'],
    tags: ['main'],
    command: /^(ad|antidel|antidelete)$/i,

    async execute(sock, m) {
        try {
            // React with a shield emoji
            // await m.react('🛡️');
            
            // Simple instruction text matching your bot's style
            const instructions = `*ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ʜᴏᴡ-ᴛᴏ*
            
ɢᴏᴏᴅ ɴᴇᴡs! ʏᴏᴜ ᴅᴏɴ'ᴛ ɴᴇᴇᴅ ᴛᴏ ᴅᴏ ᴀɴʏᴛʜɪɴɢ.

ᴛʜɪs ғᴇᴀᴛᴜʀᴇ ɪs *ғᴜʟʟʏ ᴀᴜᴛᴏᴍᴀᴛɪᴄ*. 
ɪғ sᴏᴍᴇᴏɴᴇ ᴅᴇʟᴇᴛᴇs ᴀ ᴍᴇssᴀɢᴇ ɪɴ ᴀ ɢʀᴏᴜᴘ ᴏʀ ᴅᴍ, ᴛʜᴇ ʙᴏᴛ ᴡɪʟʟ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ᴄᴀᴛᴄʜ ɪᴛ ᴀɴᴅ ғᴏʀᴡᴀʀᴅ ɪᴛ ᴛᴏ ʏᴏᴜ.

ɴᴏ ᴄᴏᴍᴍᴀɴᴅs ᴏʀ ᴛʀɪɢɢᴇʀ ᴡᴏʀᴅs ʀᴇǫᴜɪʀᴇᴅ! 

© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɪᴅ ʜᴜssᴀɪɴ`;

            // Send the instructions
            await sock.sendMessage(m.from, { 
                text: instructions 
            }, { quoted: m });

        } catch (err) {
            console.error('❌ Antidelete plugin error:', err);
        }
    },
};