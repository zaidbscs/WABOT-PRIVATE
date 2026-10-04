const os = require("os");

module.exports = {
    name: 'menu',
    description: 'Show the bot command menu',
    aliases: ['help', 'commands'],
    tags: ['main'],
    command: /^(menu|help|commands)$/i,

    async execute(sock, m) {
        try {
            // React with the menu emoji
            await m.react('💯');
            
            // Force Pakistan Timezone (Islamabad)
            const pkTimezone = 'Asia/Karachi';
            const now = new Date();
            
            // Date without the day name (e.g., 27 September 2026)
            const dateStr = now.toLocaleDateString('en-GB', { 
                timeZone: pkTimezone,
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
            
            // Time in 12-hour format (e.g., 02:30:45 PM)
            const timeStr = now.toLocaleTimeString('en-US', { 
                timeZone: pkTimezone,
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            });

            // Bot uptime calculation
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

            // RAM Usage calculation
            const heapUsedGB = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2);
            const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

            // New Menu Image URL
            const menuImage = { url: "https://i.ibb.co/YBgkwj6X/wabot-menu.png" };

            // Fancy styled menu text with ONLY the requested commands
            const menuText = `╭────《 *ᴡᴀʙᴏᴛ ᴍᴇɴᴜ* 》──⊷
│ Prefix: .    
│ Mode: Private (Owner Only)       
│ Date: ${dateStr}
│ Time: ${timeStr}
│ Uptime: ${uptimeStr}
│ RAM Usage: ${heapUsedGB}GB / ${totalMemGB}GB
╰══════════════════⊷
╭────❏ *sʏsᴛᴇᴍ* ❏
│ .ᴀʟɪᴠᴇ
│ .ᴘɪɴɢ
│ .ᴜᴘᴛɪᴍᴇ
╰━━━━━━━━━━━━━━──⊷
╭────❏ *ᴀᴜᴛᴏ* ❏
│ .ᴀɴᴛɪᴅᴇʟᴇᴛᴇ
│ .ᴠɪᴇᴡᴏɴᴄᴇ 
╰━━━━━━━━━━━━━━──⊷
© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢᴀɪᴅ ʜᴜssᴀɪɴ`;

            // Send the message with the image and formatted caption
            await sock.sendMessage(m.from, { 
                image: menuImage,
                caption: menuText 
            }, { quoted: m });

        } catch (err) {
            console.error('❌ Menu plugin error:', err);
            await m.reply('❌ Error loading menu.');
        }
    }
};