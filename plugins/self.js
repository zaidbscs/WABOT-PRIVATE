let selfMode = process.env.SELF_MODE === 'true';

module.exports = {
    name: 'self',
    aliases: ['selfmode'],
    
    async execute(sock, m, args) {
        try {
            await m.react('⚙️');
            
            if (!global.owners.includes(m.sender)) {
                return m.reply('❌ Owner only.');
            }
            
            if (args[0] === 'on') {
                selfMode = true;
                m.reply('Self mode ON');
            } 
            else if (args[0] === 'off') {
                selfMode = false;
                m.reply('Self mode OFF');
            }
            else {
                m.reply(`Self mode: ${selfMode ? 'ON' : 'OFF'}`);
            }
        } catch (err) {
            console.error('❌ Self mode error:', err);
        }
    },
    
    async onMessage(sock, m) {
        if (!selfMode) return false;
        
        let botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        if (global.owners.includes(m.sender) || m.sender === botNumber) return false;
        
        if (m.body && m.body.startsWith(global.BOT_PREFIX)) {
            return true; // Blocks the command
        }
        
        return false;
    }
};