import useFirebaseAdmin from "~/composables/useFirebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export default defineEventHandler( async ( event ) => {
    const app = useFirebaseAdmin();
    const body = await readBody(event);
    const idToken = body.idToken;

    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const sessionCookie = await getAuth().createSessionCookie(idToken, {expiresIn});
        const options = {maxAge: expiresIn, httpOnly: true};

    } catch (error) {
        console.log(error);
    }
})