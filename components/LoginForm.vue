<script setup lang="ts">
    const { user, loginUser } = useFirebaseAuth()
    const { swalAuthError } = useSwal() 
    const credentials = reactive({
        email: '',
        password: ''
    })

    const showLoading = (show: boolean) => {
        const loadingElem = document.querySelector('#loading')
        if(show) {
            loadingElem!.classList.remove('loading-hidden')
            loadingElem!.classList.add('loading-shown')
        } else {
            loadingElem!.classList.remove('loading-shown')
            loadingElem!.classList.add('loading-hidden')
        }
    } 

    const handleLogin = async () => {
        showLoading(true)

        const loginSuccessful = await loginUser(credentials.email, credentials.password)
        console.log("login successful: ", loginSuccessful)

        if(loginSuccessful.success == false) {
            const errorCode: string = loginSuccessful.error.code || 'unknown'
            const errorMsg: string = errorCode == 'auth/invalid-email' ? 'El correo no es válido' : errorCode == "auth/missing-password" ? "Ingrese una contraseña" : errorCode == 'auth/user-not-found' ? 'El correo o la contraseña son incorrectos' : errorCode == 'auth/wrong-password' ? 'El correo o la contraseña son incorrectos' : 'Ha ocurrido un error'
            showLoading(false)
            swalAuthError(errorMsg)
            return
        }

        const idToken = await user.value?.getIdToken();
        const {data: responseData} = await useFetch(`https://api.${window.location.hostname}/auth/login`, {
            method: 'POST',
            body: {
                idToken: idToken,
                subscription: null
            },
            credentials: 'include',
            
        })
        
        //Redirect to home page
        window.location.href = '/'
    }
</script>

<style scoped>

    * {
        line-height: normal;
    }
    .loading-hidden {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.25s, opacity 0.5s linear;
    }

    .loading-shown {
        visibility: visible;
        opacity: 1;
        transition: visibility 0.25s, opacity 0.5s linear;
    }

</style>

<template>
    <div id="login-container" class="w-full max-w-full flex flex-col relative h-fit items-center justify-center p-[15px] box-border">
            <LoadingAnimation id="loading" class="loading-hidden absolute z-1" />

            <h1 class="font-['lato'] font-extrabold text-[24pt] text-[#333] max-w-[350px] w-[75vw] md:w-[50vw] mb-[15px]">Iniciá sesión</h1>

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

            <div class="mb-[15px] mt-[15px] flex flex-row items-center justify-between w-[75w] md:w-[50vw] max-w-[350px]">
                <a class="cursor-pointer text-[1em] text-center text-primary mr-[15px] underline" @click="useState('authMethod').value = 'register'">¿No tenés cuenta? Registráte</a>
                <button class="h-[50px] w-[100px] border-0 bg-primary rounded-[5px] text-[#fff] flex items-center justify-center text-[10pt] mb-[8px] text-center" @click="handleLogin">Iniciar sesión</button>
            </div>
            
            <a href="/" class="h-[50px] text-black/[0.45] text-[10pt] flex flex-col justify-center">Continuar de forma anónima</a>
        </div>
</template>