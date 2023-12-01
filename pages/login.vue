<script setup lang="ts">
    const { user, loginUser } = useFirebaseAuth()
    const userZ = useState('user')

    const credentials = reactive({
        email: '',
        password: ''
    })

    const handleLogin = async () => {
        console.log(credentials.email, credentials.password)
        const loginSuccessful = await loginUser(credentials.email, credentials.password)
        console.log("login successful: ", loginSuccessful)
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
    <div class="flex flex-row h-full items-center justify-start">

        <img src="/images/DogsHomeLogo-ReDesign%20(White&Final).png" alt="DogsHome logo" id="logo" class="absolute w-[50px] h-[50px] top-[15px] left-[15px]">
        
        <svg class="max-h-screen h-full w-[400px]" viewBox="0 0 320 1440" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <g id="Layer_1">
                <title>Layer 1</title>
                <g id="svg_1" transform="rotate(90, 159.909, 719.709)">
                <path id="svg_2" fill="#079292" d="m-560.09116,650.12319l80,25.42733c80,25.90484 240,76.04324 400,57.30103c160,-19.45847 320,-107.79756 480,-146.35638c160,-37.84255 320,-25.90484 400,-19.10034l80,6.32699l0,305.60548l-80,0c-80,0 -240,0 -400,0c-160,0 -320,0 -480,0c-160,0 -320,0 -400,0l-80,0l0,-229.20411z"></path>
            </g>
            </g>
        </svg>

        <div id="login-container" class="w-full max-w-full flex flex-col relative h-fit items-center justify-center">
            <h1 class="font-['lato'] font-extrabold text-[24pt] text-[#333] max-w-[350px] w-[50vw] mb-[15px]">Iniciá sesión</h1>

            <div class="mb-[15px] mt-[10px]">
                <div class="label p-0 w-full max-w-[350px]">
                    <span class="text-[12pt] p-0 text-left text-black">E-mail:</span>
                </div>
    
                <AuthInput placeholder="E-mail" type="email" v-model="credentials.email" />
            </div>
            

            <div class="mb-[15px] mt-[10px]">
                <div class="label p-0 w-full max-w-[350px]">
                    <span class="text-[12pt] p-0 text-left text-black">Contraseña:</span>
                </div>
    
                <AuthInput placeholder="Contraseña" type="password" v-model="credentials.password" />
            </div>

            <div class="mb-[15px] mt-[15px] flex flex-row items-center justify-between w-[50vw] max-w-[350px]">
                <a class="text-[1em] text-center text-primary mr-[15px] underline" href="/register">¿No tenes cuenta? Registrate</a>
                <button class="h-[50px] w-[100px] border-0 bg-primary rounded-[5px] text-[#fff] flex items-center justify-center text-[10pt] mb-[8px] text-center" @click="handleLogin">Iniciar sesión</button>
            </div>
            
            <a href="/" class="relative h-[50px] text-black/[0.45] text-[10pt] flex flex-col justify-center">Continuar de forma anónima</a>
        </div>

        <a class="absolute bottom-[15px] right-[15px] font-['libel-suit-rg'] w-auto text-center text-primary text-[24px]">DogsHome</a>
    </div>
</template>