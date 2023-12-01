<script setup lang="ts">
    const { user, registerUser, loginUser } = useFirebaseAuth()

    const credentials = reactive({
        email: '',
        password: ''
    })

    const handleRegister = async () => {
        await registerUser(credentials.email, credentials.password)
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
        <button @click="handleRegister">Register</button>
    </div>
</template>