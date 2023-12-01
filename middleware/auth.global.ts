export default defineNuxtRouteMiddleware(async (to, from) => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0"

    const ignoreRoutes = [
        '/profile/image', '/profile/image/'
    ]

    if(ignoreRoutes.includes(to.path)) return
    if(process.client) return



    const currentHostName =  useNuxtApp().ssrContext?.event.node.req.headers.host
    const sessionCookie = useCookie('session');

    if(!sessionCookie.value) return;

    let authRes = null
    let profileRes = null

    try {
        authRes = await useFetch('/api/checkauthstatus',{
            method: 'POST',
            body: JSON.stringify({sessionCookie: sessionCookie.value})
        })

        profileRes = await fetch(`https://api.${currentHostName}/user/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `${sessionCookie.value}`
            }
        })
    } catch (e) {
        console.log('error', e)
    }
    
    const authData = authRes!.data.value
    const profileData = profileRes?.json()

    useState('user', () => null)

    
    if(authData?.statusCode === 200){
        const claim: any = authData?.claim
        
        if(!claim.email_verified && to.path !== '/verification'){
            return navigateTo('/verification')
        }

        if(claim.email_verified && to.path === '/verification'){
            return navigateTo('/')
        }

        const isAuth = useState('isAuth');
        isAuth.value = true;
        const user = useState('user');
        user.value = authData?.claim;
    } else {
        const isAuth = useState('isAuth');
        isAuth.value = false;
        const user = useState('user');
        user.value = null;
    }
})