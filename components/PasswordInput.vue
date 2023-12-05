<script setup lang="ts">
    const props = defineProps({
        modelValue: String,
        placeholder: String,
        type: String
    })

    const passwordShowState = useState('passwordShowState', ()=>{return false})

    const emit = defineEmits(['update:modelValue'])

    const handleInput = (event: any) => {
        emit('update:modelValue', event.target.value)
    }

    const inputElement = ref<HTMLInputElement>()
    const togglePassword = ref<HTMLElement>()

    onMounted( async () => {
        emit('update:modelValue', inputElement!.value?.value)

        //Get first child of togglePassword
        const eyeOpenIcon = togglePassword!.value?.firstElementChild
        //Get second child of togglePassword
        const eyeClosedIcon = togglePassword!.value?.lastElementChild

        console.log(eyeOpenIcon!)

        togglePassword!.value?.addEventListener('click', () => {
            if (useState('passwordShowState').value) {
                inputElement!.value?.setAttribute('type', 'password')
                passwordShowState.value = false
            } else {
                inputElement!.value?.setAttribute('type', 'text')
                passwordShowState.value = true
            }
        })
    })
    
</script>
<template>
    <div class="relative max-w-[350px] w-[75vw] md:w-[50vw] border-transparent border-b-[#d3d3d3] border-b flex flex-row items-center focus-within:border-b-[#079292] transition-colors">
        <input
            ref="inputElement"
            :value="modelValue"
            @input="handleInput"
            :type="type"
            :placeholder="placeholder"
            class="max-w-[350px] w-[75vw] md:w-[50vw] h-[50px] input border-transparent rounded-none focus:outline-none  p-0 text-left text-[10pt]"/>

            <a class="relative w-[20px] h-[20px] flex flex-row items-center justify-center" ref="togglePassword">
                <EyeClosedIcon v-if="useState('passwordShowState').value" ref="eyeOpenIcon" class="cursor-pointer absolute" />
                <EyeOpenIcon v-else ref="eyeOpenIcon" class="cursor-pointer absolute" />
            </a>
    </div>
</template>

<style scoped>
    .eye-hidden {
        visibility: hidden;
        opacity: 0;
    }

    .eye-shown {
        visibility: visible;
        opacity: 1;
    }
</style>