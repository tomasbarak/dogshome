<script setup lang="ts">
    const { sendVerificationEmail } = useSendVerificationEmail()

    const isAuth = useState('isAuth')

    if (!isAuth.value) {
        navigateTo('/login')
    }

    const user = useState('user') 

    console.log(toRaw(user.value!))

    const handleSendVerificationEmail = async () => {
            await sendVerificationEmail()
    }
</script>

<template>
    <div>
        <h1>Verification</h1>
        <button @click="handleSendVerificationEmail">Send Verification Email</button>
    </div>
</template>

<style scoped>

</style>