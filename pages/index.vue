<script setup lang="ts">
    const isAuth = useState('isAuth')
    const user = useState('user')
    console.log(isAuth.value, toRaw(user.value))

</script>

<template>
    <NavBar />
    <h1>{{ isAuth }}</h1>
</template>