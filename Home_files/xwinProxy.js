/*
 * jQuery postMessage - v0.5 - 9/11/2009
 * http://benalman.com/projects/jquery-postmessage-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($){var g,d,j=1,a,b=this,f=!1,h="postMessage",e="addEventListener",c,i=b[h]&&!$.browser.opera;$[h]=function(k,l,m){if(!l){return}k=typeof k==="string"?k:$.param(k);m=m||parent;if(i){m[h](k,l.replace(/([^:]+:\/\/[^\/]+).*/,"$1"))}else{if(l){m.location=l.replace(/#.*$/,"")+"#"+(+new Date)+(j++)+"&"+k}}};$.receiveMessage=c=function(l,m,k){if(i){if(l){a&&c();a=function(n){if((typeof m==="string"&&n.origin!==m)||($.isFunction(m)&&m(n.origin)===f)){return f}l(n)}}if(b[e]){b[l?e:"removeEventListener"]("message",a,f)}else{b[l?"attachEvent":"detachEvent"]("onmessage",a)}}else{g&&clearInterval(g);g=null;if(l){k=typeof m==="number"?m:typeof k==="number"?k:100;g=setInterval(function(){var o=document.location.hash,n=/^#?\d+&/;if(o!==d&&n.test(o)){d=o;l({data:o.replace(n,"")})}},k)}}}})(jQuery);

/*
 * 2011-5 David Li
 */
var Queue = function(_delay){
    var dalay = _delay || 100;
    var maxLength = 500;
    var queue = [];
    var timer = null;
    var firstRun = true;
    var length = queue.length;
    var runQueue = function(){
        length = queue.length;
        if (length >= maxLength) {
            queue = queue.slice(length - maxLength, length);
        }
        if (length > 0) {
            //clearTimeout(timer);
            timer = window.setTimeout(function(){
                queue[0]();
                queue.splice(0, 1);
                runQueue();
                firstRun = false;
            }, firstRun ? 2000 : dalay); //waiting for the page load in first run.
        }
        else {
            timer = window.setTimeout(function(){
                runQueue();
            })
        }
    }
    runQueue();
    return {
        add: function(fn){
            queue.push(fn);
        }
    };
};

var getQueryString = function(url, name){
    var reg = new RegExp("(^|&|\\?)" + name + "=([^&]*)(&|$)"), r;
    if (r = url.match(reg)) 
        return unescape(r[2]);
    return null;
}; 

var QSXwinProxy_child = function(config){
    var config = config || {};
    this.parentWindow = config.parentWindow || (opener || parent)
    this.parent = null;
    this.components = [];
    this.isXDM = true;
    this._XDMType_HTMLProxy = 0;
    this._XDMType_PostMessage = 1;
    this.IE7method = 1; //0:detect hash change by onresize event, 1:polling
    this.xdmType = config.xdmType || (window.postMessage ? this._XDMType_PostMessage : this._XDMType_HTMLProxy);
    this.remoteProxy = config.remoteProxy || getQueryString(window.location.href, 'proxyurl')||'';
	this.qsdomain = window.location.protocol+"//"+window.location.host;
	this.localHelper = 'http://rtqdev.morningstar.com/xdm_helper.html';
    this.isDataCenter = config.isDataCenter || false;
    this.dataManager = {};
    this._HTMLProxyId = 1;
    this.widgetId = getQueryString(window.location.href, 'wid')||getQueryString(window.location.href, 'aid');
    this._init();
};
QSXwinProxy_child.prototype = {
    _init: function(){
        var self = this;
        if(this.parentWindow == window){
            return;
        }
        //check is XDM
		if(this.remoteProxy==''||this.remoteProxy.indexOf(this.qsdomain)==0){
			this.isXDM=false;
		}
        
        if (!this.isXDM) {
            // add child
			this.parent = this.parentWindow.QSAPI.xwinProxy;
            this.parent.addChild(this);
        }else {
            this.remoteProxy += '?qsapi_xdm=' + this._getHTMLProxyId() + '|' + encodeURIComponent(window.location.href);
            if (this.xdmType == this._XDMType_HTMLProxy) {
                //for IE7-
                document.domain = 'morningstar.com';
                var _ifm = document.createElement('iframe');
                _ifm.id = 'qsapi_xdm_iframe';
                _ifm.style.visibility = 'hidden';
                _ifm.style.position = 'absolute';
                _ifm.style.top = '-9999px';
                _ifm.width = 50;
                _ifm.src = this.remoteProxy;
                document.body.appendChild(_ifm); // add child will be done in Iframe
                
                if (this.IE7method == 1) {
                    //polling hash
                    var oldHash = "";
                    var timer = setInterval(function(){
                        if (window.location.hash != oldHash) {
                            oldHash = window.location.hash;
                            var hashs = decodeURIComponent(window.location.hash).replace('#', '').split("|");
                            self.callFunction(hashs[0], hashs[1]);
                        }
                    }, 10);
                    
                    this.parent = {
                        iframe: _ifm,
                        queue: new Queue(100),
                        callFunction: function(functionName, parameter){
                            var _this = this;
                            this.queue.add(function(){
                                parameter = typeof parameter == 'string' ? parameter : self._extendParameter(parameter);
                                var str = '' + functionName + '|' + parameter;
                                _this.iframe.src = self.remoteProxy + "#" + encodeURIComponent(str);
                            });
                        }
                    };
                    
                }else {
                    //detect hash change by onresize event
                    window.QSAPI_hashChange = function(){
                        var hashs = decodeURIComponent(window.location.hash).replace('#', '').split("|");
                        self.callFunction(hashs[0], hashs[1]);
                    };
                    
                    this.parent = {
                        iframe: _ifm,
                        callFunction: function(functionName, parameter){
                            var _this = this;
                            parameter = typeof parameter == 'string' ? parameter : self._extendParameter(parameter);
                            var str = '' + functionName + '|' + parameter;
                            _this.iframe.src = self.remoteProxy + "#" + encodeURIComponent(str);
                            _this.iframe.width = _this.iframe.width > 50 ? 50 : 100;
                        }
                    };
                }
            }else{
                var parentURL = location.protocol + '//' + this._getDomianWithURL(this.remoteProxy);
                $.receiveMessage(function(e){
                    var vals = decodeURIComponent(e.data).split("|");
                    var functionName = vals[0];
                    var parameter = vals[1];
                    self.callFunction(functionName, parameter);
                }, parentURL);
                this.parent = {
                    callFunction: function(functionName, parameter){
                        var _this = this;
                        setTimeout(function(){
                            parameter = typeof parameter == 'string' ? parameter : self._extendParameter(parameter);
                            var str = functionName + '|' + parameter;
                            $.postMessage(encodeURIComponent(str), parentURL, self.parentWindow);
                        }, 0)
                    }
                };
            }
        }
        
    },
	_getDomianWithURL:function(url){
		var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;  
		var domain=urlReg.exec(url);
		if(domain!=null){
			return domain[0];
		}else{
			return null;
		}
	},
	_extendParameter:function(parameter){
		if(typeof parameter.id=='undefined'){
			parameter.id=this.widgetId;
		}
		parameter=$.toJSON(parameter);
		return parameter;
	},
    extendDataManager: function(dataManager){
        $.extend(true, this.dataManager, dataManager);
        var self = this;
        this.dataManager.dataHandler = new QS.DataHandler();
        this.dataManager.batchSubscribe = function(){
            //only send gkey in cross-domains
            var gkeyList = [], data;
            for (var i = 0; i < arguments[0].length; i++) {
                data = gData[arguments[0][i].gkey];
                gkeyList.push(arguments[0][i].gkey + ']' + data.tenforeCode + ']' + data.tenforeTicker + ']' + data.type + ']' + data.country + ']' + data.mType);
            }
            self.batchSubscribe.apply(self, [gkeyList.join(','), self.widgetId]);
        };
        this.dataManager.batchUnsubscribe = function(){
            self.batchUnsubscribe.apply(self, arguments);
        };
        window.QSAPI_DATA_updateData = function(o){
            o = $.evalJSON(o);
            self.updateData(o.gkey, o.data, o.gdata);
        };
        QS.Data = push.proxy = this.dataManager;
        return this.dataManager;
    },
    _getHTMLProxyId: function(){
        if (this.IE7method == 1) {
            return - (this._HTMLProxyId++);
        }else{
            return this._HTMLProxyId++;
        }
    },
    reg: function(component){
        this.components.push(component);
    },
    unregister: function(component){
        //no implement yet
    },
    batchSubscribe: function(ticker, widgetId){
        this.callParentFunction('QSAPI_DATA_batchSubscribe', ticker + '[' + widgetId);
    },
    batchUnsubscribe: function(ticker){
        
    },
    getMarketQuoteData: function(ticker, fields){
    },
    callFunction: function(functionName, parameter){
        if (window[functionName]) {
            window[functionName](parameter);
        }
    },
    callParentFunction: function(functionName, parameter){
        return this.parent.callFunction(functionName, parameter);
    },
    updateData: function(gkey, data, gdata){
        if (typeof gData != 'undefined' && gData[gkey]) {
            for (var i = 0; i < this.components.length; i++) {
                this.components[i].updateData(gkey, data);
                
            }
            for(var f in data){
                if(data[f].value){
                   gData[gkey][f] = data[f].value;
                }
            }
            for(var f in gdata){
                gData[gkey][f] = gdata[f];
            }
        }
    },
    initConnection: function(){}
    
};
