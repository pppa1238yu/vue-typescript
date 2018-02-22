<template>
    <div class="ecg-chart">
        <div class="chart-head">
            <div>心电图</div>
            <div>
                <img src="img/tagFilter.png" alt="" class="tagFilter" style="width: .25rem"
                     @click="openTagsFilter">
            </div>
        </div>
        <div class="echartsBox">
            <div id="ecg-chart" style="width: 100%;height: 2.4rem">
            </div>
        </div>
        <div class="current-time">
            <span>{{currentTime}}</span>/<span>{{useTime}}</span>
        </div>
        <div class="chart-foot">
            <div class="operateBox">
                <img :src="playImgSrc" alt="播放" @click.stop="switchPlay" class="handleIcon">
                <img src="img/prevAbnormal.png" alt="上个异常" class="handleIcon" @click="lastAbNormal">
                <img src="img/nextAbnormal.png" alt="下个异常" class="handleIcon" @click="nextAbNormal">
            </div>
            <div id="outer">
                <canvas :width="outerWidth" :height="outerHeight" id="myCanvas"></canvas>
                <div id="pointer">
                    <img src="img/pointerImg.png">
                </div>
            </div>
        </div>
        <el-dialog
                :visible.sync="dialogVisible"
                width="80%"
                title="选择要显示的标签"
        >
            <el-checkbox-group v-model="tagSelected">
                <el-checkbox label="N-正常或者束支传导阻滞节拍" class="tagCheckBox"></el-checkbox>
                <el-checkbox label="S-室上性异常节拍" class="tagCheckBox"></el-checkbox>
                <el-checkbox label="V-心室异常节拍" class="tagCheckBox"></el-checkbox>
                <el-checkbox label="F-融合节拍" class="tagCheckBox"></el-checkbox>
                <el-checkbox label="Q-未能分类的节拍" class="tagCheckBox"></el-checkbox>
            </el-checkbox-group>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmFilter">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {Prop} from "vue-property-decorator";
    import * as echarts from "echarts";
    import axios from 'axios';
    import Constants from "../../Constans.ts";

    declare let $: any;

    @Component({
        components: {}
    })
    export default class EcgChart extends Vue {
        @Prop()
        userId: string;
        @Prop()
        reportId: string;
        @Prop()
        useTime: string;
        @Prop()
        blockModel: any;
        @Prop()
        closeLoading: any;
        @Prop()
        playSeconds: number;

        metaData: Array<any> = [];
        dataBuffer: Array<any> = [];
        data: Array<any> = [];
        myChart: any;//chart实例

        playState: boolean = false;//播放状态
        playImgSrc: string = "img/play.png";
        tagData: Array<any> = [];
        xData: Array<any> = [];
        dialogVisible = false;
        tagSelected: Array<string> = ["S-室上性异常节拍", "V-心室异常节拍", "F-融合节拍"];
        beatsType = {
            "N": "N-正常或者束支传导阻滞节拍",
            "S": "S-室上性异常节拍",
            "V": "V-心室异常节拍",
            "F": "F-融合节拍",
            "Q": "Q-未能分类的节拍"
        };

        currentPlaySecond: number = 0;//当前播放的秒数
        currentTime: string = "00:00:00";//当前播放时间
        blockIndex: number = 0;//当前请求的区块索引
        shouldGetData: boolean = true;
        errorState: boolean = false;//当前网络是否出错
        timer: any;//波形移动计时器
        timerCurrentSecond: any;//当前时间的计时器
        markLineData: Array<any> = [];

//        进度条定义
        leftNum: number = 0;
        totalNum: number = 1000;
        outerWidth: number = 0;
        outerHeight: number = 0;
        clickState: boolean = false;

        //心电波形图初次绘制
        drawEcg(ele: any) {
            this.data = this.metaData.splice(0, 1000);
            for (let i = 0; i < 1000; i++) {
                this.xData.push("index" + i);
            }
            this.markLineData = this.currentMarkLine(0, 1000);
            let option = {
                xAxis: {
                    type: 'category',
                    show: false,
                    data: this.xData
                },
                animation: false,
                yAxis: {
                    type: 'value',
                    show: false,
                    max: 0.33,
                    min: -0.33
                },
                grid: {
                    top: '0%',
                    left: '0%',
                    right: '0%',
                    bottom: '8%'
                },
                series: [
                    {
                        name: '心电信号',
                        type: 'line',
                        smooth: false,
                        symbol: 'none',
                        data: this.data,
                        markLine: {
                            data: this.markLineData
                        }
                    }
                ]
            };
            ele.setOption(option);
        }

        moveData() {
            this.data.push(this.metaData.shift());
            this.data.shift();
        }

        switchPlay() {
            if (this.playState) {
                this.pause();
            } else {
                this.play();
            }
        }

//        进度条滚动动画
        private setProgressAnimate(left: number, total: number) {
            let leftRate = left / total * 100 - 0.5;
            if (leftRate >= 99) leftRate = 99;
            $('#pointer').css({
                left: leftRate + '%'
            })
        }

        abNormalIndex: number = -1;
        errorItems = {
            items: [],
            total: 1000
        };

//        上一个异常
        lastAbNormal() {
            let dataItem: any;
            if (this.abNormalIndex === -1) {
                return;
            } else {
                this.pause();
                if (this.clickState) {
                    this.clickState = false;
                } else {
                    if (this.abNormalIndex > 0) {
                        this.abNormalIndex--;
                    } else {
                        this.abNormalIndex = 0;
                    }
                }
                dataItem = this.errorItems.items[this.abNormalIndex];
                if (dataItem) {
                    if (dataItem.position !== undefined) {
                        this.setProgressAnimate(dataItem.position, this.totalNum);
                        let leftRate = dataItem.position / this.totalNum;
                        this.leftNum = leftRate * this.totalNum;
                        this.getAxiosEcharts(leftRate);
                    }
                }
            }
        }

//        下一个异常
        nextAbNormal() {
            let dataItem: any;
            this.pause();
            if (this.abNormalIndex == -1) {
                this.clickState = false;
                dataItem = this.errorItems.items[0];
                this.abNormalIndex = 0;
            } else {
                let length = this.errorItems.items.length;
                if (this.abNormalIndex >= length - 1) {
                    if (this.clickState) return;
                    this.abNormalIndex = length - 1;
                } else {
                    this.clickState = false;
                    this.abNormalIndex++;
                }
                dataItem = this.errorItems.items[this.abNormalIndex];
            }
            if (dataItem) {
                if (dataItem.position !== undefined) {
                    this.setProgressAnimate(dataItem.position, this.totalNum);
                    let leftRate = dataItem.position / this.totalNum;
                    this.leftNum = leftRate * this.totalNum;
                    this.getAxiosEcharts(leftRate);
                }
            }
        }

//        动态变化异常index
        private getAbNormalIndex(leftRate: number) {
            let arr: any = this.errorItems.items;
            let totalNum = this.totalNum;
            this.clickState = true;
            if (arr.length !== 0) {
                if (leftRate < arr[0].position / totalNum) {
                    this.abNormalIndex = -1;
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        if (leftRate > arr[i].position / totalNum) {
                            this.abNormalIndex = i;
                        }
                    }
                }
            }

        }

//        变化echarts
        private setEcharts() {
            this.myChart.setOption({
                xAxis: {
                    data: this.xData
                },
                series: [{
                    data: this.data,
                    markLine: {
                        data: this.markLineData
                    }
                }]
            });
        }

//        动态滚动监听echarts数据
        private getAxiosEcharts(leftRate: number) {
            this.myChart.showLoading();
            let changeIndex = Math.ceil(leftRate * this.blockModel.blockCount);
            if (changeIndex === 0) changeIndex = 1;
            let divationIndex = this.getDivation(leftRate, changeIndex);
//                进度条
            // 拖动后数据获取
            axios.all([this.getTags(), this.getEcgData(changeIndex - 1)])
                .then(axios.spread((tagsData: any, ecgData: any) => {
                    this.myChart.hideLoading();
                    let echartsChangeIndex = divationIndex * 1000;
                    let data = ecgData.data;
                    this.metaData = data.slice(echartsChangeIndex);
                    this.data = this.metaData.splice(0, 1000);
                    this.xData = [];
                    let xDataStart = (changeIndex - 1) * 30000 + echartsChangeIndex;
                    for (let i = 0; i < 1000; i++) {
                        this.xData.push("index" + xDataStart);
                        xDataStart++;
                    }
                    this.markLineData = this.currentMarkLine(parseInt(this.xData[0].split("index")[1]), parseInt(this.xData[999].split("index")[1]));
                    this.currentPlaySecond = leftRate * this.playSeconds;
                    this.currentTime = Constants.calcTime(this.currentPlaySecond);

                    if (parseInt(this.currentTime.split(":")[2]) >= 57) {//如果拖到到57秒以后马上请求下一块数据
                        this.getNextBlockData();
                    }
                    this.setEcharts();

                })).catch((err: any) => {
                this.myChart.hideLoading();
                this.errorState = true;
                this.playImgSrc = "img/play.png";//网络出错按钮变为暂停状态
                this.$notify.error({
                    title: '',
                    message: '<span style="display: block;margin-top: -4px;">' + err + '</span>',
                    dangerouslyUseHTMLString: true,
                    position: 'bottom-right',
                    showClose: false
                })
            });
        }

        //筛选当前x轴对应的markLine配置数据
        currentMarkLine(xStart: number, xEnd: number) {
            let tagData = this.tagData.filter((e: any, index: any) => {
                if (this.tagSelected.indexOf(this.beatsType[e.type]) !== -1) {
                    return e.position < xEnd && e.position >= xStart
                }
            });
            return tagData.map((e: any, index: any) => {
                return {
                    xAxis: "index" + e.position,
                    label: {
                        position: "start",
                        formatter: `${e.type}`
                    }
                }
            });
        }

        //提前获取下一块数据
        getNextBlockData() {
            if (this.playSeconds % 60 === 0 && this.blockIndex === this.playSeconds / 60 - 1) {
                return
            }
            if (this.playSeconds % 60 !== 0 && this.blockIndex === Math.floor(this.playSeconds / 60)) {
                return
            }
            this.blockIndex = Math.floor(this.currentPlaySecond / 60);
            this.getEcgData(this.blockIndex).then((response: any) => {
                this.dataBuffer = response.data;
            });
        }

        //心电信号播放
        play() {
            if (this.errorState || this.currentPlaySecond >= this.playSeconds) {
                return
            }
            this.clickState = false;
            this.playState = true;
            this.timer = setInterval(() => {
                if (this.metaData.length === 0) {
                    this.metaData = this.dataBuffer;
                }
                for (let i = 0; i < 16; i++) {
                    this.moveData();
                }
//                用于进度条异常节律跳转
                this.leftNum += 16;
                let dataItem: any = this.errorItems.items[this.abNormalIndex];
                let originItem: any = this.errorItems.items[0];
                if (originItem) {
                    let firstItem = originItem.position || 0;
                    if (this.abNormalIndex === -1) {
                        if (this.leftNum > firstItem) {
                            this.abNormalIndex++;
                        }
                    } else if (this.leftNum > dataItem.position) {
                        if (this.abNormalIndex >= this.errorItems.items.length - 1) {
                            this.abNormalIndex = this.errorItems.items.length - 1
                        } else {
                            this.abNormalIndex++;
                        }
                    }
                }


                this.setProgressAnimate(this.leftNum, this.totalNum);

                this.xData = this.xData.map((e: any) => {
                    return "index" + (parseInt(e.split("index")[1]) + 16);
                });

                this.markLineData = this.currentMarkLine(parseInt(this.xData[0].split("index")[1]), parseInt(this.xData[999].split("index")[1]));

                this.myChart.setOption({
                    xAxis: {
                        data: this.xData
                    },
                    series: [{
                        data: this.data,
                        markLine: {
                            data: this.markLineData
                        }
                    }]
                });
            }, 32);
            this.playImgSrc = "img/pause.png";
            this.timerCurrentSecond = setInterval(() => {
                if (this.currentPlaySecond >= this.playSeconds) {
                    this.pause();
                } else {
                    this.currentPlaySecond++;
                    this.currentTime = Constants.calcTime(this.currentPlaySecond);
                    if (parseInt(this.currentTime.split(":")[2], 10) === 57) {
                        this.getNextBlockData();
                    }
                }
            }, 1000);
        }

        //心电信号暂停
        pause() {
            this.playState = false;
            clearInterval(this.timer);
            this.playImgSrc = "img/play.png";
            clearInterval(this.timerCurrentSecond);
        }

        //            绘制canvas
        private drawCanvas() {
            let canvas: any = document.getElementById('myCanvas');
            if (canvas && canvas.getContext) {
                let ctx = canvas.getContext('2d');
                let items: any = this.errorItems.items;
                let total = this.totalNum;
                let length = items.length || 0;
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,0,0,.8)';
                ctx.beginPath();
                for (let i = 0; i < length; i++) {
                    ctx.moveTo(items[i].position / total * this.outerWidth + 1.5, 0);
                    ctx.lineTo(items[i].position / total * this.outerWidth + 1.5, this.outerHeight);
                }
                ctx.stroke();
            }
            this.closeLoading();
        }

//        获取偏移字节量
        private getDivation(leftRate: number, changeIndex: number) {
            let perRate = 100 / this.blockModel.blockCount / 100;
            let divation = 0;
            if (changeIndex === 1) {
                divation = leftRate / perRate;
            } else {
                divation = (leftRate - ((changeIndex - 1) * perRate)) / perRate;
            }
            if (this.playSeconds >= 30) {
                return Math.floor(this.blockModel.blockSize * divation / 2000);
            } else {
                return Math.floor(this.blockModel.blockSize * divation / 1000);
            }

        }

        //获取一块心电数据
        getEcgData(blockIndex: number) {
            return axios.get('/ecgData', {
                params: {
                    userId: this.userId,
                    reportId: this.reportId,
                    blockIndex: blockIndex
                }
            })
        }

        //获取tags信息
        getTags() {
            return axios.get('/tags', {
                params: {
                    userId: this.userId,
                    reportId: this.reportId
                }
            })
        }

        openTagsFilter() {
            if (this.playState) {
                this.pause();
            }
            this.dialogVisible = true;
        }

        //确认筛选
        confirmFilter() {
            this.play();
            this.dialogVisible = false;
        }


//        清除定时器
        destroyed() {
            clearInterval(this.timer);
            clearInterval(this.timerCurrentSecond);
        }

        mounted() {
            this.myChart = echarts.init(document.getElementById("ecg-chart"));
            axios.all([this.getTags(), this.getEcgData(0)])
                .then(axios.spread((tagsData: any, ecgData: any) => {
                    this.metaData = ecgData.data;
                    this.tagData = tagsData.data.beats;
                    this.errorItems.items = tagsData.data.atrialfibrillation.concat(tagsData.data.others);
                    this.totalNum = this.blockModel.frequency * this.playSeconds;
                    this.drawEcg(this.myChart);
                    this.drawCanvas();
                })).catch(() => {
                this.closeLoading();
                this.errorState = true;
                console.log("请求出错或者代码出错");
            });

//            对进度条绑定操作事件
            let obj = $('#outer');
            this.outerWidth = obj.width();
            this.outerHeight = obj.height();
            let nowWidth = $('#pointer').width();
            let endPositionX = 0;
            $('#outer').on('click', (e: any) => {
                let left = e.offsetX - nowWidth / 2;
                if (left <= 0) {
                    left = 0;
                }
                let leftRate = left / this.outerWidth;
                this.leftNum = leftRate * this.totalNum;
//                点击后进度条效果
                this.pause();
                this.getAbNormalIndex(leftRate);
                this.getAxiosEcharts(leftRate);
                this.setProgressAnimate(left, this.outerWidth);
            });
            $('#pointer').on('touchstart', (e: any) => {
                return false;
            });
            $('#pointer').on('touchmove', (e: any) => {
                let touch = e.touches[0];
                let outer = $('#outer')[0].offsetLeft;
                endPositionX = touch.clientX - nowWidth - outer;
                if (endPositionX <= 0) {
                    endPositionX = 0;
                } else if (endPositionX >= this.outerWidth - nowWidth / 2) {
                    endPositionX = this.outerWidth - nowWidth / 3;
                }
                this.pause();
                let leftRate = endPositionX / this.outerWidth;
                this.leftNum = leftRate * this.totalNum;
                this.setProgressAnimate(endPositionX, this.outerWidth);
            });
            $('#pointer').on('touchend', (e: any) => {
                let touch = e.touches[0];
                let outer = $('#outer')[0].offsetLeft;
                //  进度条拖动后数据获取
                let leftRate = endPositionX / this.outerWidth;
                let changeIndex = Math.ceil(leftRate * this.blockModel.blockCount);
                this.getAxiosEcharts(leftRate);
                this.getAbNormalIndex(leftRate);
            });
            $(document).on('touchmove', () => {
                this.pause();
            });
        }
    }
</script>

<style scoped>
    .chart-head {
        display: flex;
        justify-content: space-between;
        font-size: .16rem;
        color: #fff;
        background-color: #91D0EC;
        padding: .1rem;
    }

    .ecg-chart {
        margin-top: .3rem;
    }

    .tagFilter {
        vertical-align: middle;
    }

    .chart-foot {
        height: .36rem;
        padding-top: .06rem;
        overflow: hidden;
    }

    .current-time {
        text-align: right;
        font-size: .14rem;
        color: #848484;
        padding: .05rem;
    }

    .handleIcon {
        width: .3rem;
    }

    .operateBox {
        float: left;
        width: 1.05rem;
    }

    #pointer {
        position: absolute;
        width: .14rem;
        left: -.03rem;
        top: -.04rem;
        height: .38rem;
    }

    #pointer img {
        width: .07rem;
    }

    #outer {
        float: right;
        position: relative;
        height: .3rem;
        width: calc(100% - 1.05rem);
        background-color: #e4e4e4;
    }

    .tagCheckBox {
        display: block;
        margin-left: 0;
        margin-top: 10px;
    }
</style>
