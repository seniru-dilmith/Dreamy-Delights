const { exec } = require('child_process');

console.log('🔍 Monitoring Firebase Functions logs in real-time...');
console.log('📋 Now go to your admin dashboard and reply to a message!');
console.log('📡 Watching for email activity...\n');

let isMonitoring = true;
let lastLogTime = Date.now();

function checkLogs() {
    if (!isMonitoring) return;
    
    exec('firebase functions:log --only api --limit 10', { cwd: './functions' }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error checking logs:', error.message);
            return;
        }
        
        // Look for recent activity
        const lines = stdout.split('\n');
        const recentLines = lines.filter(line => {
            if (line.includes('🔍 Email service check:') || 
                line.includes('EmailService available:') ||
                line.includes('finalReplyText') ||
                line.includes('Sending email to:') ||
                line.includes('Reply email sent') ||
                line.includes('Email service not available') ||
                line.includes('Failed to send email') ||
                line.includes('Reply endpoint called')) {
                return true;
            }
            return false;
        });
        
        if (recentLines.length > 0) {
            console.log('📨 EMAIL ACTIVITY DETECTED:');
            console.log('==========================');
            recentLines.forEach(line => console.log(line));
            console.log('==========================\n');
        }
    });
    
    // Check again in 2 seconds
    setTimeout(checkLogs, 2000);
}

// Start monitoring
checkLogs();

// Stop after 5 minutes
setTimeout(() => {
    isMonitoring = false;
    console.log('⏰ Monitoring stopped after 5 minutes');
    process.exit(0);
}, 5 * 60 * 1000);
