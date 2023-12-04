<script setup lang="ts">
    const userZ = useState('user')
    const authMethod = useState('authMethod')

    //Set auth method to login by default
    authMethod.value = 'register'
</script>

<style scoped>

    * {
        line-height: normal;
    }
    .auth-hidden {
        visibility: hidden;
    }

    .auth-shown {
        visibility: visible;
    }

</style>

<template>

    <Head>
        <Title v-if="useState('authMethod').value === 'login'">Iniciar sesión</Title>
        <Title v-else>Crear cuenta</Title>
        <Link rel="icon" href="/images/DogsHomeLogo-ReDesign (Colorified&Final).png"></Link>
    </Head>

    <div class="flex flex-row h-full items-center justify-start">

        <img src="/images/DogsHomeLogo-ReDesign%20(White&Final).png" alt="DogsHome logo" id="logo" class="md:visible invisible absolute w-[50px] h-[50px] top-[15px] left-[15px]">
        <img src="/images/DogsHomeLogo-ReDesign%20(Colorified&Final).png" alt="DogsHome logo" id="logo" class="visible md:invisible absolute w-[50px] h-[50px] top-[15px] right-[15px]">
        
        <svg class="max-h-screen h-screen w-[50px] md:w-[400px]" viewBox="0 0 320 1440" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Layer_1">
                <title>Layer 1</title>
                <g id="svg_1" transform="rotate(90, 159.909, 719.709)">
                <path id="svg_2" fill="#079292" d="m-560.09116,650.12319l80,25.42733c80,25.90484 240,76.04324 400,57.30103c160,-19.45847 320,-107.79756 480,-146.35638c160,-37.84255 320,-25.90484 400,-19.10034l80,6.32699l0,305.60548l-80,0c-80,0 -240,0 -400,0c-160,0 -320,0 -480,0c-160,0 -320,0 -400,0l-80,0l0,-229.20411z"></path>
            </g>
            </g>
        </svg>

        <LoginForm v-if="useState('authMethod').value === 'login'" />
        <RegisterForm v-else />

        <a class="absolute bottom-[15px] right-[15px] font-['libel-suit-rg'] w-auto text-center text-primary text-[24px]">DogsHome</a>
    </div>
</template>