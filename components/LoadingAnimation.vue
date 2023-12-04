<script setup>

    onMounted( async () => {
        const animationElement = document.querySelector("#animationElement")

        const animation = useLottie(
            animationElement,
            '/animations/dog-walking.json'
        )

        animation.init()
    })

</script>

<template>
    <div class="flex items-center justify-center w-full h-full bg-white">
        <span id="animationElement" class="w-[150px] h-[150px] md:w-[200px] md:h-[200px]"></span>
    </div>
</template>