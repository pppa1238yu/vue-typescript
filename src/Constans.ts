export default class Constants{
    static remoteHost="http://ecg.calfdata.com";
    static calcNum(num: number) {
        if (num >= 10) {
            return num;
        } else {
            return '0' + num;
        }
    };
//        将时间秒数返回为时：分：秒模式，并自动添0
    static calcTime(seconds: number) {
        let hour, min, sec;
        hour = Math.floor(seconds / 3600);
        min = Math.floor(seconds % 3600 / 60);
        sec = Math.floor(seconds % 3600 % 60);
        return this.calcNum(hour) + ":" + this.calcNum(min) + ":" + this.calcNum(sec);
    }
//        计算两位小数
    static calcFixed(numA: number, numB: number) {
        return Number((numA / numB * 100).toFixed(2));
    }
}