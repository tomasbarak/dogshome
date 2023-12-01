import { getAuth } from "firebase-admin/auth";
import useFirebaseAdmin from "~/composables/useFirebaseAdmin";

import { createTransport } from "nodemailer";
import { renderFile } from "ejs";

import { promisify } from "util"

export default defineEventHandler( async ( event ) => {
    const cookies = parseCookies(event);
    const sessionCookie = cookies?.session;
    const app = useFirebaseAdmin();
    try {
        const claim = await getAuth(app).verifySessionCookie(sessionCookie);
        const email = claim.email;
        const emailVerificationLink = await getAuth(app).generateEmailVerificationLink(email!);
        const sendVerificationEmailResult = await sendVerificationEmail(email!, emailVerificationLink);

        if ( sendVerificationEmailResult.success ) {
            return {statusCode: 200, claim: claim}
        } else {
            return {statusCode: 500, claim: null}
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 401,
            claim: null
        }
    }
})

async function sendVerificationEmail(email: string, verificationLink: string): Promise<{success: boolean, error?: any, info?: any}> {
    const transporter = createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.verificationEmail,
            pass: process.env.verificationPass
        }
    });
    const rootDir = process.cwd()
    const mailBody = await renderFile(`${rootDir}/assets/templates/mail/verification.ejs`, { link: verificationLink }, { async: true })
    const priority: "high" | "normal" | "low" = "high";
    const mailOptions = {
        from: process.env.verificationEmail,
        to: email,
        subject: 'Verificación de correo',
        html: mailBody,
        priority: priority
    };

    try {
        const info = await promisify(transporter.sendMail.bind(transporter))(mailOptions)
        return { success: true, info: info }
    } catch (error) {
        return { success: false, error: error }
    }
}