<template>
    <div class="mainPage" id="app">
        <div>
            <router-view/>
        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
    @Component({
        components: {}
    })
    export default class App extends Vue {

    }
</script>

<style scoped>

</style>
