import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from "firebase/auth";

export default function() {
    const { $auth } = useNuxtApp();

    const user = useState<User | null>("fb_user", () => null);

    const registerUser = async (email: string, password: string): Promise<boolean> => {
        try {
            const userCreds = await createUserWithEmailAndPassword($auth, email, password);
            if ( userCreds ) {
                user.value = userCreds.user;
                return true;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
        return false;
    }

    const loginUser = async (email: string, password: string): Promise<any> => {
        try {
            const userCreds = await signInWithEmailAndPassword($auth, email, password);
            if ( userCreds ) {
                user.value = userCreds.user;
                return {success: true, user: userCreds.user};
            }
        } catch (error) {
            console.log(error);
            return {success: false, error: error};
        }
        return {success: false, error: "Unknown error"};
    }

    return {
        user,
        registerUser,
        loginUser
    }
}