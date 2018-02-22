<template>
    <div class="suggestionflexBox">
        <div class="suggestionBox">
            <div class="suggestionResult">{{description.title || '-'}}</div>
            <div class="suggestionResultBox">{{description.notes || '-'}}</div>
        </div>
        <div class="suggestionBox suggestionMgt">
            <div class="mainSuggestion">建议</div>
            <div class="suggestionResultBox mainSuggestionBox">{{description.suggestion || '-'}}</div>
        </div>
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
    export default class Suggestion extends Vue {
        @Prop()
        description:any;
    }
</script>

<style scoped>
    .suggestionflexBox{
        display: flex;
        justify-content: space-between;
        overflow: hidden;
    }
    .suggestionBox{
        width: 49.5%;
        border-radius: .04rem;
        overflow: hidden;
    }
    .suggestionResult{
        height: .36rem;
        background-color: #61adee;
        line-height: .36rem;
        text-align: center;
        color: #ffffff;
        font-size: .14rem;
    }
    .suggestionResultBox{
        box-sizing: border-box;
        padding: .2rem .1rem;
        height: 1.3rem;
        line-height: .2rem;
        overflow: hidden;
        border-radius: .03rem;
        background-color: #e8e8e8;
        font-size: .13rem;
        color: #676767;
    }
    .suggestionMgt{
        margin-top: .01rem;
    }
    .mainSuggestion{
        height: .36rem;
        background-color: #7897b2;
        line-height: .36rem;
        text-align: center;
        color: #ffffff;
        font-size: .14rem;
    }
</style>
