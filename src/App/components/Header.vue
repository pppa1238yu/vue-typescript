<template>
    <div class="header">
        <div>
            <p class="centerText headTitle"><img src="img/head.png" style="width: .22rem"/><span class="verticalText">{{userInfo.name}}</span></p>
        </div>
        <p><span class="leftText">记录日期:{{userInfo.time}}</span><span class="rightText">{{userInfo.sex}}-{{userInfo.age}}岁</span></p>
        <br>
        <p><span class="leftText">记录时长:{{userInfo.useTime}}</span></p>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
    import {Prop} from "vue-property-decorator";
    @Component({
        components: {
        }
    })
    export default class Header extends Vue {
        @Prop()
        userInfo:any;
    }
</script>

<style scoped>
    .header{
        background-color: #61adee;
        width: 100%;
        height: 1.2rem;
        box-sizing: border-box;
        padding: .15rem;
        color: #ffffff;
    }
    .centerText{
        text-align: center;
    }
    .headTitle{
        font-size: .24rem;
        margin-bottom: .16rem;
    }
    .leftText{
        float: left;
        font-size: .14rem;
    }
    .rightText{
        float: right;
        font-size: .14rem;
    }
    .verticalText{
        vertical-align: .03rem;
        margin-left: .05rem;
    }
</style>
