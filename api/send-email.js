import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { type, email, name, restoName } = req.body;
    let subject, html;
    
    if (type === 'welcome') {
      subject = '🎉 Bienvenue sur ProofKit !';
      html = '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color: #ff6b00;">Bienvenue sur ProofKit, ' + name + ' ! 👋</h1><p>Votre espace <strong>' + restoName + '</strong> est prêt.</p><p>Vous bénéficiez de <strong>7 jours gratuits</strong> pour tester toutes les fonctionnalités.</p><a href="https://proofkit.fr" style="display:inline-block;background:#ff6b00;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">Accéder à mon espace →</a><p style="margin-top:32px;color:#999;font-size:13px;">Résiliation possible à tout moment · Sans engagement</p></div>';
    }
    
    const { data, error } = await resend.emails.send({
      from: 'ProofKit <hello@proofkit.fr>',
      to: email,
      subject,
      html,
    });
    
    if (error) return res.status(400).json({ error });
    res.status(200).json({ success: true, data });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}