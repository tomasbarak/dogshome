<script setup lang="ts">
    const { user, loginUser } = useFirebaseAuth()
    const { swalAuthError } = useSwal() 
    const credentials = reactive({
        email: '',
        password: '',
        repeatPassword: ''
    })

    const passwordStrength = reactive({
        strength: 'weak'
    })

    const calculatePasswordStrength = (password: string): 'strong' | 'medium' | 'weak' | 'empty' => {
        const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')

        // STRONG PASSWORD SHOULD HAVE: 1 lowercase, 1 uppercase, 1 number, 1 special character and 8 characters long
        const mediumPassword = new RegExp('((?=.*[a-z])(?=.*[0-9])(?=.{8,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))')

        if (strongPassword.test(password)) {
            return 'strong'
        } else if (mediumPassword.test(password)) {
            return 'medium'
        } else if (password.length > 0) {
            return 'weak'
        } else {
            return 'empty'
        }
    }

    const changePasswordStrength = (strength: 'strong' | 'medium' | 'weak' | 'empty') => {
        const passwordStrengthElem = document.querySelector('#password-strength')
        const passwordStrengthCheck = document.querySelector('#password-strong')
        switch(strength) {
            case 'weak':
                passwordStrengthElem!.classList.remove('medium-pass')
                passwordStrengthElem!.classList.remove('strong-pass')
                passwordStrengthElem!.classList.remove('empty-pass')
                passwordStrengthElem!.classList.add('weak-pass')

                passwordStrengthCheck!.classList.remove('fill-[#ddb333]')
                passwordStrengthCheck!.classList.remove('fill-[#4bb543]')
                passwordStrengthCheck!.classList.add('fill-white')
                break
            case 'medium':
                passwordStrengthElem!.classList.remove('weak-pass')
                passwordStrengthElem!.classList.remove('strong-pass')
                passwordStrengthElem!.classList.remove('empty-pass')
                passwordStrengthElem!.classList.add('medium-pass')

                passwordStrengthCheck!.classList.remove('fill-white')
                passwordStrengthCheck!.classList.remove('fill-[#4bb543]')
                passwordStrengthCheck!.classList.add('fill-[#ddb333]')
                break
            case 'strong':
                passwordStrengthElem!.classList.remove('weak-pass')
                passwordStrengthElem!.classList.remove('medium-pass')
                passwordStrengthElem!.classList.remove('empty-pass')
                passwordStrengthElem!.classList.add('strong-pass')

                passwordStrengthCheck!.classList.remove('fill-white')
                passwordStrengthCheck!.classList.remove('fill-[#ddb333]')
                passwordStrengthCheck!.classList.add('fill-[#4bb543]')
                break
            case 'empty':
                passwordStrengthElem!.classList.remove('weak-pass')
                passwordStrengthElem!.classList.remove('medium-pass')
                passwordStrengthElem!.classList.remove('strong-pass')
                passwordStrengthElem!.classList.add('empty-pass')

                passwordStrengthCheck!.classList.remove('fill-[#ddb333]')
                passwordStrengthCheck!.classList.remove('fill-[#4bb543]')
                passwordStrengthCheck!.classList.add('fill-white')
                break
        }
    }

    const handleRepeatPasswordInput = () => {
        const password = credentials.password
        const repeatPasswordInput: HTMLInputElement | null = document.querySelector('#repeat-password-input')
        const repeatPasswordCheck = document.querySelector('#password-concidence')

        if (passwordStrength.strength == 'empty' || passwordStrength.strength == 'weak'){
            repeatPasswordCheck!.classList.remove('fill-[#4bb543]')
            repeatPasswordCheck!.classList.add('fill-white')
            return
        }

        console.log(passwordStrength.strength)

        const checkColor = passwordStrength.strength == 'strong' ? '#4bb543' : '#ddb333'

        if(password != repeatPasswordInput!.value) {
            repeatPasswordCheck!.classList.remove('fill-[#4bb543]')
            repeatPasswordCheck!.classList.remove('fill-[#ddb333]')
            repeatPasswordCheck!.classList.add('fill-white')
        } else {
            repeatPasswordCheck!.classList.remove('fill-white')
            repeatPasswordCheck!.classList.remove('fill-[#4bb543]')
            repeatPasswordCheck!.classList.remove('fill-[#ddb333]')
            repeatPasswordCheck!.classList.add(`fill-[${checkColor}]`)
        }
    }

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

    const validateRule = (ruleName: string) => {
        const rule = document.querySelector(`#rule-${ruleName}`)
        const textRule = document.querySelector(`#text-rule-${ruleName}`)

        // Set colors to rule
        // rule!.classList.remove('fill-white')
        // rule!.classList.add('fill-[#4bb543]')

        // Set colors to text rule
        textRule!.classList.remove('text-[#d3d3d3]')
        textRule!.classList.add('text-[#4bb543]')
    }

    const invalidateRule = (ruleName: string) => {
        const rule = document.querySelector(`#rule-${ruleName}`)
        const textRule = document.querySelector(`#text-rule-${ruleName}`)

        // Set colors to rule
        // rule!.classList.remove('fill-[#4bb543]')
        // rule!.classList.add('fill-white')

        // Set colors to text rule
        textRule!.classList.remove('text-[#4bb543]')
        textRule!.classList.add('text-[#d3d3d3]')
    }

    const handlePasswordInputTEST = (event: any) => {
        const ruleNames = [
            "eight-chars",
            "upper-lower",
            "one-number",
            "special-char"
        ]

        for (const ruleName of ruleNames) {
            const rule = document.querySelector(`#rule-${ruleName}`)
            const textRule = document.querySelector(`#text-rule-${ruleName}`)

           switch (ruleName) {
                case "eight-chars":
                    const hasEightChars = new RegExp('(?=.{8,})').test(event.target.value)
                    hasEightChars ? validateRule(ruleName) : invalidateRule(ruleName)
                    break;
                case "upper-lower":
                    const hassUpperAndLower = new RegExp('(?=.*[a-z])(?=.*[A-Z])').test(event.target.value)
                    hassUpperAndLower ? validateRule(ruleName) : invalidateRule(ruleName)
                    break;
                case "one-number":
                    const hasOneNumber = new RegExp('(?=.*[0-9])').test(event.target.value)
                    hasOneNumber ? validateRule(ruleName) : invalidateRule(ruleName)
                    break;
                case "special-char":
                    const hasSpecialChar = new RegExp('(?=.*[^A-Za-z0-9])').test(event.target.value)
                    hasSpecialChar ? validateRule(ruleName) : invalidateRule(ruleName)
                    break;
           }
        }

        const inputStrength = calculatePasswordStrength(event.target.value)
        passwordStrength.strength = inputStrength

        const target = event.target

        changePasswordStrength(inputStrength)
        handleRepeatPasswordInput()
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

    .password-strength {
        width: 0;
    }

    .weak-pass {
        width: calc(100%/4)!important;
        height: 5px;
        border-radius: 25px;
        background-color: #d33;
    }

    .medium-pass {
        width: calc(100%/2)!important;
        height: 5px;
        border-radius: 25px;
        background-color: #ddb333;
    }

    .strong-pass {
        width: calc(100%)!important;
        height: 5px;
        border-radius: 25px;
        background-color: #4bb543;
    }

    .empty-pass {
        width: 0!important;
        height: 5px;
        border-radius: 25px;
        background-color: #d3d3d3;
    }

    .rule-item {
        margin-top: 5px;
        margin-bottom: 5px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        transition: all 0.5s;
    }

    .rule-icon {
        transition: all 0.5s;
        margin-left: 5px;
    }
</style>

<template>
    <div id="register-container" class="w-full max-w-full flex flex-col relative h-fit items-center justify-center p-[15px] box-border">
            <LoadingAnimation id="loading" class="loading-hidden absolute z-1" />

            <h1 class="font-['lato'] font-extrabold text-[24pt] text-[#333] max-w-[350px] w-[75vw] md:w-[50vw] mb-[15px]">Registráte</h1>

            <div class="mb-[15px] mt-[10px]">
                <div class="label p-0 w-full max-w-[350px]">
                    <span class="text-[12pt] p-0 text-left text-black">E-mail:</span>
                </div>
    
                <AuthInput placeholder="ejemplo@mail.com" type="email" v-model="credentials.email" />
            </div>
            

            <div class="mb-[15px] mt-[10px]">
                <div class="label p-0 w-full max-w-[350px]">
                    <span class="text-[12pt] p-0 text-left text-black">Contraseña:</span>
                </div>
                
                <PasswordInput  placeholder="Contraseña" type="password" v-model="credentials.password" @input="handlePasswordInputTEST"/>

                <div class="w-[calc(100%+20px)] flex flex-col mt-[25px]">
                    <div class="w-full flex flex-row items-center justify-center">
                        <div id="password-strength-container" class="transition-all duration-500 w-full h-[5px] mt-[5px] mb-[5px] radious-[25px] bg-[#d3d3d3] flex">
                            <div id="password-strength" class="empty-pass transition-all duration-500 flex weak-pass"></div>
                        </div>
                        <CheckIcon id="password-strong" class="fill-white rule-icon"/>
                    </div>
                    <!-- LIST -->
                    <ul class="text-[10pt] font-extrabold text-[#d3d3d3]">
                        <li id="text-rule-eight-chars" class="rule-item">
                            8 Caracteres *
                        </li>
                        <li id="text-rule-upper-lower" class="rule-item">
                            1 Minúscula y 1 mayúscula
                        </li>
                        <li id="text-rule-one-number" class="rule-item">
                            1 Número *
                        </li>
                        <li id="text-rule-special-char" class="rule-item">
                            1 Carácter especial
                        </li>
                    </ul>
                </div>
            
            </div>

            <div class="mb-[15px] mt-[10px]">
                <div class="label p-0 w-full max-w-[350px]">
                    <span class="text-[12pt] p-0 text-left text-black">Repetir contraseña:</span>
                </div>

                <AuthInput v-if="useState('passwordShowState').value" id="repeat-password-input" placeholder="Repetir contraseña" type="text" v-model="credentials.repeatPassword" @input="handleRepeatPasswordInput"/>
                <AuthInput v-else id="repeat-password-input" placeholder="Repetir contraseña" type="password" v-model="credentials.repeatPassword" @input="handleRepeatPasswordInput"/>
            
                <div class="flex flex-row-reverse mt-[5px] w-[calc(100%+20px)]">
                    <CheckIcon id="password-concidence" class="fill-white rule-icon"/>
                </div>
            </div>

            <div class="mb-[15px] mt-[15px] flex flex-row items-center justify-between w-[75w] md:w-[50vw] max-w-[350px]">
                <a class="cursor-pointer text-[1em] text-center text-primary mr-[15px] underline" @click="useState('authMethod').value = 'login'">¿Ya tenés cuenta? Iniciá sesión</a>
                <button class="h-[50px] w-[100px] border-0 bg-primary rounded-[5px] text-[#fff] flex items-center justify-center text-[10pt] mb-[8px] text-center" @click="handleLogin">Siguiente</button>
            </div>
            
            <a href="/" class="h-[50px] text-black/[0.45] text-[10pt] flex flex-col justify-center">Continuar de forma anónima</a>
        </div>
</template>