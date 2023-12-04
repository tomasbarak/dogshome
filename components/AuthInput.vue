<script setup lang="ts">
    const props = defineProps({
        modelValue: String,
        placeholder: String,
        type: String
    })

    const emit = defineEmits(['update:modelValue'])

    const handleInput = (event: any) => {
        emit('update:modelValue', event.target.value)
    }

    const inputElement = ref<HTMLInputElement>()

    onMounted( async () => {
        emit('update:modelValue', inputElement!.value?.value)
    })
    
</script>
<template>
    <input
        ref="inputElement"
        :value="modelValue"
        @input="handleInput"
        :type="type"
        :placeholder="placeholder"
        class="max-w-[350px] w-[75vw] md:w-[50vw] h-[50px] input border-transparent border-b-[#d3d3d3] border-b-1 rounded-none focus:outline-none focus:border-b-[#079292] transition-colors p-0 text-left text-[10pt]"/>
</template>