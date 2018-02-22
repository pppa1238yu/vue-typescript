<template>
    <div id="totalPage">
        <div class="loadingPage" v-if="firstLoading">
            <div class="loadingGif">
                <img src="img/loading.gif">
                <p>loading...</p>
            </div>

        </div>
        <div :class="{showPage:firstLoading,mainBox:!firstLoading}">
            <Header :userInfo="userInfo"/>
            <div class="addPadding">
                <!--平均心率-->
                <div class="averageBox">
                    <h3 class="averageTitle">平均心率</h3>
                    <PointerBar :pointer="pointer"/>
                </div>
                <!--诊断报告-->
                <Suggestion :description='description'/>
                <!--echarts折线图-->
                <EcgChart :reportId="reportId" :userId="userId" :useTime="userInfo.useTime" :playSeconds="playSeconds"
                          :blockModel="blockModel" :closeLoading="closeLoading"></EcgChart>
                <!--节律分布-->
                <Abnormal :rythmObj="rythmObj"/>
                <!--异常节拍统计-->
                <AbnormalRhythm :rhythmObject="rhythmObject"/>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import PointerBar from '../components/PointerBar.vue';
    import Abnormal from "../components/Abnormal.vue";
    import Suggestion from "../components/Suggestion.vue";
    import EcgChart from '../components/EcgChart.vue';
    import AbnormalRhythm from "../components/AbnormalRhythm.vue";
    import Header from "../components/Header.vue";
    //    import Progress from "../components/Progress.vue";
    import axios from 'axios';
    import Constans from "../../Constans";
    declare let $: any;
    @Component({
        components: {
            PointerBar,
            Abnormal,
            Suggestion,
            EcgChart,
            Header,
            AbnormalRhythm
        }
    })


    export default class Main extends Vue {
        userId:string="";
        reportId:string="";
        pointer: number = 0;

        //用户信息定义
        userInfo = {
            name: '',
            time: '',
            sex: '',
            age: '',
            useTime: ''
        };
        playSeconds: number = 0;
        firstLoading: boolean = true;
        //节律信息
        rythmObj = {
            normalRythm: 0,//正常节律
            atrialRythm: 0,//房颤节律
            otherRythm: 0//其他节律
        };

        //节拍信息
        rhythmObject = {
            rhythmN: 0,//N节拍数
            rhythmS: 0,//S节拍数
            rhythmV: 0,//V节拍数
            rhythmF: 0,//F节拍数
            rhythmQ: 0//Q节拍数
        };

        //节律块
        blockModel = {
            blockCount: 0,//总节律块数
            frequency: 0,//频率
            blockSize: 0 //节律块容量
        };

        //诊断报告信息
        description = {
            note: '',
            suggestion: '',
            title: ''
        };

        protected closeLoading() {
            this.firstLoading = false;
        }

        private getTags() {
            return axios.get('/tags', {
                params: {
                    userId: this.userId,
                    reportId: this.reportId
                }
            })
        }

        private getReport() {
            return axios.get('/report', {
                params: {
                    userId: this.userId,
                    reportId: this.reportId
                }
            })
        }

        created() {
            this.userId=location.href.split("?")[1].split("&")[0].split("=")[1];
            this.reportId=location.href.split("?")[1].split("&")[1].split("=")[1].split("#")[0];

            axios.all([this.getTags(), this.getReport()])
                .then(axios.spread((tagsData: any, response: any) => {
                    if (response.data) {
                        let data = response.data;
                        let rhythmData = tagsData.data.beats || [];
                        let totalRhythm = rhythmData.length || 1;
//                        节拍信息记录
                        let typeNnum = 0,
                                typeSnum = 0,
                                typeVnum = 0,
                                typeFnum = 0,
                                typeQnum = 0;
                        rhythmData.map( (item:any) => {
                           if(item.type){
                               switch(item.type){
                                   case 'S':typeSnum++;break;
                                   case 'V':typeVnum++;break;
                                   case 'F':typeFnum++;break;
                                   case 'Q':typeQnum++;break;
                                   default:break;
                               }
                           }
                        });
                        this.rhythmObject.rhythmS = Constans.calcFixed(typeSnum,totalRhythm);
                        this.rhythmObject.rhythmV = Constans.calcFixed(typeVnum,totalRhythm);
                        this.rhythmObject.rhythmF = Constans.calcFixed(typeFnum,totalRhythm);
                        this.rhythmObject.rhythmQ = Constans.calcFixed(typeQnum,totalRhythm);
                        this.rhythmObject.rhythmN = 100 - this.rhythmObject.rhythmS - this.rhythmObject.rhythmV - this.rhythmObject.rhythmF - this.rhythmObject.rhythmQ;
                        let tagCountAData = tagsData.data.atrialfibrillation;
                        let tagCountOData = tagsData.data.others;
                        let tagCountNormal = tagsData.data.normal;
                        let RythmA = tagCountAData.length || 0;
                        let RythmB = tagCountOData.length || 0;
                        let RythmN = tagCountNormal.length || 1;
                        let RythmTotal = RythmA + RythmB + RythmN;
                        //个人基本信息
                        let calcUserTime = 0;
                        this.pointer = data.heartRate || 0;
                        this.userInfo.name = data.name;
                        this.userInfo.time = data.time;
                        this.userInfo.sex = data.sex;
                        this.userInfo.age = data.age;
                        calcUserTime = data.seconds;
                        this.playSeconds = data.seconds;
                        this.userInfo.useTime = Constans.calcTime(calcUserTime);
                        //诊断信息
                        if(data.description){
                            this.description = data.description;
                        }
                        //节律块信息
                        this.blockModel.blockCount = data.blockCount || 0;
                        this.blockModel.frequency = data.frequency || 0;
                        this.blockModel.blockSize = data.blockSize || 0;
                        //节率信息记录
                        this.rythmObj.atrialRythm = Constans.calcFixed(RythmA, RythmTotal) || 0;
                        this.rythmObj.otherRythm = Constans.calcFixed(RythmB, RythmTotal) || 0;
                        this.rythmObj.normalRythm = Constans.calcFixed(RythmTotal - RythmA - RythmB, RythmTotal) || 0;

                    }
                })).catch((err: any) => {
                this.firstLoading = false;
                this.$notify.error({
                    title: '',
                    message: '<span style="display: block;margin-top: -4px;">' + err + '</span>',
                    dangerouslyUseHTMLString: true,
                    position: 'bottom-right',
                    showClose: false
                })
            });

        }
    }
</script>

<style scoped>
    .mainBox {
        padding-bottom: .6rem;
        width: 100%;
        overflow: hidden;
    }

    .loadingGif {
        position: absolute;
        width: 16%;
        left: 42%;
        top: 40%;
    }

    .loadingGif img {
        width: 100%;
    }

    .loadingGif p {
        text-align: center;
        font-size: .16rem;
        color: #000;
    }

    .loadingPage {
        position: relative;
        height: 100vh;
        overflow: hidden;
        background-color: #eee;
    }

    .averageTitle {
        width: 100%;
        height: .4rem;
        line-height: .4rem;
        border-radius: .03rem;
        color: #ffffff;
        box-sizing: border-box;
        font-size: .14rem;
        margin-top: .3rem;
        padding-left: .1rem;
        background-color: #91d0ec;
    }

    .addPadding {
        box-sizing: border-box;
        padding: 0 .06rem .3rem .06rem;
    }

    .showPage {
        height: 0;
        overflow: hidden;
    }

</style>
