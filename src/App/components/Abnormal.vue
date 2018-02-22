<template>
    <!--检测周期-->
    <div class="abnormalBox">
        <p class="abnormalTitle">节律分布</p>
        <div class="abnormalEcharts">
            <div class="showRelative">
                <div class="showAbsolute">
                    <p><span class="absFont1 abColor1">{{rythmObj.normalRythm}}</span><span class="abFontSmall">%</span></p>
                    <p class="absFont2">正常节律</p>
                </div>
                <div id="abnormalEcharts1" style="height: 1rem;width:100%"/>
            </div>
            <div class="showRelative">
                <div class="showAbsolute">
                    <p><span class="absFont1 abColor2">{{rythmObj.atrialRythm}}</span><span class="abFontSmall">%</span></p>
                    <p class="absFont2">房颤</p>
                </div>
                <div id="abnormalEcharts2" style="height: 1rem;width:100%"/>
            </div>
            <div class="showRelative">
                <div class="showAbsolute">
                    <p><span class="absFont1 abColor3">{{rythmObj.otherRythm}}</span><span class="abFontSmall">%</span></p>
                    <p class="absFont2">其他</p>
                </div>
                <div id="abnormalEcharts3" style="height: 1rem;width:100%"/>
            </div>

        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {Prop} from "vue-property-decorator";
    import * as echarts from "echarts";
    @Component({
        components: {
        }
    })
    export default class Abnormal extends Vue {
        @Prop()
        rythmObj:any;

        chart1:any;
        chart2:any;
        chart3:any;

//        绘制echarts
        private drawChartRate(chart:any, color:string, value:number){
            let option = {
                series: [
                    {
                        name: '个股评级',
                        type: 'pie',
                        radius: ['95%', '100%'],
                        hoverAnimation: false,
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        label: {
                            normal: {
                                show: false,
                                position: 'center',
                                formatter: '{c}\n{b}'
                            }
                        },
                        color: [color, "#ccc"],
                        animation:false,
                        data: [
                            {
                                value: value,
                                textStyle: {
                                    color: '#000'
                                },
                            },
                            {
                                value: 100 - value,
                                name: ""
                            }
                        ]
                    }
                ]
            };
            chart.setOption(option);
        };
        updated(){
            this.chart1 = echarts.init(document.getElementById('abnormalEcharts1'));
            this.chart2 = echarts.init(document.getElementById('abnormalEcharts2'));
            this.chart3 = echarts.init(document.getElementById('abnormalEcharts3'));
            this.drawChartRate(this.chart1,'#e78ca8',this.rythmObj.normalRythm);
            this.drawChartRate(this.chart2,'#61adee',this.rythmObj.atrialRythm);
            this.drawChartRate(this.chart3,'#747cec',this.rythmObj.otherRythm);
        }

    }

</script>

<style scoped>
    .abnormalBox{
        overflow: hidden;
        margin-top: .25rem;
    }
    .abnormalTitle{
        box-sizing: border-box;
        padding-left: .2rem;
        height:.34rem;
        line-height: .34rem;
        font-size: .14rem;
        color: #ffffff;
        background-color: #bcbbbb;
    }
    .abnormalEcharts{
        display: flex;
        justify-content: space-around;
        margin:.3rem 0 .3rem 0;
    }
    .showRelative{
        position: relative;
        overflow: hidden;
        width: 33%;
    }
    .showAbsolute{
        position: absolute;
        top:.25rem;
        width: 100%;
        text-align: center;
    }
    .absFont1{
        font-size: .2rem;
    }
    .abFontSmall{
        font-size: .12rem;
    }
    .absFont2{
        color: #737373;
        font-size: .14rem;
    }
    .abColor1{
        color: #e78ca8;
    }
    .abColor2{
        color: #61adee;
    }
    .abColor3{
        color: #747cec;
    }
</style>
