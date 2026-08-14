import { NextResponse } from 'next/server';
import os from 'os';

export async function GET(req) {
    let clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // Check if the client is connecting via loopback/localhost
    const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1' || clientIp.includes('localhost');
    if (isLoopback) {
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    clientIp = net.address;
                    break;
                }
            }
            if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(clientIp) && !clientIp.includes('localhost')) {
                break;
            }
        }
    }

    // Clean up
    if (clientIp.startsWith('::ffff:')) clientIp = clientIp.replace('::ffff:', '');
    clientIp = clientIp.replace(/:\d+$/, '');

    return NextResponse.json({ ip: clientIp });
}
