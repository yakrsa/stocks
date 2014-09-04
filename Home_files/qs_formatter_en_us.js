
function QS_numberFormatter(){   // format the numnic
    var MSize = [1e+12, 1e+9, 1e+6];
    var Mark = ['T', 'bil', 'mil'];
    var zs = ['000', '00', '0'];
    this.CDSep = '.';
    this.CGSep = ',';
    this.NDSep = '.';
    this.NGSep = ',';
    /**
     * 
     * @param {number} n
     * @param {boolean} isC
     * @param {string} sep:the separator between number and mark[mil,bil,T]
     * @param {number} d
     * @param {boolean} isFormat
     */
    this.setSep = function(format){
        var sep = format.split("|");
        if(sep&&sep.length==2){
            var sepChar = sep[0],pointChar=sep[1];
            this.CGSep = sepChar;this.NGSep = sepChar;
            this.CDSep = pointChar;this.NDSep = pointChar;
        }
    };
    this.Fmt2 = function(n, isC, sep, d,isFormat){
        isFormat=isFormat===false?false:true;
        var ne = 0;
        if (n==Infinity||isNaN(n)) 
            return '--';
        if (!isFormat) {
            return parseFloat(n).toFixed(d<0?2:d);
        }
        if (n < 0) {
            ne = 1;
            n = -n;
        }
        try {
            var t = n;
            var m = '';
            var ret = '';
            if (n >= MSize[MSize.length - 1]) {//divide the million or billion
                for (var i = 0,size=MSize.length; i < size; i++) {
                    if (n >= MSize[i]) {
                        t = n / MSize[i];
                        m = sep + Mark[i];
                        break;
                    }
                }
            }
            if (d < 0){// if d is invalid,it will be used the default value. 
                d = m==''?1:2;
            }
            var ds = this.NDSep;
            var gs = this.NGSep;
            if (isC) {
                ds = this.CDSep;
                gs = this.CGSep;
            }
            var p1 = Math.floor(t);//integer
            var p2 = t - p1;
            var ar = [];
            var st;
            //toFixed
            if ((d < 0 && p2 != 0) || d > 0) {
                var k = new Number(p2);
                k = k.toFixed(d);
                if (k == 1) 
                    p1++;
                m = ds + k.substr(2) + m;
            }
            //format
            do {
                t = p1 % 1000;
                p1 = Math.floor(p1 / 1000);
                st = '' + t;
                if (p1 > 0 && st.length < 3) {
                    st = zs[st.length] + st
                }
                ar.unshift(st);
            }
            while (p1 > 0);
            ret = ar.join(gs) + m;
        } catch (e) {
            ret = '' + n;
        }
        if (ne == 1) {
            ret = '-' + ret;
        }
        return ret;
    };
    this.Fmt = function(n, isC){
        return this.Fmt2(n, isC, ' ', -1);
    };
    this.parseFloat = function(strVal){
        if (typeof(strVal) == 'string') {
            strVal = strVal.replace(/^[\D]*/, '').replace(/[\D]*$/, '');
            var baseDiv = 1;
            var sepPos = strVal.lastIndexOf(this.NDSep);
            if (sepPos >= 0) {
                baseDiv = Math.pow(10, strVal.length - sepPos - 1);
            }
            strVal = strVal.replace(/\D/g, '');
            strVal = parseFloat(strVal);
            if (!isNaN(strVal)) {
                strVal = strVal / baseDiv;
            }
        }
        return strVal;
    };
    this.FmtUnMark=function(n, isC, d,isFormat,stayzs){
        isFormat=isFormat===false?false:true;
        var ne = 0;
        if (n==Infinity||isNaN(n)) 
            return '--';
        if (!isFormat) {
            return parseFloat(n).toFixed(d<0?2:d);
        }
        if (n < 0) {
            ne = 1;
            n = -n;
        }
        try {
            var t = n;
            var ret = '';
            if (d < 0){// if d is invalid,it will be used the default value. 
                d = 1;
            }
            var ds = this.NDSep;
            var gs = this.NGSep;
            if (isC) {
                ds = this.CDSep;
                gs = this.CGSep;
            }
            var p1 = Math.floor(t);//integer
            var p2 = t - p1;
            var ar = [];
            var st,m="";
            //toFixed
            if ((d < 0 && p2 != 0) || (d > 0&&!stayzs)) {//don't zs
                var k = new Number(p2);
                k = k.toFixed(d);
                if (k == 1) 
                    p1++;
                m = ds + k.substr(2);
            }
            //format
            do {
                t = p1 % 1000;
                p1 = Math.floor(p1 / 1000);
                st = '' + t;
                if (p1 > 0 && st.length < 3) {
                    st = zs[st.length] + st
                }
                ar.unshift(st);
            }
            while (p1 > 0);
            ret = ar.join(gs) + m;
        } catch (e) {
            ret = '' + n;
        }
        if (ne == 1) {
            ret = '-' + ret;
        }
        return ret;
    };
}

var QS_NumFmt = new QS_numberFormatter();

function QS_dateFormatter(){
    this.Culture = 'EN-US';
    this.Mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ''];
    this.Wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    function _pp0(n){
        if (n < 10) 
            n = '0' + n;
        return n;
    }
    function _tt(h){
        if (h < 12) 
            return 'AM';
        return 'PM';
    }
    function _h12(h){
        if (h > 12) 
            return (h - 12);
        if (h == 0) 
            return 12;
        return h;
    }
    this.getMonthDate = function(dt){
        return (this.Mo[dt.getMonth()] + ' ' + _pp0(dt.getDate()));
    };
    this.strMonthDate = "MMM dd";
    
    this.getTimeString = function(dt){
        return this.to12HrTime(dt);
    };
    this.strTime = "hh:mm tt";
    
    this.getYearMonth = function(dt){
        return (this.Mo[dt.getMonth()] + ' ' + dt.getFullYear());
    };
    this.strYearMonth = "MMM, yyyy";
    this.getShortYearMonth = function(dt){
        return (this.Mo[dt.getMonth()] + ' ' + '\'' + ('' + dt.getFullYear()).substr(2, 2));
    };
    this.strShortYearMonth = "MMM, '\''yy";
    
    this.getDateString = function(dt){
        return (this.Mo[dt.getMonth()] + ' ' + _pp0(dt.getDate()) + ', ' + dt.getFullYear());
    };
    this.strDate = "MM dd, yyyy";
    
    this.getDatetimeString = function(dt){
        return this.getDateString(dt)+' '+this.getTimeString(dt);
    };
    this.strDatetime = "MM dd, yyyy hh:mm tt";
    this.to24HrTime = function(dt){
        return (_pp0(dt.getHours()) + ':' + _pp0(dt.getMinutes()));
    };
    this.str24HrTime = "HH:mm";
    this.to12HrTime = function(dt){
        return (_pp0(_h12(dt.getHours())) + ':' + _pp0(dt.getMinutes()) + ' ' + _tt(dt.getHours()));
    };
    this.str12HrTime = "h:mm tt";
    this.getWeekDay = function(dt){
        return (this.Wd[dt.getDay()]);
    };
    this.StrWeekDay = "ddd";
    var TZFmt = {
        'EET': 'EET',
        'EDT': 'EDT',
        'EST': 'EST',
        'GMT': 'GMT',
        'BST': 'BST',
        'CET': 'CET',
        'CDT': 'CDT',
        'CHN': 'CHN',
        'CST': 'CST',
        'IST': 'IST',
        'JST': 'JST',
        'SGT': 'SGT',
        'EEST': 'EEST',
        'AEDT': 'AEDT',
        'AEST': 'AEST',
        'CEST': 'CEST'
    };
    this.Timezone = function(tz){
        return TZFmt[tz];
    };
}

var QS_DateFmt = new QS_dateFormatter();

