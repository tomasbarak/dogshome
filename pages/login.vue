<script setup lang="ts">
    const { user, loginUser } = useFirebaseAuth()
    const userZ = useState('user')

    const credentials = reactive({
        email: '',
        password: ''
    })

    const handleLogin = async () => {
        await loginUser(credentials.email, credentials.password)
        const idToken = await user.value?.getIdToken();
        const {data: responseData} = await useFetch(`https://api.${window.location.hostname}/auth/login`, {
            method: 'POST',
            body: {
                idToken: idToken,
                subscription: null
            },
            credentials: 'include',
            
        })
        console.log(responseData)
    }
</script>

<template>
    <div>
        <h1>Login</h1>
        <input type="email" v-model="credentials.email" />
        <input type="password" v-model="credentials.password" />
        <button @click="handleLogin">Login</button>
    </div>
</template>