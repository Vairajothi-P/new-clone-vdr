import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

const resend = new Resend(resendApiKey || 're_default_api_key_placeholder');

export default resend;
export { resend };
