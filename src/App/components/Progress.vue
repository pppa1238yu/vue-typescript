<template>
    <div id="outer">
        <canvas :width="outerWidth" :height="outerHeight" id="myCanvas"></canvas>
        <img src="img/pointerImg.png" id="pointer">
    </div>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {Prop} from "vue-property-decorator";
    declare let $:any;
    @Component({
        components: {}
    })

    export default class Progress extends Vue {

        @Prop()
        totalNum:any;
        @Prop()
        leftNum:any;

        outerWidth:number = 0;
        outerHeight:number = 0;
        mounted() {
//            对进度条绑定操作事件
            let obj =  $('#outer');
            this.outerWidth =obj.width();
            this.outerHeight = obj.height();
            let nowWidth = $('#pointer').width();
            let endPositionX = 0;
            $('#outer').on('click',(e:any)=>{
                let left = e.clientX - nowWidth;
                $('#pointer').css({
                    left:left/this.outerWidth * 100 +'%'
                })
            });
            $('#pointer').on('touchstart',(e:any)=>{
                return false;
            });
            $('#pointer').on('touchmove', (e:any)=> {
                let touch = e.touches[0];
                endPositionX = touch.clientX - nowWidth;
                if(endPositionX <= 0){
                    endPositionX = 0;
                }else if(endPositionX >= this.outerWidth - nowWidth){
                    endPositionX = this.outerWidth - nowWidth;
                }
                $('#pointer').css({
                    left:endPositionX/this.outerWidth * 100 +'%'
                })
            });
        }
        updated(){
            //            绘制canvas
            let canvas:any = document.getElementById('myCanvas');
            
            if(canvas && canvas.getContext){
                let ctx = canvas.getContext('2d');
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,0,0,.8)';
                ctx.beginPath();
                ctx.moveTo(100,0);
                ctx.lineTo(100,this.outerHeight);
                ctx.moveTo(200,0);
                ctx.lineTo(200,this.outerHeight);
                ctx.moveTo(250,0);
                ctx.lineTo(250,this.outerHeight);
                ctx.moveTo(257,0);
                ctx.lineTo(257,this.outerHeight);
                ctx.stroke();
            }
        }

    }
</script>

<style scoped>
    #pointer {
        position: absolute;
        width: .06rem;
        left: -.03rem;
        top: -.05rem;
        height: .36rem;
    }
    #outer{
        position: relative;
        margin-top: .05rem;
        height: .26rem;
        width: 100%;
        background-color: #e4e4e4;
    }
</style>
