import { getAuth } from "firebase-admin/auth";
import useFirebaseAdmin from "~/composables/useFirebaseAdmin";

export default defineEventHandler( async ( event ) => {
    const { sessionCookie } = await readBody(event);
    const app = useFirebaseAdmin();

    try {
        const claim = await getAuth(app).verifySessionCookie(sessionCookie);
        
        return {statusCode: 200, claim: claim}

    } catch (error) {
        console.log(error);
        return {
            statusCode: 401,
            claim: null
        }
    }
})