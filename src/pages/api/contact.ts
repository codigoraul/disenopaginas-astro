import type { APIRoute } from 'astro';
import { config } from 'dotenv';

config();

export const post: APIRoute = async ({ request }) => {
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString() || '';
    const fono = formData.get('fono')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const presupuesto = formData.get('presupuesto')?.toString() || '';
    const mensaje = formData.get('mensaje')?.toString() || '';

    if (!nombre || !fono || !email || !presupuesto || !mensaje) {
        return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return new Response(JSON.stringify({ error: 'El email no es válido.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const emailContent = `
        Nuevo mensaje desde el formulario de contacto:
        
        Nombre: ${nombre}
        Teléfono: ${fono}
        Email: ${email}
        Plan Seleccionado: ${presupuesto}
        Mensaje: ${mensaje}
    `;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Formulario Web <onboarding@resend.dev>',
                to: 'codigoraul@gmail.com',
                subject: 'Nuevo Mensaje de Landing - diseñopaginas.cl',
                text: emailContent,
                reply_to: email
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar el correo');
        }

        return new Response(
            JSON.stringify({ success: 'Mensaje enviado correctamente.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return new Response(JSON.stringify({ error: 'Error al enviar el mensaje.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const prerender = false;
