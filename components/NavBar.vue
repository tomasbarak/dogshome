<script setup lang="ts">
    
</script>

<template>
    <div class="navbar bg-primary h-[60px] pt-[10px] pb-[10px] pr-[8px] pl-[8px] min-h-[60px]">
        <div class="navbar-start">
            <img src="/images/DogsHomeLogo-ReDesign (White&Final).png" class="w-[40px] h-[40px]" alt="">
            <a href="" class="link-neutral"></a>
        </div>
        <div class="navbar-center h-full">
            <div class="flex p-0 m-0 h-full w-[100vw] max-w-[400px] rounded-[2px] bg-neutral ">
                <div class="flex justify-center items-center w-[44px] group cursor-pointer">
                    <Icon color="#d3d3d3" name="ic:outline-tune" class="w-[24px] h-[24px] transition ease-out group-hover:!text-primary transition ease-in"></Icon>
                </div>
                <div class="divider divider-horizontal m-0 mb-[5px] mt-[5px] w-[1px]"></div>
                <input placeholder="Buscar en DogsHome..." type="text" class="input w-full p-0 h-full rounded-none focus:outline-none pr-[10px] pl-[10px]">
                <div class="divider divider-horizontal m-0 mb-[5px] mt-[5px] w-[1px]"></div>
                <div class="flex justify-center items-center w-[44px] cursor-pointer group">
                    <Icon color="#d3d3d3" name="ic:outline-search" class="w-[24px] h-[24px] transition ease-out group-hover:!text-primary transition ease-in"></Icon>
                </div>
            </div>
        </div>
        <div class="navbar-end">
            <div class="avatar">
                <div class="w-[40px] h-[40px] rounded-full">
                    <img src="/images/default-private-user-image.png" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        props: {
            userName: {
                type: String,
            },
            userSurname: {
                type: String,
            },
            userPhotoURL: {
                type: String,
            },
            userAccountType: {
                type: String,
            },
        }
    }
</script>

<style scoped>
</style>