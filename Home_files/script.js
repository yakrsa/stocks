var idc_height = 0, idc_locale = 'en_us', _ie_edoc_fix=0, symll_cusid = '',help_last_win, FTL_su_timer, _ft_ts=$.tablesorter, pushPage;
_ft_ts.addParser({
	id: "commaDigit",
	is: function(s, table) {
		var c = table.config;
		return _ft_ts.isDigit(s.replace(/,|\$/g, ""), c);
	},
	format: function(s) {
		return _ft_ts.formatFloat(s.replace(/,|\$/g, ""));
	},
	type: "numeric"
});
_ft_ts.addParser({
	id: "mtext",
	is: function(s) {
		return true;
	},
	format: function(s) {
		return s.replace(/\//g, "");
	},
	type: "text"
});

_ft_ts.addParser({
	id: "orderstatus_en_status",
	is: function(s) {
		return true;
	},
	format: function(s) {
		return s.replace(/<\S[^><]*>/ig, "").replace(/^\s+/,"");
	},
	type: "text"
});

_ft_ts.addParser({
	id: "orderstatusdate",
	is: function(s) {
		return true;
	},
	format: function(s) {
		return s.substring(6,10)+s.substring(0,2)+s.substring(3,5)+s.substring(11,20);
	},
	type: "text"
});

_ft_ts.addParser({
	id: "historydate",
	is: function(s) {
		return true;
	},
	format: function(s) {
		return s.substring(6,10)+s.substring(0,2)+s.substring(3,5);
	},
	type: "text"
});

var tooltip = function() {
	var id = 'tt';
	var top = 3;
	var left = 3;
	var maxw = 400;
	var speed = 10;
	var timer = 20;
	var endalpha = 90;
	var alpha = 0;
	var tt, t, c, b, h;
	var ie = document.all ? true: false;
	return {
		show: function(v, w) {
			if (tt == null) {
				tt = document.createElement('div');
				tt.setAttribute('id', id);
				c = document.createElement('div');
				c.setAttribute('id', id + 'cont');
				tt.appendChild(c);
				document.body.appendChild(tt);
				tt.style.opacity = 0;
				tt.style.filter = 'alpha(opacity=0)';
				document.onmousemove = this.pos;
			}
			tt.style.display = 'block';
			c.innerHTML = v;
			tt.style.width = w ? w + 'px': 'auto';
			if (!w && ie) {
				tt.style.width = tt.offsetWidth;
			}
			if (tt.offsetWidth > maxw) {
				tt.style.width = maxw + 'px';
			}
			h = parseInt(tt.offsetHeight) + top;
			clearInterval(tt.timer);
			tt.timer = setInterval(function() {
				tooltip.fade(1);
			},
			timer);
		},
		pos: function(e) {
			var u = ie ? event.clientY + document.documentElement.scrollTop: e.pageY;
			var l = ie ? event.clientX + document.documentElement.scrollLeft: e.pageX;
			tt.style.top = (u - 6) + 'px';
			tt.style.left = (l + left) + 'px';
		},
		fade: function(d) {
			var a = alpha;
			if ((a != endalpha && d == 1) || (a != 0 && d == - 1)) {
				var i = speed;
				if (endalpha - a < speed && d == 1) {
					i = endalpha - a;
				} else if (alpha < speed && d == - 1) {
					i = a;
				}
				alpha = a + (i * d);
				tt.style.opacity = alpha * .01;
				tt.style.filter = 'alpha(opacity=' + alpha + ')';
			} else {
				clearInterval(tt.timer);
				if (d == - 1) {
					tt.style.display = 'none'
				}
			}
		},
		hide: function() {
			clearInterval(tt.timer);
			tt.timer = setInterval(function() {
				tooltip.fade( - 1)
			},
			timer);
		}
	};
} ();

function changelocale(locale)
{
		$.cookie("pubLocale", locale.replace("-","_") , {expires: 365})
		$.cookie("ft_locale", locale , {expires: 365})
		$.cookie("pubLocale", locale.replace("-","_") , {expires: 365,path: '/',domain:'firstrade.com'})
		//$.post('/scripts/util/chg_cur_acct.php', function(d) {
			location.reload(true);
		//});
		//return false;
}
function clear_hd_current() {
	$('#nav ul').removeClass('current');
	$('#nav ul li').removeClass('current');
	$('#nav_one li a').removeClass('current');
}
function setHeaderCurrent(hh) {
	var parts = hh.split('?');
	if (parts.length > 1) hh = parts[0];
	switch(hh) {
		case '/cgi-bin/acctpositions':
			if($('#trading_link a').attr('class')=='current') {
				$('#nav ul li').removeClass('current');
				$('#trading_menu a[href="' + hh + '"]').parent().addClass('current');
			} else if($('#myaccount_link a').attr('class')=='current'){
				clear_hd_current();
				$('#myaccount_menu li a[href="' + hh + '"]').parent().parent().addClass('current');
				$('#myaccount_menu li a[href="' + hh + '"]').parent().addClass('current');
				$('#myaccount_link a').addClass('current');
			}
			break;
		case '/cgi-bin/home':
			clear_hd_current();
			$('#home_link a').addClass('current');
			$('#home_menu').addClass('current');
			break;
		default:
			clear_hd_current();
			var a=$('#nav ul.nav_two li a[href="' + hh + '"]');
			if(a) {
				var ap=a.parent();
				var app=ap.parent();
				var _id=app.attr('id');
				if (_id == 'myaccount_menu') $('#myaccount_link a').addClass('current');
				else if (_id == 'trading_menu') $('#trading_link a').addClass('current');
				else if (_id == 'research_menu') $('#research_link a').addClass('current');
				else if (_id == 'retirement_menu') $('#retirement_link a').addClass('current');
				else if (_id == 'education_menu') $('#education_link a').addClass('current');
				else if (_id == 'community_menu') $('#community_link a').addClass('current');
				else if (_id == 'customer_menu') $('#customer_link a').addClass('current');
				app.addClass('current');
				ap.addClass('current');
			}
			break;
	}
	var nlas;
	nlas=$('.nav_two li.current a span');
	if(nlas.length) {
		document.title=nlas.text();
	} else {
		nlas=$('#home_link a.current'); if(nlas.length) {document.title=nlas.text();}
	}
}

(function($) {
	if (!window['FTL']) window['FTL'] = {};
	var _t_r=null;
	function addCommas(nStr) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}

	function valid_session(s) {
		var m=/window\.location(?:\.href)?\s*=\s*(?:"\/cgi-bin\/(?:login|sessionfailed))(\?reason=(\d+))?/.exec(s);
		if(m) { var r=m[1]||'?reason=6'; window.location='/cgi-bin/login'+r; }
	}
    function showloading_btn(btn, mode, style) {
        var style_str='';
        if(typeof(style)=='string') {
            style_str=style;
        }
        if( $(btn).parent().find('img.ftloader').length<1 ) {
            mode=='p' && $(btn).parent().prepend('<img class="ftloader" src="/images/shared/progress80.gif" style="'+style_str+'"></img>') ||$(btn).parent().append('<img class="ftloader" src="/images/shared/progress80.gif" style="'+style_str+'"></img>');
        }
    }
    function removeloading_btn(btn) {
        if( $(btn).parent().find('img.ftloader').length ) {
            $(btn).parent().find('img.ftloader').remove();
        }
    }
    function showloading(container, mode, style) {
        var style_str='';
        if(typeof(style)=='string') {
            style_str=style;
        }
        if( $(container+ ' img.ftloader').length<1 ) {
            mode=='p' && $(container).prepend('<img class="ftloader" src="/images/shared/progress80.gif" style="'+style_str+'"></img>') ||$(container).append('<img class="ftloader" src="/images/shared/progress80.gif" style="'+style_str+'"></img>');
        }
    }
    function removeloading(container) {
        if( $(container+ ' img.ftloader').length ) {
            $(container+ ' img.ftloader').remove();
        }
    }
	function showprogress(obj, sh) {
		if(sh==1) {
			obj.className='but_refreshing';
		}else if(sh==0) {
			obj.className='but_refresh';
		}
	}
	function ftloading(addcss) {
		var css=addcss?addcss+';':'';
		return '<img src="/images/shared/progress80.gif" style="vertical-align:middle;'+css+'" class="gen_progress_icon" />';
	}
	function progressicon(showhide, href) {
		if(showhide) {
			if(!$('#currentURL').val()||!href||href.indexOf('javascript:void')>-1) return;
			if(href=='/cgi-bin/home') {
				$('div#progressicon').hide();
				$('img#homeprogressicon').show();
			} else {
				var ph;
				if($('ul#nav_one li#myaccount_link a.current').length) {
					ph=$('ul#myaccount_menu li a[href="'+href+'"]').parent();
				} else if($('ul#nav_one li#trading_link a.current').length) {
					ph=$('ul#trading_menu li a[href="'+href+'"]').parent();
				} else {
					ph=$('#nav ul.nav_two li a[href="'+href+'"]').parent();
				}
				if(ph) {
					var pos=ph.offset();
					var width=ph.width();
					if(pos && pos.top!=0) {
						if(_t_r) { clearTimeout(_t_r); }
						$('div#progressicon').css( {'left':(8+pos.left+width)+'px', 'top':(pos.top+5)+'px'} ).show();
						_t_r=setTimeout( function() {FTL.pi(false, href);}, 5000 );
					}
				}
			}
		} else {
			if(/^\/cgi-bin\/home/.test(href)) {
				$('div#progressicon').hide();
				$('img#homeprogressicon').hide();
			} else {
				$('div#progressicon').hide();
			}
		}
	}
	function parse_request(raw_q) {
		var idcreq = idcsymbol = idctranstype = '';
		var idcprice = 0;
		var vars = raw_q.split("&");
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if (pair[0] == 'req') idcreq = pair[1];
			else if (pair[0] == 'symbol'||pair[0] == 'usym') idcsymbol = pair[1];
			else if (pair[0] == 'transtype') idctranstype = pair[1];
			else if (pair[0] == 'price') idcprice = pair[1];
		}
		if (idcreq) processIDCRequest(idcreq, idcsymbol, idctranstype, idcprice);
	}

	function qt_action(req, symbol, transtype, price) {
		switch (req.toLowerCase()) {
		case 'stockorder':
			if ($("#showpacel").hasClass("minimize")) ChangeOrderbar();
			ChangeForm("show-stock");
			if (symbol) {
				$('#symbol').val(symbol);
				$('#quoteSymbol').val(symbol);
				$('#getQ').click();
			}
			//(price && price != 0 & !isNaN(price)) && $('#limitPrice').val(price) || $('#limitPrice').val('')

			break;
		case 'rtquote':
			if (symbol) {
				symbol=symbol.replace(/\//g, '.');
				$('#quoteSymbol').val(symbol.toUpperCase());
				getQuote($("#quoteSymbol").val());
			}
			break;
		case 'sprpt':
			var sym_not_found={
				'en-us': 'There is no equity report available for this symbol.',
				'zh-tw': '這個代號沒有證券報告。',
				'zh-cn': '这个代号没有证券报告。'
			};
			$.ajax({
				url:'/scripts/sandp/io.php',
				type:'GET',
				data:{symbol:symbol, q:'rpt', _u:new Date().getTime()},
				dataType:'json',
				success: function(res) {
					if(res.error) {
						var _lc=$.cookie('ft_locale');
						if(!_lc) { _lc='en-us'; }
						if(res.error==='symbol_not_found') {
							alert(sym_not_found[_lc]);
							return false;
						} else {
							alert(res.error);
							return false;
						}
					} else {
						window.open('/ms/equity_reports/'+res.file_name);
					}
				}
			});
			break;
		case 'optionorder':
			if ($("#showpacel").hasClass("minimize")) ChangeOrderbar();
			ChangeForm("show-option");
			if (symbol) {
				var mch = null;
				mch = /^([A-Z]+)(\d{6})(P|C)(\d+)$/.exec(symbol);
				if (mch) {
					var usymbol = mch[1];
					var d_string = mch[2].toString();
					var d_e = /^(\d{2})(\d{2})(\d{2})$/.exec(d_string);
					var expdate = d_e[2] + '/' + d_e[3] + '/20' + d_e[1];
					var callput = mch[3];
					var strike = (mch[4].replace(/^0+/g, '') / 1000).toFixed(3);
					$('#option_underlyingsymbol').val(usymbol);
					getQuoteFillSymbol(symbol);
					$('#option_expdate').val(expdate);
					$('#option_strike').val(strike);
					$('#option_callputtype').val(callput);
				}

			}
			break;
		case 'mff':
			var u = window.location.toString().replace(/^(.*)#.*$/, '$1#/content/researchtools/mutualfunds/');
			window.location = u;
			break;
		case 'fundorder':
			var u = window.location.toString().replace(/^(.*)#.*$/, '$1#/cgi-bin/mf_order');
			var _c=0,_limit=40;
			window.location = u;
			setTimeout(function check_mfready() {
				_c+=1;
				if(_c>_limit) return;
				if($('input#buy_symbol').length) {
					if(transtype=='B')
						$('#mf_transaction_buy').trigger('click');
					else if(transtype=='S')
						$('#mf_transaction_sell').trigger('click');
					$('#buy_symbol').val(symbol);
					update_fund_detail(symbol);
				} else {
					setTimeout(check_mfready, 300)
				}
			}, 300);
			break;
		case 'atws':
			var u = window.location.toString().replace(/^(.*)#.*$/, '$1#/cgi-bin/watchlist');
			var _c=0,_limit=40;
			window.location = u;
			setTimeout(function check_wlready() {
				_c+=1;
				if(_c>_limit) return;
				var _objsym=$('input#symbol1');
				if(_objsym.length) {
					_objsym.val(symbol);
				} else {
					setTimeout(check_wlready, 300)
				}
			}, 300);
			break;
		case 'atwm':
			var u = window.location.toString().replace(/^(.*)#.*$/, '$1#/cgi-bin/watchlist');
			var _c=0,_limit=40;
			window.location = u;
			setTimeout(function check_wlready() {
				_c+=1;
				if(_c>_limit) return;
				var _objsym=$('input#symbol1');
				if(_objsym.length) {
					$('select#new_type').val('3');
					_objsym.val(symbol);
				} else {
					setTimeout(check_wlready, 300)
				}
			}, 300);
			break;
		case 'load_opc':
			$('div#showpacel input#quoteSymbol').val(symbol);
			$('div#showpacel a.get_chain').click();
			break;
		case 'glossary':
			var u = window.location.toString().replace(/^(.*)#.*$/, '$1#/content/education/glossary/');
			window.location=u;
			break;
		}
		if(typeof transtype!=='undefined') {
			switch (transtype.toLowerCase()) {
				case 'b':
					if (req.toLowerCase() == 'stockorder') {
						$('#transactionType_Buy').attr('checked', 'checked');
					}
					break;
				case 's':
					if (req.toLowerCase() == 'stockorder') {
						$('#transactionType_Sell').attr('checked', 'checked');
					}
					break;
			}
		}
	}
	function setidcheight(if_height) {
		if (!isNaN(if_height) && if_height > 0) $('#maincontent iframe').height(if_height);
	}

	function ob_ddl_show() {
		$('div#showpacel select').show();
	}

	function pop_win(url,w,h) {
		var left = (screen.width - w) / 2;
		var top = ((screen.height - h) / 2);
		if(help_last_win) help_last_win.close();
		var features='location=no,toolbar=no,resizable=no,scrollbars=no,width='+w+',height='+h+',top='+top+',left='+left;
		help_last_win=window.open(url, 'target_win', features);
	}

	function showhelp(page) {
		var _url='/content/help?page='+page;
		pop_win(_url, 748, 436 );
	}
	function sc_toggle(obj) {
		var _m=$('#head div.scut');
		_m.css('top',($(obj).offset().top+18)+'px');
		_m.toggle();
	}
	// shortcut dropdown
	function sc_sw(obj, url) {
		$('#head div.scut_ctl').html( $(obj).html() );
		headerChange(url);
		$('#head div.scut').hide();
	}
	function w_upgrade() {
		tb_show('', '/content/optin/?modal=true&height=400&width=680&TB_iframe=true', false);
		$('div#TB_overlay').bgiframe();
		$('.ui-pnotify.upgrade').fadeOut();
		return false;
	}
	function optin() {
		$.ajax( {
			url: '/scripts/chk_sess.php?'+(new Date()).getTime(),
			success: function(res) {
				if(res=='Y') {
					$('div#TB_overlay').bgiframe();
				} else {
					window.location.href='/cgi-bin/login';
				}
				return false;
			}
		});
	}
	function chg_sc(h) {
		$('div.scut_ctl').html($('div.scut div.text a.hidden').html());
	}
	function llt() {
		var m=/(\d+\/\d+\/\d{4} \d+:\d+:\d+)/.exec($('#home_menu li span').html()), r='';
		if(m) {
			r=m[1];
		}
		return r;
	}
	function clr_fw() {
		$('#fundin-wr').hide();
		$('.homepage .right_4').css('margin-top', '0');
		$.cookie('FT_llt', llt(), { expires:1, path:'/'});
	}
	function show_fw() {
		$('#fundin-wr').show();
		var o=($.browser.msie && /^(?:6|7)\./.test($.browser.version))?'-250px':'-253px';
		$('.homepage .right_4').css('margin-top', o);
	}
	function chg_al(o) {
		var t=$('div.change_acon_db');
		if(t.css('display') == 'none'){
			$.ajax({
				type:'POST',
				url:'/cgi-bin/getaccountlist',
				dataType:'html',
				success: function(d) {
					if (typeof d == "string") {
						$('div.change_acon_db table').html(d);
						t.css('top',$(o).offset().top + 19).css('left',$(o).offset().left).slideDown(20);
					}
				}
			});

		}else{
			t.hide();
		}
	}
	function op_ns(o) {
		var news_url = $(o).attr('rel')
			,parts=/ID_NEWS=(\d+)$/.exec(news_url);
		if (parts) {
			newsid = parts[1];
			headerChange('/content/researchtools/marketoverview/marketstory?ID_NEWS=' + newsid);
		}
		return false;
	}
	function parse_xml(xml) {
		if ($.browser.msie && typeof xml==='string') {
			var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.loadXML(xml);
			xml = xmlDoc;
		}
		return xml;
	}
	window.FTL.get_chain=function(symbol) {
		$('#quoteSymbol').val( symbol.toUpperCase() );
		$('a.get_chain').click();
	}
	window['FTL']['addCommas'] = addCommas;
	window['FTL']['valid_session'] = valid_session;
	window['FTL']['parse_request'] = parse_request;
	window['FTL']['qt_action'] = qt_action;
	window['FTL']['setidcheight'] = setidcheight;
	window['FTL']['pi'] = progressicon;
	window['FTL']['ftloading'] = ftloading;
	window['FTL']['showloading'] = showloading;
	window['FTL']['removeloading'] = removeloading;
	window['FTL']['showloading_btn'] = showloading_btn;
	window['FTL']['removeloading_btn'] = removeloading_btn;
	window['FTL']['ob_ddl_show'] = ob_ddl_show;
	window['FTL']['showprogress'] = showprogress;
	window['FTL']['showhelp'] = showhelp;
	window['FTL']['sc_toggle'] = sc_toggle;
	window['FTL']['sc_sw'] = sc_sw;
	window['FTL']['optin'] = optin;
	window['FTL']['w_upgrade'] = w_upgrade;
	window['FTL']['chg_sc'] = chg_sc;
	window['FTL']['clr_fw'] = clr_fw;
	window['FTL']['show_fw'] = show_fw;
	window['FTL']['llt'] = llt;
	window['FTL']['chg_al'] = chg_al;
	window['FTL']['op_ns'] = op_ns;
	window['FTL']['parse_xml'] = parse_xml;
})(jQuery);

(function() {
        if(!window['FTMC']) window['FTMC']={};
        function set_cnt(cnt) {
                var a_cnt=$('#head a#id_mc_num');
                if(a_cnt.length<1) return;
                if(!/^-?\d+$/.test(cnt)) return;
                var div_mc_outer=a_cnt;
                var div_mc_inner=$('div.mc_num_inner', a_cnt);
                if(cnt>0) {
                        var arr=cnt>99?'99+'.split(''):cnt.toString().split('');
                        var len_arr=arr.length;
			var ml=len_arr==1?6.5:(len_arr==2?3.5:0.5);
                        var div_num='<div class="mc_num_wr"><div class="mc_num mc_num_x mc_num_left">&nbsp;</div>';
                        for(var i=0;i<len_arr;i++) {
                                var dg=arr[i];
                                var n_cls=dg=='+'?'plus':dg;
                                var n='<div class="mc_num mc_num_x mc_num_'+n_cls+'">&nbsp;</div>';
                                div_num+=n;
                        }
                        div_num+='<div class="mc_num mc_num_x mc_num_right">&nbsp;</div></div>';
			div_mc_inner.css('margin-left', cnt<10?'8px':'5px');
                        div_mc_inner.html(div_num).show();
                } else {
                        div_mc_inner.html('&nbsp;').hide();
                }
		a_cnt.attr('rel', cnt);
        }
        function delta_cnt(n) {
		var _newcnt=$('a#id_mc_num').attr('rel')||0;
		if( !isNaN(n) && /^\d+$/.test(_newcnt) ) {
			_newcnt=parseInt(_newcnt)+n;
			set_cnt(_newcnt);
		}
	}
	function mc_recnt() {
		$.ajax({
			type:'POST',
			url:'/scripts/mc.php',
			dataType:'html',
			data: {req:'gu'},
			success: function(d) {
				try {
					d=JSON.parse(d);
					if('res' in d && /^\d+$/.test(d.res)) {
						set_cnt(d.res);
					}
				} catch(e) {
					return;
				}
			}
		});
	}
	function mc_pn(async) {
		$.ajax({
			type:'POST',
			async:async,
			url:'/scripts/mc.php',
			dataType:'html',
			data: {req:'pn'},
			success: function(d) {
				try {
					d=JSON.parse(d);
					if('cnt' in d && /^\d+$/.test(d.cnt)) {
						set_cnt(d.cnt);
					}
				} catch(e) {
					return;
				}
			}
		});
	}
	function mc_set_fixed(msg) {
		var _obj=$('div#top_notify div.inner');
		if(_obj.length>0) {
			if($.trim(msg)=='') {
				_obj.html('&nbsp;').parent().parent().fadeOut(200);
			} else {
				_obj.html('<div class="icon">&nbsp;</div><span>'+msg+'</span>').parent().parent().fadeIn(200);
			}
		}
	}
	function mc_chk_fixed() {
		$.ajax({
			type:'POST',
			url:'/scripts/mc.php',
			dataType:'html',
			data: {req:'cf'},
			success: function(d) {
				try {
					d=JSON.parse(d);
					if('msg' in d && d.msg!='') {
						mc_set_fixed(d.msg);
					}
				} catch(e) {
					FTL.valid_session(d)
				}
			}
		});

	}
	function mc_pnotify(subject, msg, ts) {
		var _atag='<a class="nc_wr" href="javascript:void(0);" onclick="FTMC.open_mc(this, true);">';
		var atag_='</a>';
		$.pnotify({
			pnotify_title: _atag+subject+atag_,
			pnotify_history: false ,
			pnotify_text: _atag+msg+'<span class="ts">'+ts+'</span>'+atag_,
			pnotify_addclass: 'custom',
			pnotify_width: '230px',
			pnotify_notice_icon:'',
			pnotify_delay:10000,
			pnotify_hide:true
		});
	}
	function open_mc(obj, close_pnotify) {
		headerChange('/content/home/mc/');
		if(close_pnotify) {
			$(obj).parent().parent().find('.ui-pnotify-closer').click();
		}
	}

        window['FTMC']['delta_cnt']=delta_cnt;
        window['FTMC']['set_cnt']=set_cnt;
        window['FTMC']['mc_recnt']=mc_recnt;
        window['FTMC']['mc_pn']=mc_pn;
        window['FTMC']['mc_set_fixed']=mc_set_fixed;
        window['FTMC']['mc_chk_fixed']=mc_chk_fixed;
        window['FTMC']['mc_pnotify']=mc_pnotify;
        window['FTMC']['open_mc']=open_mc;
})();

$(document).ready(function() {
	if (typeof getCookie !== 'function') {
		function getCookie(c_name) {
			var i,x,y,ARRcookies=document.cookie.split(";");
			for (i=0;i<ARRcookies.length;i++) {
		  		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		  		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		  		x=x.replace(/^\s+|\s+$/g,"");
		  		if (x==c_name) {
		    		return unescape(y);
		    	}
		  	}
		}
	}
	var next_url = getCookie('FT_next_url');
	$.cookie('FT_next_url', null);
	next_url && headerChange(next_url);
	// hide datepicker when clicking outside
	//$('#wholediv').on('blur', '.hasDatepicker', function(e) { $(this).datepicker('hide'); });
	// .thickbox handling
	tb_init('a.thickbox, area.thickbox, input.thickbox');
	imgLoader = new Image();// preload image
	imgLoader.src = tb_pathToImage;
	// search dropdown
	(function() {
		var _tg=$('#id-search-cat-wr');
		$('#id-symlookup').bind('change', function() {FTL.Eqtype.get_eq_type( $(this).val(), FTL.Eqtype.sw_eq_type)});
		$('#id-searchcategory').bind('click', FTL.Eqtype.toggle_search_cat);
		$('label', _tg).click( FTL.Eqtype.set_last_cat );
		$('.search-cat', _tg).bind('clickoutside', function() {$(this).hide();});
		$('#id-searchbtngo').click(function() { FTL.Eqtype.search(); });
	})();
	// .qbar handling
	$(document).on('click', 'a.qbar', function() {
		var _t=$(this).data('ticker')||'';
		if(_t) {
			FTL.qt_action('rtquote', FTL.helper.m2f(_t));
		}
	});
	$(document).on('click', 'a.qt-research', function() {
		var _t=$(this).data('ticker')||'';
		if(_t) {
			headerChange('/content/researchtools/rt-market/research?ticker='+_t);
		}
	});
	// .tooltip handling
	$(document).on('mouseover mouseout', 'a.tooltip', function(e) {
		if(e.type==='mouseover') {
			var _t=$(this).data('tooltip')||'';
			if(_t!='') {
				tooltip.show(_t);
			}
		} else {
			tooltip.hide();
		}
	});
	$(document).on('click', '.tabs-wr li.tab a, .tabs-wr li.tabn a', _.debounce(function() {
		var li=$(this).parent(),p=li.parent(), cat=li.data('cat'), cb=p.data('cb')||'', tg=li.data('tg');
		p.find('li.current').removeClass('current');
		li.addClass('current');
		if(tg) {
			var _m=/^([^\|]*)\|(.*)$/.exec(tg);
			if(_m) {
				$(_m[1]).hide();
				$(_m[2]).show();
			}
		}

		if(cb!=='') {
			eval(cb.replace('CAT_ID', cat));
		}
	}, 500, true));
	$(document).on('click', '.thirdnav a:not(.stdlink)',  function(e) {
		e.preventDefault();
		var _href=$(this).attr('href'), _ht=$(this).data('ht'), _m=/^(\d+px):(-?\d+(?:px)?)$/.exec(_ht), _marginleft=_m[2]||'0', _height=_m[1].replace(/px/, '')||'3000', div_id='quicktake-box-main', _o=$('#'+div_id);
		if(/doc\.morningstar\./.test(_href)) {
			_o.html('<iframe src="'+_href+'" frameborder="0" style="height:'+_height+'px;width:960px;"></iframe>');
		} else {
			FTL.mkt.init_param( function() {
				_o.empty();
				QSAPI.createWidget(
					document.getElementById(div_id),
					_href,
					{width:'960', height:_height, fixHeight: false},
					{ onTickerClick: 'ms_ticker' }
				);
			} );
		}
		if(false && _m) {
			_o.css({marginLeft:_marginleft});
		}
	});
	$('#nav_one li a').each(function() {
		var obj=$(this);
		if(obj.attr('href')!='') return true;
		var li_id=obj.parent().attr('id');
		var m=li_id.split('_')[0];
		var df=$('#'+m+'_menu li a.default');
		if(df) {
			obj.attr('href', df.attr('href'));
		}
	});
	FTMC.mc_chk_fixed();
	FTMC.mc_pn(true);

	$.fn.hashchange.src = '/document-domain.html';
	$.fn.hashchange.domain = document.domain;

	jQuery(window).bind("hashchange", function(e) {
		var href = location.hash.substring(1,location.hash.length);
		//var href = e.fragment; //jquery 1.4
		if (/^\d+&/.test(href) || ! href) return;
		var hh = href;
		if (!href) {
			headerChange('/cgi-bin/home');
			return;
		}

		if( href == '/cgi-bin/realized_gl?unrealized=Y' ) {
			hh='/content/myaccount/gainloss/';
		}else if( href == '/cgi-bin/account_status' || href == '/cgi-bin/security_settings' || href == '/cgi-bin/linkaccounts') {
			hh='/cgi-bin/my_info';
		} else if (href == '/content/myaccount/drip') {
			hh='/cgi-bin/acctpositions';
		} else if (href=='/content/myaccount/gainskeeper') {
			hh='/content/myaccount/acctdownload';
		} else if(/^\/cgi-bin\/editview.*$/.test(hh)) {
			hh=hh.indexOf('watchlist')>-1?'/cgi-bin/watchlist':'/cgi-bin/acctpositions'
       } else if (/^\/content\/home\/(notices|mc)\//.test(hh)) {
            hh = '/cgi-bin/home';
		} else {
			hh=hh.replace(/^(\/content\/[^\/]+\/[^\/]+\/).+$/, '$1');
			if(hh.indexOf('/researchtools/')>-1) {
				window.scroll(0,0);
			}
		}

		FTL.pi(true,hh);
		$.post(href, {
			accountId: $("#accountId").val()
		},
		function(msg) {
			if (msg.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1 && msg.indexOf("if(xml.indexOf)") == 0) {
				if (parseInt(msg.substring(msg.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, msg.indexOf("window.location = \"/cgi-bin/login?reason=") + 47)) != NaN) window.location = "/cgi-bin/login?reason=" + msg.substring(msg.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, msg.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else window.location = "/cgi-bin/login?reason=0";
			}
			if (msg.indexOf("Kickout by another login") != - 1) {
				window.location = "/cgi-bin/login?reason=0";
			} else {
				$("#maincontent").html(msg);
				FTL.pi(false, hh);
			}
		});
		$("#currentURL").val(href);
		setHeaderCurrent(hh);
	});

	$('#id-symlookup').keydown(function(evt) {
		if (!evt && window.event) evt = window.event;
		if (evt.keyCode == 13 && $.trim($('#id-symlookup').val())) $('#id-searchbtngo').trigger('click');
	});

	if (!$('#currentURL').val() || ! $('#maincontent').html()) {
		if (location.href.indexOf('#') > - 1)
		{
			$(window).trigger('hashchange');
			//$(window).hashchange();

		}
		else headerChange('/cgi-bin/home');
	}

	$('#nav_one li a').click(function() {
		var _hc=$(this).data('hc');
		if(typeof _hc!=='undefined') {
			headerChange(_hc);
		}
		return false;
	});

	$("#nav ul.nav_two a").click(function(event) {
		var _a=$(this);
		 if(_a.attr('href').indexOf("optionchain")!=-1)
		 {
				clickoptionchain();
				return false;
		}
		else{
			//event.preventDefault();
			$("#nav ul.nav_two li").removeClass("current")
			_a.parent().addClass("current")
			headerChange(_a.attr('href'));
			return false;
		}
	})

	$("#maincontent a.stdlink, .footer a.stdlink").live('click', function(event) {
		var href = $(this).attr('href');
		if (href.substring(href.length - 4, href.length).toUpperCase() == ".PDF" || href.substring(0, 7).toUpperCase() == "MAILTO:") {
			var openPop = window.open(href, "mywindow", "status=1,toolbar=1");
			if (href.substring(0, 7).toUpperCase() == "MAILTO:") {
				openPop.close();
			}
		} else if (href != '' && href.indexOf('javascript:') < 0 && href != '#') {
			if ($.browser.msie) href = href.replace(/https:\/\/.*.com(\/.*)/, '$1');
			headerChange(href);
		}
		return false;
	});

	$(document).bind('mousedown',function (e){
		if($(e.target).parent().hasClass("change_acon") || $(e.target).parents().hasClass("change_acon_db") ){
			return
		}else{
			$("div.change_acon_db").hide()
		}
	});
});

function headerChange(href) {
	/*
	//Lightstream 6.0 Client
	var streamingobject = new Array();
	streamingobject[0]="quoteplace0";
	streamingobject[1]="quoteplace1";
	streamingobject[2]="quoteplace2";
	streamingobject[3]="quoteplace3";
	streamingobject[4]="quoteplace4";
	streamingobject[5]="quoteplace5";
	streamingobject[6]="watchlistoption_positiontable";
	streamingobject[7]="watchlistpositiontable";
	for(var i=0;i<streamingobject.length;i++)
		eval("if("+streamingobject[i]+"!=undefined ){if("+streamingobject[i]+".isSubscribed ){lsClient.unsubscribe('"+streamingobject[i]+"');}}");
		//eval("if("+streamingobject[i]+"!=undefined ){if("+streamingobject[i]+".isSubscribed ){alert('"+streamingobject[i]+"');alert("+streamingobject[i]+".getMode());lsClient.unsubscribe('"+streamingobject[i]+"');alert(aaa+'"+streamingobject[i]+"');}}");
	//Lightstream 6.0 Client
	*/
	if(pushPage) {
		var tablemap = pushPage.getTables();
		$.each(tablemap, function(key, value) {
			if(/^(?:option|stock|watchlist)/i.test(key)) {
				pushPage.removeTable(key);
			}
		});
	}
	FTL.chg_sc(href);
	if(href.indexOf('javascript:void')>-1) return;
	if ($("#orderbar_clordid").val() != "" ||  $("#option_orderbar_clordid").val() !="" ) {
		undo();
		option_clearall();
		clearall();
		option_stopAll();
		stopAll();
	}
	if($('input#currentURL').val()==href) {
		$(window).trigger('hashchange');
	} else {
		window.location.href = '#' + href;
	}
	scroll(0,0);
}

function responsehandler(xml, yesdiv, nodiv) {
	if (typeof xml == "string") {
		if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
		else responsehandler1(xml, yesdiv, nodiv);
	}
	else {
		responsehandler1(xml, yesdiv, nodiv);
	}
}

function responsehandler1(xml, yesdiv, nodiv) {
	xml=FTL.parse_xml(xml);

	$("order", xml).each(function(id) {
		var quote = $("order", xml).get(id);
		if ($("action", quote).text().toLowerCase() == "loadmain") {
			window.location = "/cgi-bin/" + $("redirect", quote).text();
		} else if ($("action", quote).text().toLowerCase() == "loaddiv") {
			$.ajax({
				type: "GET",
				url: "/cgi-bin/" + $("redirect", quote).text(),
				success: function(msg) {
					if ($("success", quote).text().toLowerCase() == "yes") {
						$(yesdiv).empty();
						$(yesdiv).append(msg);
					} else {
						$(nodiv).empty();
						$(nodiv).append(msg);
					}
				}
			});
		} else if ($("action", quote).text().toLowerCase() == "updatediv") {
			if ($("success", quote).text().toLowerCase() == "yes") {
				$(yesdiv).empty();
				var string = $("actiondata", quote).text();
				var string1 = string.replace(/\[\[/g, "<");
				var string2 = string1.replace(/\]\]/g, ">");
				$(yesdiv).append(string2);
			} else {
				$(nodiv).empty();
				var temp = $("actiondata", quote).text() + ";";
				var newtemp = temp.substring(0, temp.indexOf(";"));
				//var newtemp = temp.replace(";","<BR/>");
				$(nodiv).append(newtemp);
			}

		}
		return false;
	});
}

function accountIdchange() {
	$("#headeraccountId").val($("#accountId").val());
	document.headerForm.action = location.href;
	document.headerForm.submit();
}

function accountChangeSubmit(where, obj) {
	//
	if(typeof obj =='object') {
		$('div.change_acon span').html( $(obj).html() );
		if(/^\d+$/.test(where)) {
			$("#accountId").val(where);
			$("#headeraccountId").val(where);
		}
	} else if (where=='orderbar') {
		var _acc=$('select#accountId').val();
		$('div#headcontent div.change_acon_db div.text table a').each( function(i) {
			var _al=$(this).html()
			if(/^\d+$/.test(_acc)) $("#headeraccountId").val(_acc);
			if( _al.indexOf(_acc)>-1) {
				$('div.change_acon span').html(_al);
				return false;
			}
		});
		FTL.session_timr();
	}
	$("div.change_acon_db").hide()

	var options = {
		type: "POST",
		url: "/cgi-bin/getAcctType",
		success: function(msg) {
			if(msg.indexOf("::")==-1)
			{
				$("#accountType").val(msg);
				$("#option_accountType").val(msg);
			}
			else{
				var msgarray = msg.split("::");
				$("#accountType").val(msgarray[0]);
				$("#option_accountType").val(msgarray[0]);
			}
			//checkACHurl();
			$(window).trigger('hashchange');
			getmpb();
			ChangeForm("show-stock");
			$("#orderbarerror").empty();
		}

	};
	// bind form using 'ajaxForm'
	//$.post('/scripts/util/chg_cur_acct.php', function(d) {
		$('#headerForm').ajaxSubmit(options);
	//});
}

// Code below this line is temporary and should be deleted once beta is over:
function siteFeedback() {
	var left = (screen.width - 660) / 2;
	var top = ((screen.height - 400) / 2) - 30;
	window.open('/sc_scripts/feedback_form/', '_blank', 'toolbar=0,scrollbars=0,directories=0,location=0,status=0,menubar=0,resizable=0,width=660,height=400,left=' + left + ',top=' + top);
}
//	function mf_mousedown(){
$(document).mousedown(function(e) {
	var clicked = $(e.target);
	if($('#head .scut:visible').length && ! (clicked.is('#head div.scut') || clicked.is('#head div.scut_ctl')||clicked.is('#head div.scut a'))) {
		$('#head .scut').hide();
	}

	if ($('#id-dropmenu').is(':visible') && ! clicked.is('#id-searchcategory')) {
		document.getElementById('id-dropmenu').style.visibility = 'hidden';
	}
});
//	}

function checkMouse(e) {
	var _t=$(e.target);
	if (_t.parent().parent().hasClass("ader_drop") || _t.parent("span").parent(".ader").children("div").children("p:eq(1)").hasClass("drop") || _t.hasClass("drop")) {
		return
	} else {
		$(".ader_drop").hide()
	}
}

function scollToId(id) {
	window.scroll(0, $(id).offset().top);
}

function fullSizeWindow(url) {
	window.open(url, '', 'fullscreen=yes, scrollbars=yes');
}

function getExpDate(section) {
	if (section) {
		if (!$.trim($('#option_underlyingsymbol' + section).val())) return;
		//$("#option_expdate" + section).html("<option value=\"\">Loading...</option>");
	}
	$.ajax({
		type: "POST",
		data: "underlyingsymbol=" + $("#option_underlyingsymbol" + section).val(),
		url: "/cgi-bin/getexpdatestrike",
		success: function(xml) {

			if (typeof xml == "string") {

				if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else displayExpdate(xml, section);
			}
			else displayExpdate(xml, section);
		}
	});
}
function getExpDateBoth(section,section2) {
	if (section) {
		if (!$.trim($('#option_underlyingsymbol' + section).val())) return;
		//$("#option_expdate" + section).html("<option value=\"\">Loading...</option>");
	}
	$.ajax({
		type: "POST",
		data: "underlyingsymbol=" + $("#option_underlyingsymbol" + section).val(),
		url: "/cgi-bin/getexpdatestrike",
		success: function(xml) {
			if (typeof xml == "string") {

				if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else{
					displayExpdate(xml, section);
					displayExpdate(xml, section2);
				}
			}
			else
			{
			 displayExpdate(xml, section);
			 displayExpdate(xml, section2);
			}
		}
	});
}


function getStrikeBoth(section,section2) {
	if (section) {
		if (!$.trim($("#option_underlyingsymbol" + section).val()) || ! $("#option_expdate" + section).val()) return;
	}
	$.ajax({
		type: "POST",
		data: "underlyingsymbol=" + $("#option_underlyingsymbol" + section).val() + "&month=" + $("#option_expdate" + section).val(),
		url: "/cgi-bin/getexpdatestrike",
		success: function(xml) {
			if (typeof xml == "string") {

				if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else {displayStrike(xml, section);displayStrike(xml, section2);}
			}
			else {displayStrike(xml, section);displayStrike(xml, section2);}
		}
	});
}
function getStrike(section) {
	if (section) {
		if (!$.trim($("#option_underlyingsymbol" + section).val()) || ! $("#option_expdate" + section).val()) return;
	}
	$.ajax({
		type: "POST",
		data: "underlyingsymbol=" + $("#option_underlyingsymbol" + section).val() + "&month=" + $("#option_expdate" + section).val(),
		url: "/cgi-bin/getexpdatestrike",
		success: function(xml) {
			if (typeof xml == "string") {

				if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else displayStrike(xml, section);
			}
			else displayStrike(xml, section);
		}
	});
}

function getStrikeMonth(section, current_month, price) {
	$.ajax({
		type: "POST",
		data: "underlyingsymbol=" + $("#option_underlyingsymbol" + section).val() + "&month=" + current_month,
		url: "/cgi-bin/getexpdatestrike",
		success: function(xml) {
			if (typeof xml == "string") {

				if (xml.indexOf("window.location = \"/cgi-bin/login?reason=") != - 1) window.location = "/cgi-bin/login?reason=" + xml.substring(xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 46, xml.indexOf("window.location = \"/cgi-bin/login?reason=") + 47);
				else {
					displayStrikeMonth(xml, section);

					$("#option_strike" + section).val(price)
					$("#option_expdate" + section).val(current_month);
				}
			}
			else {
				displayStrikeMonth(xml, section);
				$("#option_strike" + section).val(price)
				$("#option_expdate" + section).val(current_month);
			}
		}
	});
}

function openHelpPage(page){
		window.open("/content/help?&page="+page, "mywindow","location=1,status=1,scrollbars=0, width=750,height=750");
}
function openPopWindow(feature_var){
		if(feature_var == "callback"){
		window.open("https://www.firstrade.com/callback/zh-tw/", "", "width=400,height=660,scrollbars=yes");
		}
		else if(feature_var == "callbacke"){
		window.open("https://www.firstrade.com/callback/en-us/", "", "width=400,height=660,scrollbars=yes");
		}
		else if(feature_var == "textzoom"){
			window.open("/textzoom/en-us/", "", "width=430,height=520,resizable=0,scrollbars=no");
		}
	}

// etf prospectus
(function() {
	FTL.tpls={ qtsym: doT.template('<a href="javascript:void(0);" data-ticker="{{!it.symbol}}" class="qbar">{{!it.symbol}}</a>') };
	var _helper=(function() {
		function gsi(o) {
			if(typeof o==='undefined'||typeof o.sym==='undefined'|| o.sym==='') { return; }
			var op={
				url: '/scripts/util/get_symbol_info.php',
				data: {sym: o.sym, isetf: 'Y'},
				type: 'POST',
				dataType:'json',
				success: function(d) {
					if(typeof(o.cb)==='function') {
						if(typeof(o.id)!=='undefined') {
							o.cb(d, o.id);
						} else {
							o.cb(d);
						}
					}
				}
			};
			$.ajax(op);
		}
		function nbr_fmt(num, d) {
			if(isNaN(num)) { return num; }
			if(typeof d==='undefined') { d=2; }
			if(num>1000000000) {
				return (num/1000000000).toFixed(d)+'B';
			} else if(num>1000000) {
				return (num/1000000).toFixed(d)+'M';
			} else if(num>1000) {
				return (num/1000).toFixed(d)+'K';
			} else {
				return parseFloat(num).toFixed(d);
			}
		}
		function _cn(msg, ttl, t, cssClass) {
			var modal_overlay;
			ttl||(ttl='');
			cssClass||(cssClass='custom');
			t||(t=3000);
			$.pnotify({
				pnotify_title: ttl,
				pnotify_text: msg,
				pnotify_notice_icon:'',
				pnotify_delay: t,
				pnotify_addclass: cssClass,
				pnotify_stack: false,
				pnotify_history: false,
				pnotify_hide: true,
				pnotify_before_open: function(pnotify) {
					pnotify.css({
						'top': ($(window).height() / 2) - (pnotify.height() / 2),
						'left': ($(window).width() / 2) - (pnotify.width() / 2)
					});
					// Make a modal screen overlay.
					if (modal_overlay) {
						modal_overlay.fadeIn("fast");
					} else {
						modal_overlay = $('<div />', {
							'class': 'ui-widget-overlay',
							'css': {
							'display': 'none',
							'position': 'fixed',
							'top': '0',
							'bottom': '0',
							'right': '0',
							'left': '0'
							}
						}).appendTo("body").fadeIn("fast");
					}
				},
				pnotify_before_close: function(){
					modal_overlay.fadeOut('fast');
				}
			});
		}

		return {
			get_sym_info: gsi,
			nbr_fmt: nbr_fmt,
			nbr_fmt2: function(num) {
				return nbr_fmt(num, 2);
			},
			// convert M* symbol to FT format
			m2f: function(symbol) {
				symbol||(symbol='');
				if(symbol) {
					return symbol.replace( /\//g, '.' ).replace( /p$/, '.PR').replace(/r$/, '.RT').replace(/p([A-Z])$/, '.PR.$1');
				}
			},
			dt_nbr_fmt2: function(data, type, row) {
				return type==='display'?FTL.helper.nbr_fmt(data, 2): data;
			},
			qtsym: function(s) {
				return FTL.tpls.qtsym({symbol: (typeof s==='string')?s.toUpperCase():''});
			},
			do_qtsym: function(s) {
				headerChange('/content/researchtools/rt-stocks/?ticker='+(typeof s==='string'?s.toUpperCase():''));
			},
			dalert: function(msg, opts) {
				opts||(opts={});
				$('<div />').html(msg).dialog(_.extend({modal:true}, opts));
			},
			center_notice: _cn
		};
	})();
	window.FTL.helper=_helper;
})();
