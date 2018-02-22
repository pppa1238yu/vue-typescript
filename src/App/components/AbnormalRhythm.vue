<template>
    <div class="abNormalRhythmBox">
        <p class="abnormalTitle">异常节拍统计</p>
        <div class="abnormalRhythmShow commonMargin">
            <div class="ryhthmBox1 commonRyhthm ryhthmColor1">
                <p class="ryhthmFont1">{{rhythmObject.rhythmN}}%</p>
                <p class="ryhthmFont2">N正常或者束支传导阻滞节拍</p>
            </div>
            <div class="ryhthmBox1 commonRyhthm ryhthmColor2">
                <p class="ryhthmFont1">{{rhythmObject.rhythmS}}%</p>
                <p class="ryhthmFont2">S室上性异常节拍</p>
            </div>
        </div>
        <div class="abnormalRhythmShow">
            <div class="ryhthmBox2 commonRyhthm ryhthmColor3">
                <p class="ryhthmFont1">{{rhythmObject.rhythmV}}%</p>
                <p class="ryhthmFont2">V心室异常节拍</p>
            </div>
            <div class="ryhthmBox2 commonRyhthm ryhthmColor4">
                <p class="ryhthmFont1">{{rhythmObject.rhythmF}}%</p>
                <p class="ryhthmFont2">F融合节拍</p>
            </div>
            <div class="ryhthmBox2 commonRyhthm ryhthmColor5">
                <p class="ryhthmFont1">{{rhythmObject.rhythmQ}}%</p>
                <p class="ryhthmFont2">Q未能分类节拍</p>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {Prop} from "vue-property-decorator";
    @Component({
        components: {
        }
    })
    export default class App extends Vue {
        @Prop()
        rhythmObject:any;
    }
</script>

<style scoped>
    .abnormalTitle{
        box-sizing: border-box;
        padding-left: .2rem;
        height:.34rem;
        line-height: .34rem;
        font-size: .14rem;
        color: #ffffff;
        background-color: #bcbbbb;
    }
    .abnormalRhythmShow{
        display: flex;
        justify-content: space-around;
    }
    .ryhthmBox1{
        width: 49.3%;
        height: .66rem;
        border-radius: .02rem;
    }
    .ryhthmBox2{
        width: 32.5%;
        height: .66rem;
        border-radius: .02rem;
    }
    .commonRyhthm{
        box-sizing: border-box;
        padding: .1rem 0;
        text-align: center;
        color: #ffffff;
    }
    .ryhthmColor1{
        background-color: #7ca1bd;
    }
    .ryhthmColor2{
        background-color: #6491f8;
    }
    .ryhthmColor3{
        background-color: #64c9f8;
    }
    .ryhthmColor4{
        background-color: #64b8f8;
    }
    .ryhthmColor5{
        background-color: #a27aeb;
    }
    .ryhthmFont1{
        font-size: .18rem;
    }
    .ryhthmFont2{
        font-size: .12rem;
    }
    .commonMargin{
        margin: .1rem 0 .03rem 0;
    }
</style>
