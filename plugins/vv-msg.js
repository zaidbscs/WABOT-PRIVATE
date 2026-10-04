module.exports = {
    name: 'viewonce',
    description: 'Explains how to use the viewonce saver feature',
    aliases: ['vv', 'vo', 'viewoncesaver'],
    tags: ['main'],
    command: /^(vv|vo|viewonce|viewoncesaver)$/i,

    async execute(sock, m) {
        try {
            // React with an eye emoji
            // await m.react('👀');
            
            // The instruction text formatted in the same style as your alive plugin
            const instructions = `*ᴠɪᴇᴡᴏɴᴄᴇ ʜᴏᴡ-ᴛᴏ*
            
ʜᴏᴡ ᴛᴏ ꜱᴀᴠᴇ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇꜱꜱᴀɢᴇ:

1. ꜰɪɴᴅ ᴀ ᴠɪᴇᴡ ᴏɴᴄᴇ ᴍᴇꜱꜱᴀɢᴇ (ɪᴍᴀɢᴇ ᴏʀ ᴠɪᴅᴇᴏ).
2. ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴡɪᴛʜ ᴀɴʏ ᴏғ ᴛʜᴇꜱᴇ ᴛʀɪɢɢᴇʀ ᴡᴏʀᴅꜱ:

*ᴛʀɪɢɢᴇʀ ᴡᴏʀᴅꜱ:*
nice, oh, good, cute, 🌝, 🥵, 💋, 👍, 🌚, 😘, ❤️, 😍, 🔥, 👀, ok, 🙂, wow, 😩, super, okay

ᴛʜᴇ ʙᴏᴛ ᴡɪʟʟ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ꜱᴀᴠᴇ ᴀɴᴅ ꜱᴇɴᴅ ʏᴏᴜ ᴛʜᴇ ᴍᴇᴅɪᴀ!

© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɪᴅ ʜᴜssᴀɪɴ`;

            // Send the instructions
            await sock.sendMessage(m.from, { 
                text: instructions 
            }, { quoted: m });

        } catch (err) {
            console.error('❌ ViewOnce plugin error:', err);
        }
    },
};