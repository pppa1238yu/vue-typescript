<template>
    <div class="mainPage" id="app">
        <div class="avergeBPM">
            <div class="pointer" :style="{left:leftRate}">
                <span class="number">{{pointer}}</span>
                <div class="kedu">
                    <img src="img/arrow.png" class="arrow" style="width: .09rem;"/>
                </div>
            </div>
            <img src="img/kedu.png">
        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
    import {Prop} from "vue-property-decorator";
    @Component({
    })
    export default class PointerBar extends Vue {
        @Prop()
        pointer:any;
        leftRate:string = '0%';
        updated(){
            if (this.pointer <= 50) {
                this.leftRate = this.pointer / 50 * (95 / 542 * 100) - 2  + '%';
            } else if (this.pointer > 50 && this.pointer <= 60) {
                this.leftRate = (this.pointer - 50) / 10 * (74 / 542 * 100) + (95 / 542 * 100) - 1.9 + '%';
            } else if(this.pointer > 60 && this.pointer <= 100){
                this.leftRate = (this.pointer - 60) / 40 * (207 / 542 * 100) + (169 / 542 * 100) - 2.9 + '%';
            }else if(this.pointer > 100 && this.pointer <= 120){
                this.leftRate = (this.pointer - 100) / 20 * (75 / 542 * 100) + (376 / 542 * 100) - 3.9 + '%';
            }else {
                this.leftRate = (this.pointer - 120) / 40 * (94 / 542 * 100) + (444 / 542 * 100) - 2.3 + '%';
            }
            if(parseFloat(this.leftRate) > 100){
                this.leftRate = 93 + '%';
            }
            if(parseFloat(this.leftRate) < 0){
                this.leftRate = 0 + '%';
            }
        }
    }
</script>

<style scoped>
    .avergeBPM{
        margin: .3rem 0;
    }
</style>
