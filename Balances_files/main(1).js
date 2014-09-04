if(!window.FTL) {window.FTL={};}
FTL.Models={};
FTL.Views={};
FTL.Collections={};
function ms_news_more(_d) {
	try {
		var d=JSON.parse(_d);
		$('#quicktake-menu li.qt-tab-'+d.part+' a').trigger('click');
	} catch(e) { return; }
}

function ms_ticker(t) {
	var s='';
	try {
		var o=JSON.parse(t);
		s=o.ticker.toUpperCase();
	} catch (e) {
		return;
	}
	if(s!=='') {
		headerChange('/content/researchtools/rt-market/research?ticker='+s);
	}
}

FTL.oLanguage= {
	'sInfoFiltered': '',
	"sEmptyTable":"There are no entries found.",
	"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
	"sLengthMenu": "Show _MENU_ entries",
	"sLoadingRecords": "Please wait - searching...",
	"oPaginate":{
		"sFirst":"First",
		"sLast":"Last",
		"sNext":"Next",
		"sPrevious":"Previous"
	}
};

FTL.mktmap={
	OOTC: 'OTCMKTS',
	XOTC: 'OTCBB',
	XASE: 'NYSEMKT',
	ARCX: 'NYSEARCA',
	XNYS: 'NYSE',
	XNAS: 'NASDAQ',
	NAS: 'NASDAQ',
	AMEX: 'NYSE AMEX'
};
FTL.invalid_symbol_dict={
	'en-us':'Invalid Symbol',
	'zh-tw':'代號無效',
	'zh-cn':'代码无效'
};

window.FTPIN=(function() {
	var innercls, keycls, clearcls, id, self=this, pin='';
	var set_start=function(l) {
		var w='';
		switch(l) {
			case 0: w='0'; break;
			case 1: w='27px'; break;
			case 2: w='55px'; break;
			case 3: w='83px'; break;
			case 4: w='114px'; break;
		}
		if(w!='') {
			$(innercls, pinblock).css('width', w);
		}
	};
	var clear=function() {
		pin='';
		set_start(0);
	};
	var pick=function(o) {
		if(pin.length<4) {
			pin+=$(o).attr('title');
			set_start(pin.length);
		}
	};
	var init=function(options) {
		options||(options={});
		innercls=options.pin_inner||'.pin_inner';
		keycls=options.keycls||'.kp';
		clearcls=options.clearcls||'.pin_clear';
		id=options.id;
		pinblock=$(id);
		pin='';
		$(keycls, pinblock).click( function(o) { pick(this); } );
		$(clearcls, pinblock).click( function() { clear(); } );
		if($.browser.msie && parseFloat($.browser.version)<9) {
			$(keycls, pinblock).dblclick( function(o) { pick(this); } );
		}
		return this;
	};
	return {
		get_pin: function() { return pin; },
		set_start: set_start,
		clear: clear,
		pick: pick,
		init: init
	};
})();

window.FTProfile=(function(options) {
	var lc={
		needlogin:'Your session has ended, please login again.',
		invalidemail:'Invalid email address.',
		unmatchedemail:'Email address confirmation failed.',
		newemail:'Please enter your new email address.',
		invalidconfemail:'Invalid confirmation email address.',
		confirmemail:'Please confirm your email adress.',
		needpin:'Please enter your PIN by using the keypad on the screen.',
		wrongpin:'The PIN you have entered is incorrect.  Please try again.',
		wrongpin_fmt:'PIN should be a 4-digit number.',
		wrongpin_final:'You have entered the incorrect PIN too many times.  Please wait 30 minutes and try again.',
		success:'Your email address has been updated.',
		unknown_error:'Unknown error encountered.',
		updatefailed:'Email update has failed.',
		nochange:'Please enter a new email address that is different than your previous one.'
	}, busy, d={}, edit_btn, info_div;

	var init=function(options) {
		busy=false;
		edit_btn=$('#edit_em');
		FTPIN.init({id:'#ec_securepin'});
		$.extend(true, lc, options);
		info_div=$('#chg_em_info');
		return this;
	};

	function clear_info() {
		info_div.hasClass('info') && info_div.removeClass('info');
		$('#chg_em_info').html('&nbsp;').hide();
	}
	function show_done(s) {
		if(s) {
			$('.security_pin .actions_done').show();
			$('.security_pin .actions').hide();
		}
	}
	function show_error(msg) {
		busy=false;
		info_div.hasClass('info') || info_div.removeClass('info');
		info_div.html(msg).fadeIn();
		return false;
	}
	function show_conf(msg) {
		$('.chg_conf .msg').html(msg).parent().fadeIn();
		setTimeout( function() {
			$('.chg_conf .msg').html('&nbsp;').parent().fadeOut();
		}, 10000);
	}
	function show_info(msg) {
		info_div.hasClass('info') || info_div.addClass('info');
		info_div.html(msg).fadeIn();
	}
	function chk_inputs() {
		if(d.em1=='') {
			return show_error(lc.newemail);
		}
		if(!/^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/.test(d.em1)) {
			return show_error(lc.invalidemail);
		}
		if(d.em2=='') {
			return show_error(lc.confirmemail);
		}
		if(!/^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/.test(d.em2)) {
			return show_error(lc.invalidconfemail);
		}
		if(d.em1!=d.em2) {
			return show_error(lc.unmatchedemail);
		}
		if(d.pin=='') {
			return show_error(lc.needpin);
		}
		if(d.pin.length!='4') {
			return show_error(lc.wrongpin_fmt);
		}
		return true;
	}
	function chg_free() {
		FTL.removeloading('.security_pin .actions');
		$('.security_pin .actions a').show();
	}
	function chg_busy() {
		$('.security_pin .actions a').hide();
		FTL.showloading('.security_pin .actions', 'a', 'margin-left:205px;');
		setTimeout( function() { chg_free(); }, 60000 );
	}
	var unfold=function() {
		FTPIN.clear();
		clear_info();
		$('.security_pin input.chg_email').val('');
		$('.security_pin').hide();
		edit_btn.css('visibility', 'visible');
	};
	var show_form=function() {
		$('.chg_conf').hide();
		$('.security_pin .actions_done').hide();
		$('.security_pin .actions').show();
		$('.security_pin').show();
	};
	var chg=function() {
		if(busy) {return;}
		d={
			em1:$.trim($('#chg_email1').val()),
			em2:$.trim($('#chg_email2').val()),
			pin:FTPIN.get_pin().substr(0,4)
		};
		if(chk_inputs(d)) {
			busy=true;
			clear_info();
			chg_busy();
			$.ajax({
				url:'/scripts/profile/uio.php',
				data: { i:'s', email:d.em1, pin: d.pin },
				type:'POST',
				dataType:'json',
				success: function(res) {
					if(res) {
						if( res.code=='success' ) {
							$('#user_em').text(d.em1);
							//show_info(lc.success);
							FTProfile.unfold();
							show_conf(lc.success);
							show_done(true);
						} else if( res.rc=='ERROR' ) {
							if( res.code in lc) {
								show_error(lc[res.code]);
							} else {
								show_error(lc['unknown_error']);
							}
						}
					}
					busy=false;
					chg_free();
				}
			});
		}
	};
	var chk_linked_accts=function() {
		$.ajax( { url: '/scripts/profile/uio.php', type:'POST', dataType:'json', data: {i:'ql'}, success: function(d) {
			if( 'rc' in d && d.rc=='OK' ) {
				if(d.code=='Y') {
					$('#em_chg_linked_accts_info').show();
				}
			}
		}});
	};
	return {
		init: init,
		unfold: unfold,
		show_form: show_form,
		chg: chg,
		chk_linked_accts: chk_linked_accts
	};
})();

(function() {
	var _FTUSR=function() {
		var defaults={}, req = {
			url: '/scripts/profile/ciu.php',
			type: 'POST',
			dataType:'json'
		}, ct, options, req_busy=false, llt;

		var init=function(settings) {
			settings=settings||{};
			ct=$('#contact_info_update');
			options=$.extend({}, defaults, settings);
			llt=options.llt||'';
		};

		var reminder=function(u) {
			var _w=FTL.msie6?690:680;
			$('.acct_name', ct).text( [u.first_name, u.last_name].join(' ') );
			$('.p_acct', ct).text( u.primary_account );
			$('.email', ct).text( u.email );
			tb_show('','#TB_inline?height=280&amp;width='+_w+'&amp;inlineId=contact_info_update_wr&amp;modal=true',null);
			FTL.msie6 && $('div#TB_overlay').bgiframe();
		}, set_c=function() {
			$.cookie('FT_llt2', llt, {path:'/'});
		}, getinfo=function() {
			if(req_busy) {return;}
			if($.cookie('FT_llt2')===_ft_llt) { return; }
			if($.cookie('_ft_user_init')==='true') {
				set_c();
				$.cookie('_ft_user_init', $(this).val(), { path: '/', expires: -5 });
				return;
			}
			var opt_req=$.extend({}, req, {
				data:{act:'getinfo'},
				success: function(d) {
					req_busy=false;
					if(d && d.rc==='OK') {
						var u=d.data;
						if(typeof u.first_name!=='undefined') {
							reminder(u);
						}
					}
				}
			});
			req_busy=true;
			$.ajax(opt_req);
		}, confirm_email=function() {
			if(req_busy) {return;}
			var opt_req=$.extend({}, req, {
				data:{act:'update'},
				success: function(d) {
					req_busy=false;
					if(d && d.rc==='OK') {
						tb_remove();
					}
				}
			});
			req_busy=true;
			set_c();
			$.ajax(opt_req);
		}, update_email=function() {
			if(req_busy) {return;}
			tb_remove();
			setTimeout(function() {
				window.location = '/cgi-bin/main#/cgi-bin/my_info?edit_em=1';
			}, FTL.msie6?100:0);
			req_busy=false;
			set_c();
		}, x=function() {
			set_c();
			tb_remove();
		};

		return {
			init: init,
			getinfo: getinfo,
			confirm_email: confirm_email,
			update_email: update_email,
			set_c: set_c,
			x: x
		};
	}();
	window.FTUSR=_FTUSR;
}());

(function() {
	window.FTL.hchart_pos=(function() {
		var settings={
			animation: false,
			dict: {
				BOND: 'Fixed<br />Income',
				CASH: 'Cash',
				OPTION: 'Option',
				MF: 'Mutual<br >Fund',
				STOCK: 'Stock/ETF',
				no_positions:'You do not have any positions.',
				title: 'Portfolio % change for today',
				show_cash: 'Include Cash',
				short_ind: '* indicates short positions'
			}
		}, pie_size, pos_chart, self=this, hchart_pos_xml=null, hchart_cash_xml=null, hchart_assets=null, _cache={}, init=function(options) {
				$.extend(settings, options||{});
		}, no_pos=function(msg) {
			$('#pos_view1').html('<table><tr><td style="padding-top:80px;text-align:center;border-bottom:none;">'+msg+'</td></tr></table>').css('height', '195px');
		}, hchart_parse=function(settings, inc_cash) {
			var dict=settings.dict, cache_key=inc_cash? 'all':'nocash';
			if(_.has(_cache, cache_key)) {
				hchart_assets=_cache[cache_key];
				return;
			}
			hchart_assets={cat_data:[], eq_data:[]};
			if(hchart_pos_xml===null && hchart_cash_xml===null) {
				no_pos(settings.dict.no_positions);
				return;
			}
			// parse cash
			var cash_val;
			if(inc_cash) {
				$('balances', hchart_cash_xml).each(function(index, item) {
					cash_val=parseFloat( $('cash_balance', item).text().replace(/,|\$/g, '') )+parseFloat( $('money_market_fund', item).text().replace(/,|\$/g, '') );
					return true;	// since there's only one cash_balance item
				});
			}

			// parse positions
			var negsign='-',
				cats=[],
				eqs=[];
			$('position', hchart_pos_xml).each( function(index, item) {
				var qty=parseFloat($('quantity', item).text());
				var type=$('type', item).text(),
					symbol=$('symbol', item).text(),
					chgpc=$('changepercent', item).text(),
					chgpc_v=parseFloat(chgpc),
					chgpc_css=chgpc_v>0?'#009900':(chgpc_v<0?'#CC0000':'black'),
					px=parseFloat($('price', item).text()),
					mktvalue=0;
				if(type==='OPTION') {
					mktvalue=100*qty*px;
				} else if(type==='BOND') {
					mktvalue=qty*px/100;
				} else {
					mktvalue=qty*px;
				}
				if(mktvalue==0) {
					return true;
				} else if(mktvalue<0) {
					chgpc_css=chgpc_v>0?'#CC0000':(chgpc_v<0?'#009900':'black'),
					mktvalue=-mktvalue;
					chgpc_v=-chgpc_v;
					chgpc=chgpc_v+'';
					symbol='*'+symbol;
				}
				//var type_lbl=dict[type];
				eqs.push( {type: type, symbol: symbol, mktvalue: mktvalue, chgpc:chgpc, chgpc_css: chgpc_css} );
				if(cats.indexOf(type)<0) {
					cats.push(type);
				}
			});
			if(cash_val>0) {
				cats.push('CASH');
				eqs.push({type: 'CASH', symbol: dict.CASH, mktvalue: cash_val});
			}
			if(_.indexOf(cats, 'OPTION')>-1) {
				pie_size=['55%', '45%'];
			} else {
				pie_size=['65%', '55%']
			}

			if( eqs.length<1 ) {
				// todo: show there are no assets
				no_pos(dict.no_positions);
				return;
			}
			// group by type
			var type_eqs=_.groupBy(eqs, function(item) { return item.type; });

			// construct grouped detail arrays
			var colors={
				STOCK: ['rgba(0,80,130,1)', 'rgba(0,80,130,0.7)'], // dark blue
				CASH: ['rgba(64,161,209,1)', 'rgba(64,161,209,0.7)'], // light blue
				OPTION: ['rgba(249,173,65,1)', 'rgba(249,173,65,0.7)'], // yellow
				MF:['rgba(168,166,54,1)', 'rgba(168,166,54,0.7)'], //funds
				BOND: ['rgba(181,181,182,1)','rgba(181,181,182,1)']
			}, detailed_eqs=[], data=[], z=0;
			_.each(cats, function(cat) {
				var cat_eqs=type_eqs[cat];
				var c={
					color: colors[cat][0],
					drilldown: {
						name: dict[cat],
						categories: _.pluck(cat_eqs, 'symbol'),
						data: _.pluck(cat_eqs, 'mktvalue'),
						color: colors[cat][1],
						chgpc: _.pluck(cat_eqs, 'chgpc'),
						chgpc_css: _.pluck(cat_eqs, 'chgpc_css')
					}
				};
				c.y=_.reduce(c.drilldown.data, function(memo, num) { return memo+num;}, 0);
				data.push(c);
				z+=1;
			});

			// build data arrays
			var cat_data=[], eq_data=[];
			for(var i=0, l=data.length;i<l;i++) {
				var datai=data[i];
				cat_data.push( {
					name: dict[cats[i]],
					y: datai.y,
					color: data[i].color
				} );
				var drilldown=datai.drilldown;
				for(var j=0, m=drilldown.data.length; j<m; j++) {
					//var brightness = 0.2 - j/m/5;
					var brightness = 0.2*(1 - j/m);
					eq_data.push({
						name: drilldown.categories[j],
						y: drilldown.data[j],
						color:drilldown.color,
						chgpc:drilldown.chgpc[j],
						chgpc_css:drilldown.chgpc_css[j]
					});
				}
			}
			hchart_assets={
				cat_data: cat_data,
				eq_data: eq_data,
				cats: cats
			};
			_cache[cache_key]=hchart_assets;
		},  store_xml=function(type, str) {
				hchart_assets=null;
				_cache={};
				if(type==='pos') {
					hchart_pos_xml=str;
				} else if(type==='cash') {
					hchart_cash_xml=str;
				}
		};

		// draw the chart
		var render=function(inc_cash) {
			if(typeof inc_cash==='undefined') {
				inc_cash=true;
			}
			hchart_parse(settings, inc_cash);
			if(hchart_assets.cat_data.length<1) {
				no_pos(settings.dict.no_positions);
				return;
			}
			$('#pos_view1').css('height', '236px');
			pos_chart=new Highcharts.Chart({
				title: {
					//text: settings.dict.title
					text: null
				},
				credits: { enabled: false },
				chart: {
					spacingTop:-10,
					renderTo: 'pos_view1',
					type: 'pie'
				},
				plotOptions: {
					pie: { shadow: false, animation:settings.animation }
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.point.name.replace('<br />','') +'</b>: $'+ FTL.addCommas((this.y.toFixed(2)))+ ' ('+(this.percentage).toFixed(2) +' %)';
					},
					style: {
						color:'#000000',
						fontSize:'10px'
					}
				},
				series: [{
					name: 'Assets',
					data: hchart_assets.cat_data,
					size: pie_size[1],
					dataLabels: {
						formatter: function() {
							return this.percentage>5? this.point.name: null
						},
						color: 'white',
						distance: -30
					}
				}, {
					name: 'Breakdowns',
					data: hchart_assets.eq_data,
					size: pie_size[0],
					innerSize: pie_size[1],
					dataLabels: {
						style: {color:'#000000', fontSize:'9px'},
						formatter: function() {
							var chg_info='';
							if(typeof this.point.chgpc !== 'undefined' && this.point.chgpc!='') {
								chg_info='<span style="color:'+this.point.chgpc_css+';">'+this.point.chgpc+'%</span>';
							}
							var nm=this.point.name.replace(/(\d{2}\/\d{2}\/\d{4}) /i, "$1<br />");
							return this.percentage>1.5? nm+' '+chg_info: null;
						},
						distance: 15
					}
				}]
			});

			var note_div=$('#home_positions div.note');
			if(note_div.length<1) {
				$('<div id="short-note" class="note" style="line-height:150%;">'+settings.dict.short_ind+'</div>').insertAfter('#pos_view1');
			}
			if(hchart_assets.cats.length>1 && _.indexOf(hchart_assets.cats, 'CASH')>-1) {
				var cash_box=$('#home_positions div.note input.cash_box');
				if(cash_box.length<1) {
					$('#home_positions div.note').append('<div class="cash_box_wr"><input type="checkbox" checked="checked" class="cash_box" onclick="FTL.hchart_pos.render( $(this).prop(\'checked\') );"></input>'+settings.dict.show_cash+'</div>');
				}
			}
			$('#home_positions .pos_view_title').show();
		};
		return {
			init:init,
			render:render,
			store_xml:store_xml
		};
	})();
	window.FTL.pos_view=function(obj, view_id) {
		var t=$(obj), tp=t.parent(), alink=tp.parent().find('li a');
		alink.removeClass('current');
		t.hasClass('current')||t.addClass('current');
		if(view_id==='0') {
			$('#home_positions .cash_box_wr').hide();
			$('#home_positions .pos_view_title').hide();
			$('#home_positions #short-note').hide();
		} else if(view_id==='1') {
			$('#home_positions .cash_box_wr').show();
			$('#home_positions input.cash_box').prop('checked', true);
			$('#home_positions #short-note').show();
		}
		$('#home_positions div.content div.pos_view').hide();
		$('#home_positions div.content div#pos_view'+view_id).show();
	};
	// total value chart
	window.FTL.hchart_tvc=(function() {
		var self=this, _ajax={
			type:'POST',
			dataType:'json',
			url:'/scripts/charts/tvs.php'
		}, _cache={}, settings={
			retention: 3600*1000, // microseconds to cache
			render_to: 'acct_tvc',
			dict: {
				no_data:'Not enough data to create chart.'
			}
		};
		var expired=function(key) {
			return $.isEmptyObject(_cache) || !(_cache.hasOwnProperty(key))||(new Date().getTime()-_cache[key].ts)>settings.retention;
		},
		autoscale = function(a, steps) {
			var m, max, min, mp, msd, newmax, newmin, range, spacing, tmpstep;
			if (steps == null) {
				steps = 5;
			}
			max = Math.max.apply(null, a);
			min = Math.min.apply(null, a);
			range = max - min;
			tmpstep = range / steps;
			m = Math.floor(Math.log(tmpstep) / Math.log(10));
			mp = Math.pow(10, m);
			if (Math.abs(range) <= 5) {
				spacing = 1;
			} else {
				msd = Math.ceil(tmpstep / mp);
				if (msd > 5) {
					msd = 10;
				} else if (msd > 2) {
					msd = 5;
				} else if (msd > 1) {
					msd = 2;
				}
				spacing = msd * mp;
			}
			newmax = Math.ceil(max / spacing + 0.01) * spacing;
			newmin = newmax - steps * spacing;
			if (newmin > min) {
				newmin -= spacing;
			}
			if(newmin<=0) { newmin=0; }
			return [newmin, newmax];
		};
		var render=function(range, points) {
			var values=_.map(points, function(p) { return p[1]; }), scale=autoscale(values), min=scale[0], max=scale[1];
			var tv_chart=new Highcharts.Chart({
				chart: {
					renderTo: settings.render_to,
					plotBorderWidth:1,
					marginBottom: 20,
					marginTop:5,
					marginLeft:6,
					marginRight:45,
					type: 'area'
				},
				title: {
					text: null
				},
				xAxis: {
					type: 'datetime',
					ordinal: true,
					gridLineWidth: 1,
					minPadding:0,
					maxPadding:0,
					labels: {
						x: 10,
						formatter: function() {
							var fmt=/^(:?6m|1y|2y)$/.test(range)?fmt='%b %Y':'%b %e';
							return Highcharts.dateFormat(fmt, this.value);
						},
						style: {
							fontSize:'9px'
						}
					 }
				},
				yAxis: {
					opposite: true,
					min:min,
					max:max,
					tickInterval: (max-min)/5,
					title: {
						text: null
					},
					labels: {
						formatter: function() {
							if ( this.value >= 1000000 ) return Highcharts.numberFormat(this.value/1000000,2) + "M";
							if ( this.value >= 10000 ) return parseFloat(this.value/1000) + "K";
							return Highcharts.numberFormat(this.value,0);
						},
						style: {
							fontSize:'10px'
						}
					}
				},
				tooltip: {
					formatter: function() {
						return Highcharts.dateFormat('%a, %b %e, %Y', this.x) +': <b>$'+ Highcharts.numberFormat(this.y, 0, ',')+'</b>';
					}
				},
				legend: { enabled: false },
				credits: { enabled: false },
				plotOptions: {
					area: {
						animation:false,
						marker: {
							enabled: false,
							states: {
								hover: {
									enabled: true,
									symbol: 'circle',
									radius: 5,
									lineWidth: 1
								}
							}
						}
					},
					series: {
						fillColor: 'rgba(196, 217, 233, 0.75)'
					}
				},
				series: [{
					name: 'Total Values',
					data: points
				}]
			});
		};
		return {
			init: function(options) {
				$.extend(settings, options||{});
			},
			sw_period: function(_obj) {
				var obj=$(_obj), tp=obj.parent(), tpp=tp.parent(), range=obj.attr('rel'), _d={req:'get_tvs', d:range, c:_cur_tav, a: $('#accountId').val()};
				tpp.find('li').removeClass('current');
				tp.addClass('current');
				if(!/^(1w|1m|3m|6m|1y|2y)$/.test(range)) {return;}
				var key=_d.a+':'+range;
				if(expired(key)) {
					$.extend(_ajax, {
						data: _d,
						success: function(data) {
							set_box_busy('totalValueChart', false);
							if(!data || data.nodata) {
								$('#'+settings.render_to).html('<table><tr><td style="padding-top:80px;text-align:center;border-bottom:none;">'+settings.dict.no_data+'</td></tr></table>');
								return;
							} else {
								var points=data.points;
								render(range, points);
								_cache[key]={points: points, ts: (new Date()).getTime()};
							}
						}
					});
					set_box_busy('totalValueChart', true);
					$.ajax(_ajax);
				} else {
					var _p=_cache[key].points;
					// update current val
					_p[_p.length-1][1]=parseFloat(_d.c);
					render(range, _p);
				}
			}
		};
	})();
})();
( function() {
	window.FTL.mkt=(function() {
		var _ftlc, tm_val=900000, _in_progress=false, _instid='', _qs={}, last_init=0, api_base_url, culture, proxy_url, ms_env, profile_url, email, default_ajax={url: '/scripts/ms/get_gla.php', type: 'POST', dataType: 'json'}, indices_url='&module=chart&toPush=1&autocp=0&hideModules=head,foot,shareChart,display,drawing,fundamental,compare,indicators,range&statePara=%7BshowVolume:false,chartCursor:1,isShowTimeSlider:false,indicatorsData:%7BPrevClose:%7Bshow:true%7D%7D%7D&symbol=', _symbol_type;
		function _timeout() {
			return (new Date()).getTime()-last_init>tm_val;
		}

		function _cb(cb) {
			cb||(cb=$.noop);
			QSAPI.init(_instid, _qs, function() {
				cb();
				last_init=(new Date()).getTime();
			})
		}

		function _init(opts) {
			_ftlc=opts.lc||'en-us';
			culture=_ftlc.replace('-', '_');
			api_base_url=opts.api_base_url+'&lang='+culture||'';
			_qs=opts.qs||{};
			_qs.proxyurl= location.protocol + '//' + location.host+'/scripts/ms/qsapi_proxy.html';
			_instid=opts.instid;
			if(typeof opts.cb==='function') {
				_cb(opts.cb);
			}
		}

		function _render_cheatsheet(opts) {
			opts||(opts={});
			opts.lang||(opts.lang={
				lbl_mkt_cap: 'Mkt Cap'
				,lbl_full_report: 'full report'
				,lbl_div_yield: 'Div & Yield'
				,lbl_pe_ttm: 'P/E (ttm)'
				,lbl_prev_close: 'Prev Close'
				,lbl_eps_ttm: 'EPS (ttm)'
				,lbl_52wk_range: '52wk Range'
				,lbl_msrating: 'Morningstar Rating'
				,new_na: 'News headlines are not available for mutual funds.'
			});
			var _tpl_top=doT.template('{{?it.symbol}}<span><strong>{{=it.symbol}}</strong>: {{=it.exchange}}</span><p>{{!it.symbol_name}}</p>{{?}}'), _tpl_btm=doT.template('<span>{{!it.lbl_msrating}}:</span><div class="{{=it.rating_str}}"></div><a href="javascript:void(0)" onclick="full_snprpt(\'{{!it.symbol}}\')">{{!it.lbl_full_report}}</a><table><tbody><tr><td>{{!it.lbl_mkt_cap}}:</td><th>{{!it.mkt_cap||"-"}}</th><td>{{!it.lbl_div_yield}}:</td><th>{{=it.div_yield||"-"}}</th></tr><tr><td>{{!it.lbl_pe_ttm}}:</td><th>{{=it.pe_ttm||"-"}}</th><td>{{!it.lbl_prev_close||"-"}}:</td><th>{{=it.prev_close||"-"}}</th></tr><tr><td>{{!it.lbl_eps_ttm||"-"}}:</td><th>{{=it.eps_ttm||"-"}}</th><td>{{!it.lbl_52wk_range}}:</td><th>{{?it.high_52wk}}{{=it.low_52wk}}-{{=it.high_52wk}}{{??}} {{?}}</th></tr></tbody></table>');
			$.ajax({ url: '/scripts/ms/get_eq_info.php', type: 'POST', dataType: 'json', data: {req: 'get_sym_stats', symbol: opts.symbol}, success: function(d) {
				if(!d.symbol) { return; }
				d.exchange=FTL.mktmap[d.exchange]||d.exchange;
				d.mkt_cap=FTL.helper.nbr_fmt(d.mkt_cap);
				d.rating_str=d.rating? 'r_star'+d.rating: 'r_starnr';
				var _all=_.extend({}, opts.lang, d);
				$('#cheatsheetsymbol').html( _tpl_top(_all) );
				$('#sandp').html( _tpl_btm(_all) );
				if(d.symbol_type=='e') {
					FTL.mkt.render_news('cheatsheet-news', {symbol: d.symbol, limit:10});
				} else {
					var new_na=opts.lang.new_na;
					$('#cheatsheet-news').html('<div class="mu-wr">'+new_na+'</div>');
				}
				if(d.symbol_type) {
					_symbol_type=d.symbol_type;
					$('#cheat_orderbar_main .graph li.tabn:first a').trigger('click');
				}
			}});
		}
		function _render_symbol_headlines(id, opts) {
			$.ajax({
				url: '/scripts/ms/news-io.php',
				data: { req_id: 'headlines_xml', limit: opts.limit||10, symbol:opts.symbol },
				type: 'POST',
				dataType: 'json',
				success: function(d) {
					$('#'+id).text(
						_.map(d, function(a) { return '- '+a.published_at+':'+a.title; } ).join('\n\n')
					);
				}
			})
		}
		function _render_news(div_id, opts) {
			opts||(opts={});
			opts.set_busy||(opts.set_busy=$.noop);
			opts.set_free||(opts.set_free=$.noop);
			opts.lang||(opts.lang={
				headline_ttl: 'Market Updates',
				view_more: 'View More'
			});
			if(typeof opts.limit==='undefined') { opts.limit=5; }
			if(!div_id) { return; }
			var tpl=doT.template('{{?it.show_head}}<h2>{{!it.lang.headline_ttl}}</h2>{{?}}'
				+'<ul class="mu-wr">'
				+'{{~ it.articles :a:i}}'
				+'	<li><a class="hnews" href="javascript:void(0);" title="{{!a.title}}" onClick="FTL.mkt.open_news(\'{{=a.resource_id}}\', this);">{{?a.source_name!="Stock Market Update"}}{{!a.source_name}} - {{?}}{{!a.title}}</a> <label class="ts">{{=a.published_at}}</label></li>'
				+'{{~}}'
				+'</ul>{{?it.show_foot}}<div class="ft"><a class="more stdlink" href="/content/researchtools/rt-market/news/" id="movers_more">{{!it.lang.view_more}}</a></div>{{?}}'
			);
			opts.set_busy();
			$.ajax({
				url: '/scripts/ms/news-io.php',
				data: { req_id: 'headlines_xml', limit: opts.limit, symbol: opts.symbol||'' },
				type: 'POST',
				dataType: 'json',
				success: function(d) {
					$('#'+div_id).html(
						tpl(_.extend({}, opts, {articles: _.sortBy(d, function(e) { return -e.ts; }) }))
					);
					opts.set_free();
				}
			})
		}
		function _open_news(id, t) {
			var req=$.param({ req_id:'news_piece', resource_id:id, _: (new Date()).getTime() });
			tb_show($(t).attr('title'), '/scripts/ms/news-io.php?'+req);
		}
		function _get_module_url(module, headless) {
			var _b=headless?'':api_base_url;
			switch(module) {
				case 'gla':
					return _b+'&module=gla&needTokens=D1904,D1900,D1901,D1902,D1903';
					break;
				case 'calendars':
					return _b+'&module=calendars&tabID=4';
					break;
				case 'barometer':
					return _b+'&module=market&submodule=barometer&width=220&showTitle=false';
					break;
				case 'sectors':
					return _b+'&module=market&submodule=sectors&width=220&height=350';
					break;
				case 'indices':
					return _b+indices_url;
				case 'sector_map':
					return _b+'&module=sectorHeatmap&width=270';
				case 'market_map':
					return _b+'&module=heatmap&index=28.10.XIUSA0010W&showSectorFilter=false&showIndexList=true&leftSideWidth=160&frequency=DAY1';
				case 'bond_mkt':
					return _b+'&module=market&submodule=bond';
					break;
				case 'news':
					return _b+'&module=news&symbolType=all&format=html&htmlTabable=1&currentViewID=-4';
					break;
			}
		}
		function _init_param(cb) {
			function do_init(cb) {
				_in_progress=true;
				$.ajax({
					url:'/scripts/ms/init_param.php',
					dataType: 'json',
					type: 'POST',
					data: { req: 'init_param' },
					success: function(d) {
						_in_progress=false;
						if(d && 'error' in d) {
							alert(d.error);
							return;
						}
						if(typeof cb==='function') {
							d.cb=cb;
							_init(d);
						}
					}
				});
			}
			if(!_timeout()) { _cb(cb); return; }
			if(_in_progress) {
				var _c=0, _limit=50;
				setTimeout(function check_init_ready() {
					_c+=1;
					if(_c>_limit) {
						do_init(cb);
						return;
					}
					if(!_in_progress &&!_timeout()) {
						_cb(cb);
					} else {
						setTimeout(check_init_ready, 300)
					}
				}, 300);
			} else {
				do_init(cb);
			}
		}
		function _render_indices(opts) {
			opts||(opts={});
			opts.set_busy||(opts.set_busy=$.noop);
			opts.set_free||(opts.set_free=$.noop);
			opts.set_busy();
			_init_param( function() {
				_render_mod_wrapper(opts.id||'id-mkt-index', indices_url+opts.symbol, {width:opts.width||'460',height:opts.height||'300'});
				opts.set_free();
			});
		}
		function _render_mkt_indices(opts) {
			opts||(opts={});
			opts.set_busy||(opts.set_busy=$.noop);
			opts.set_free||(opts.set_free=$.noop);
			opts.set_busy();
			opts.symbol=opts.symbol||$('#id-mkt-index').parent('.bx').find('.tabs-wr .current').first().data('cat');
			opts.range=opts.range||$('#id-mkt-index').parent('.bx').find('.tabs-wr .current').eq(1).data('cat');
			var indices_url='&module=chart&toPush=1&autocp=0&hideModules=head,foot,shareChart,display,drawing,fundamental,compare,indicators,range&statePara=%7BzRange:'+opts.range+',showVolume:false,chartCursor:1,isShowTimeSlider:false,indicatorsData:%7BPrevClose:%7Bshow:true%7D%7D%7D&symbol='+opts.symbol;
			_init_param( function() {
				_render_mod_wrapper(opts.id||'id-mkt-index', indices_url, {width:opts.width||'372',height:opts.height||'300'});
				opts.set_free();
			});
		}
		function _render_tc(range) {
			var sym=$.trim($('#quoteSymbol').val());
			if(sym!=='') {
				var _u=_symbol_type==='m'?'&module=chart&ty=8&toPush=1&autocp=0&minWidth=100&minHeight=50&hideModules=foot,shareChart,display,drawing,fundamental,compare,indicators,range&w=174&h=92&statePara=%7BzRange:'+range+',chartCursor:3,isShowTimeSlider:false%7D&view=simple&symbol=126.1.'+sym+'&width=174&fixHeight=false&height=92&onHeightChange=QSAPI_CB_onHeightChange_QSAPI_IFRAME_1&onLoad=QSAPI_CB_onLoad_QSAPI_IF&ty=8':'&module=chart&toPush=1&autocp=0&minWidth=100&minHeight=50&hideModules=foot%2cshareChart%2cdisplay%2cdrawing%2cfundamental%2ccompare%2cindicators%2crange&w=174&h=92&statePara=%7bzRange:'+range+'%2cshowVolume:false%2cchartCursor:3%2cisShowTimeSlider:false%2cindicatorsData:%7bPrevClose:%7bshow:true%7d%7d%7d&view=simple&symbol=126.1.'+sym;
				_init_param( function() {
					_render_mod_wrapper('orderbargraph', _u, {width:'174', height:'92'});
				});
			}
		}
		function _render_stk_hl(div_id, cat, full) {
			if(typeof full==='undefined') {
				full=0;
			}
			$.ajax({
				url:'/scripts/ms/get_hl.php',
				data: {full:full, cats:[cat], top:5},
				dataType: 'json',
				type: 'POST',
				success: function(d) {
					$('#'+div_id+' .stks-'+cat+' .tbl-res').dataTable( {
						iDisplayLength: -1,
						aaData: d[cat],
						bSort: false,
						bDestroy: true,
						aoColumns: [
							{ mData:'symbol', mRender: FTL.helper.qtsym }
							,{ mData:'name' }
							,{ mData:'price', sClass: 'number' }
							,{ mData:'highlow', sClass: 'number' }
						],
						sDom: 't'
					});
				}
			});
		}
		function _render_all_ind(d) {
			_.each(['djia', 'sp500', 'nasdaq'], function(ele) {
				var _c=$('#qt-top-search .mkt-ind-qt-'+ele), ind=d[ele], cls=ind.cls, qt_cls=(cls==='green'?'quote_up green':(cls==='red'?'quote_down red': ' ')), _h=ind.last+'<div class="'+qt_cls+'" style="display: inline; padding-left: 16px; margin-left: 3px;">'+ind.chg+'</div>';
				_c.html(_h);
			});
		}
		function _get_all_ind(cb) {
			var _ajax=$.extend({}, default_ajax, {
				data: {req_id: 'all:index'},
				success: function(d) {
					if(!_.isEmpty(d) && typeof(cb)==='function') {
						cb(d);
					}
				}
			});
			$.ajax(_ajax);
		}
		function _render_gla(div_id, opts) {
			opts||(opts={});
			var cols=opts.cols||[
				{sClass:'ta_left', mData: 'sym', mRender: function(data, type, row) { return '<a href="javascript:void(0);" class="qbar" data-ticker="'+data+'">'+data+'</a>'; }}
				,{sType: 'numeric', sClass:'number', mData: 'px', mRender: FTL.helper.dt_nbr_fmt2}
				,{sClass:'number', mData: 'chg', mRender: FTL.helper.dt_nbr_fmt2}
				,{sType:'percent', sClass:'number', mData: 'chg_pct', mRender: FTL.helper.dt_nbr_fmt2}
				,{sClass:'number view', mData: 'vol',mRender: FTL.helper.dt_nbr_fmt2}
			], set_busy=opts.set_busy||$.noop, set_free=opts.set_free||$.noop;
			var m=$('#'+div_id+ ' .stat-gla-mkt').val(), c=$('#'+div_id+' .stat-gla-cat li.current').data('cat')||'actives', s_dict={actives:[[4, 'desc']], gainer:[[2,'desc']], loser:[[2,'asc']],gainer_pct:[[3,'desc']], loser_pct:[[3,'asc']]}, s=s_dict[c]||[[0,'asc']], tbl_id=div_id+'-dtbl';
			var _ajax=$.extend({}, default_ajax, {
				data: {req_id: m+':'+c},
				success: function(d) {
					set_free.call();
					$('#'+div_id+' .tbl-res').dataTable({
						bDestroy: true,
						aaData: d,
						sDom: 't',
						aoColumns: cols,
						aaSorting: s,
						fnRowCallback: function(nRow, aData, iDisplayIndex) {
							var cls=aData.cls||false;
							cls && $('td:eq(2),td:eq(3)', nRow).addClass(cls);
							return nRow;
						}
					});
				}
			});
			set_busy.call();
			$.ajax(_ajax);
		}
		function _render_mod_wrapper(div_id, url, o) {
			var _o=$.extend({}, {width:'760', fixHeight:false}, o);
			$('#'+div_id).empty();
			_init_param(function() {
				QSAPI.createWidget(
					document.getElementById(div_id),
					api_base_url+url,
					_o
					,{ onTickerClick: 'ms_ticker' }
				);
			});
		}
		function _render_gla_full(div_id) {
			var exch={amex:'&exch=1', nasdaq:'&exch=19', nyse:'&exch=14', combined:''}, m=$('#id-mkt-gla-mkt-full').val(), ex=exch[m]||'';
			_render_mod_wrapper(div_id, '&module=gla'+ex+'&needTokens=D1904,D1900,D1901,D1902,D1903');
		}
		function _render_cal_full(div_id, view) {
			var view_param='&tabID='+view||'4';
			_render_mod_wrapper(div_id, '&module=calendars'+view_param);
		}
		function _render_sec_full(div_id) {
			_render_mod_wrapper(div_id, '&module=sectorsIndustries');
		}
		function _render_news_full(div_id, ticker, view) {
			var view_param='&currentViewID='+view||'-4';
			var _s=(typeof ticker!=='undefined'&&ticker!=='')?'&module=news&symbol=126.1:'+ticker.toUpperCase()+'&format=html&htmlTabable=1':'&module=news&symbolType=all&format=html&htmlTabable=1'+view_param;
			_render_mod_wrapper(div_id, _s);
		}
		function _render_heatmap(div_id) {
			_render_mod_wrapper(div_id, _get_module_url('market_map', true), {width: '760', height: '600', fixHeight: true});
		}
		function _render_charts_full(div_id, eq_type, ticker) {
			if(eq_type=='') {
				alert('Error: Invalid ticker.');
				return;
			}
			if(eq_type=='m') {
				var symbol=ticker?ticker:'FMAGX',_s='&module=chart&ty=8&autocp=0&symbol='+symbol;
				_render_mod_wrapper(div_id, _s, {width:'770', fixHeight:false});
			} else {
				var symbol=ticker?ticker:'AAPL', _s='&module=chart&submod=panel&autocp=0&symbol=126.1.'+symbol;
				_render_mod_wrapper(div_id, _s, {height:'530', width:'770', fixHeight:true});
			}
		}
		function _render_quote_box(div_id, ticker, mode, from_lbl, to_lbl) {
			var _url='&module=quote&autoComplete=0&hasHead=false&removeable=0&showSetting=0&symbol='+ticker;
			if(mode==='brief') {
				_url+='&dataPointList=LastPrice,BidPrice,BidSize,AskPrice,AskSize,HighPrice,LowPrice,Volume,ClosePrice,OpenPrice,st168,st169,st109';
				_render_mod_wrapper(div_id, _url, {width:'956', fixHeight:false});
			} else {
				_render_mod_wrapper(div_id, _url, {width:'956', fixHeight:false});
			}
			var to_mode=mode==='brief'?'extended':'brief';
			$('#'+div_id).prepend(_.template('<a class="detail-quote-toggle" href="javascript:void(0);" style="display:block;position:absolute;top:0;right:0;padding:0 5px;font-size:11px;background-color:#eee;" onclick="FTL.mkt.render_quote_box(\'detail-quote-box\', \'<%= ticker %>\', \'<%= to_mode %>\', \'<%= from_lbl %>\', \'<%= to_lbl %>\')"><%= to_lbl %></a>')({ticker: ticker, to_mode: to_mode, cb:'', from_lbl:to_lbl, to_lbl:from_lbl}));
		}
		function _render_modules(_lc) {
			// indices
			_render_mkt_indices({symbol: '30.10.!DJI'});
			_init_param(function() {
				// news
				QSAPI.createWidget(
					document.getElementById('id-mkt-news'),
					_get_module_url('news'),
					{
						width:'100%',
						height:'400',
						fixHeight:true
					}
				);
				// calendars
				QSAPI.createWidget(
					document.getElementById('id-mkt-cal'),
					_get_module_url('calendars'),
					{
						width:'100%',
						height:'200',
						fixHeight:true
					}
				);
			});
			// gla
			_render_gla('id-mkt-actives');
			_render_gla('id-mkt-gla');
			// market commentary, latest anaylst reports, economic insights
			require(['/js/arccomp/arc.js'], function(arc) {
				FTL.arc.fetch(_lc,['mc', 'stocks', 'etfs', 'ei', 'qo', 'wh']);
			});
		}
		function _comp_stks() {
			$('#id-stks-comp-box .comp-fd').html('&nbsp;');
			var sym_arr=[];
			// gather symbol info
			$('#id-stks-comp-box .comp-inp').each( function() {
				var o=$(this), id=o.attr('id'), sym=$.trim(o.val()),  m=/^comp-inp-sym(\d+)$/.exec(id);
				if(sym!=='') {
					sym=sym.toUpperCase();
					o.val(sym);
					sym_arr.push({sym: sym, col: m[1]});
				}
			});
			if(sym_arr.length>1) {
				$.ajax({ url: '/scripts/ms/comp-io.php', data: { sym_arr: sym_arr} , dataType: 'jsonp', type: 'POST'});
			}
		}
		function _render_comp_res(d) {
			// error handling
			if('error' in d) {
				alert(d.error);
				return;
			}
			_.each(d.data, function(it) {
				var col=it.col;
				_.each(it, function(v, k) {
					if(k==='col') { return true; }
					$('#comp-'+k+'-sym'+col).html(v);
				});
			});
		}
		function _render_ar_page(_lc) {
			_init_param( function() {
				// market barometer
				QSAPI.createWidget(
					document.getElementById('id-ar-sectors'),
					_get_module_url('sector_map'),
					{
						width:'369',
						height: '405',
						fixHeight:true
					}
				);
				// market sector
				QSAPI.createWidget(
					document.getElementById('id-ar-bond'),
					_get_module_url('bond_mkt'),
					{
						width:'378',
						fixHeight:false
					}
				);
			});
			require(['/js/arccomp/arc.js'], function(arc) {
				FTL.arc.fetch(_lc,['wh','str']);
			});
			require(['/js/arccomp/main.js'], function(arccomp) {
				FTL.arccomp.init(_lc);
				FTL.arccomp.setup_dt(true);
			});
		}
		function _render_map_page() {
			_render_heatmap('id-mkt-map-full');
			_init_param( function() {
				// market barometer
				QSAPI.createWidget(
					document.getElementById('id-mkt-barometer'),
					_get_module_url('barometer'),
					{
						width:'372',
						fixHeight:false
					}
				);
				// market sector
				QSAPI.createWidget(
					document.getElementById('id-mkt-sectors'),
					_get_module_url('sectors'),
					{
						width:'378',
						fixHeight:false
					}
				);
			});
		}
		function _qt_redi(_sym) {
			if(typeof _sym==='undefined' || !_sym) { return; }
			var _dict={ s:'rt-stocks', e:'rt-etfs', m:'rt-mf', c: 'rt-etfs'};
			$.ajax({url: '/scripts/util/eq_type.php', data: {req: 'get_eq_type', sym: _sym}, type: 'POST', dataType: 'json', success: function(d) {
				if(d) {
					if('error' in d) { alert(d.msg); return; }
					if('eq_type' in d)  {
						var _tg=_dict[d.eq_type]||'';
						if(_tg) {
							headerChange('/content/researchtools/'+_tg+'/quicktake/?ticker='+_sym);
						} else {
							alert( FTL.invalid_symbol_dict[ _get_ftlc() ] );
						}
					}
				}
			}});
		}
		function _render_qt_ticker_panel(ticker_info, lang) {
			$('#id-quicktake-ticker').val(ticker_info.symbol);
			lang||(lang={
				wl_lbl: 'Add to Watchlist',
				oc_lbl: 'Option Chain',
				buy_lbl: 'BUY',
				sell_lbl: 'SELL',
				gq_lbl: 'Get Quote',
				prospectus_lbl: 'Prospectus & Reports',
				fundlist_lbl: 'Fund List'
			});
			var wr=$('#ticker-panel');
			switch(ticker_info && ticker_info.eq_type) {
				case 's':
				case 'e':
					ticker_info.exchange=FTL.mktmap[ ticker_info.exchange ]||'';
					var _t=doT.template(
						'<li class="symbol_name lft mr10">{{=it.symbol_name}}</li><li class="mr10 lft symbol">{{?it.exchange}}{{=it.exchange}}:{{?}}{{=it.symbol}}</li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'stockorder\', \'{{=it.symbol}}\', \'B\');" class="actionbtn link_buy link_qt">{{=it.buy_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'stockorder\', \'{{=it.symbol}}\', \'S\');" class="actionbtn link_sell link_qt">{{=it.sell_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'atws\', \'{{=it.symbol}}\');" class="link_wl link_qt">{{=it.wl_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'load_opc\', \'{{=it.symbol}}\');" class="link_oc link_qt">{{=it.oc_lbl}}</a></li>'
						+'<li class="lft"><a href="javascript:void(0)" data-ticker="{{=it.symbol}}" class="link_gq link_qt qbar">{{=it.gq_lbl}}</a></li>'
					);
					wr.html(_t(_.extend({}, lang, ticker_info)));
					break;
				case 'm':
					var _t=doT.template(
						'<li class="symbol_name lft mr10">{{=it.symbol_name}}</li><li class="mr10 lft symbol">{{=it.symbol}}</li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'fundorder\', \'{{=it.symbol}}\', \'B\');" class="actionbtn link_buy link_qt">{{=it.buy_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'fundorder\', \'{{=it.symbol}}\', \'S\');" class="actionbtn link_sell link_qt">{{=it.sell_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="javascript:void(0)" onclick="FTL.qt_action(\'atwm\', \'{{=it.symbol}}\');" class="link_wl link_qt">{{=it.wl_lbl}}</a></li>'
						+'<li class="lft mr10"><a href="http://doc.morningstar.com/docdetail.aspx?clientid=firstrade&key=7e268e849b67fc55&investmenttype=1&ticker={{=it.symbol}}" class="link_prospectus link_qt" target="_blank">{{!it.prospectus_lbl}}</a></li>'
						+'<li class="lft"><a href="/content/researchtools/rt-mf/list/" class="stdlink link_qt">{{!it.fundlist_lbl}}</a></li>'
					);
					wr.html(_t(_.extend({}, lang, ticker_info)));
					break;
			}
		}

		function _qt_ticker_panel(eq_type, ticker, lang) {
			$.ajax({url: '/scripts/ms/get_eq_info.php', data: {req: 'get_eq_info', eq_type: eq_type, sym: ticker}, type: 'POST', dataType: 'json', success: function(d) {
				_render_qt_ticker_panel(d, lang);
			}});
		}
		function _get_ftlc() {
			return _ftlc;
		}
		return {
			get_ftlc: _get_ftlc,
			render_quote_box: _render_quote_box,
			render_modules: _render_modules,
			render_gla: _render_gla,
			render_gla_full: _render_gla_full,
			render_cal_full: _render_cal_full,
			render_sec_full: _render_sec_full,
			render_news_full: _render_news_full,
			render_charts_full: _render_charts_full,
			render_stk_hl: _render_stk_hl,
			get_all_ind: _get_all_ind,
			render_all_ind: _render_all_ind,
			open_news: _open_news,
			render_news: _render_news,
			render_cheatsheet: _render_cheatsheet,
			render_tc: _render_tc,
			render_symbol_headlines: _render_symbol_headlines,
			render_comp_res: _render_comp_res,
			comp_stks:_comp_stks,
			init: _init,
			init_param: _init_param,
			render_indices: _render_indices,
			render_mkt_indices: _render_mkt_indices,
			render_map_page: _render_map_page,
			render_ar_page: _render_ar_page,
			qt_redi: _qt_redi,
			qt_ticker_panel: _qt_ticker_panel
		};
	})();
})();

FTL.Eqtype=(function(opts) {
	opts||(opts={});
	var cache={}, last_search_cat, last_eq_type='s';
	function _get_eq_type(sym, cb) {
		if(!sym) { return; }
		var eq_type;
		if( _.has(cache, sym) ) {
			eq_type=cache[sym];
			typeof cb==='function' && cb(eq_type);
		} else {
			$.ajax({
				url: '/scripts/util/eq_type.php',
				type: 'POST',
				data: { sym: sym },
				dataType: 'json',
				success: function(d) {
					if(d) {
						eq_type=d.eq_type||''
						if(eq_type) {
							cache[sym]=eq_type;
							typeof cb==='function' && cb(eq_type);
						}
					}
				}
			});
		}
	}
	return {
		get_eq_type: _get_eq_type,
		sw_eq_type: function(e) {
			if(e!==last_eq_type) {
				last_eq_type=e;
				FTL.Eqtype.set_default_cat();
			}
		},
		toggle_search_cat: function(e) {
			if(/^(?:s|e|m|c)$/.test(last_eq_type)) {
				var l=$('#id-search-cat-wr .search-cat-'+last_eq_type);
				if(l.is(':visible')) {
					l.hide();
				} else {
					var ref=$('#id-searchcategory'), o=ref.offset(), wr=$('#id-search-cat-wr');
					$('.search-cat', wr).hide();
					l.show();
					wr.css({ 'left': (o.left-4)+'px', 'top': o.top+21+'px' });
					e.stopPropagation();
				}
			}
		},
		set_last_cat: function() {
			var l=$(this), dest=l.data('dest')||'';
			if(dest) {
				last_search_cat=dest;
				$('#id-searchcategory').html(l.html());
				l.parent().hide();
			}
		},
		set_default_cat: function() {
			if(last_eq_type) {
				var o=$('#id-search-cat-wr .search-cat-'+last_eq_type+' label:first');
				last_search_cat=o.data('dest');
				$('#id-searchcategory').html(o.html());
			}
		},
		search: function() {
			if(!last_search_cat) {
				var o=$('#id-search-cat-wr .search-cat-s label:first');
				last_search_cat=o.data('dest');
				$('#id-searchcategory').html(o.html());
			}
			if(last_search_cat) {
				var t=$.trim( $('#id-symlookup').val() ).toUpperCase();
				if(t!='SYMBOL OR COMPANY'&&t!='代號或公司名稱'&&t!='代号或公司名称') {
					$.ajax({url: '/scripts/util/eq_type.php', data: {req: 'get_eq_type', sym: t}, type: 'POST', dataType: 'json', success: function(d) {
						if(d) {
							if('eq_type' in d)  {
								if(d.eq_type!='') {
									headerChange(last_search_cat+$.param({
										ticker: t
									}));
								} else {
									alert( FTL.invalid_symbol_dict[ FTL.mkt.get_ftlc() ] );
								}
							}
						}
					}});
				}
			}
		}
	}
})();

FTL.helper.home_gla=function(opts) {
	FTL.mkt.render_gla('movers',
		_.extend( { set_busy: function() {set_box_busy(['movers'], true); }, set_free: function() {set_box_busy(['movers'], false);} }, (typeof opts!='undefined'?opts:null) )
	);
};
FTL.helper.render_db_indices=function(sym) {
	FTL.mkt.render_indices({set_busy: function() {set_box_busy(['marketOverview'], true); }, set_free: function() {set_box_busy(['marketOverview'], false);}, width:'353', height:'206', symbol: sym, id: 'id-db-index'});
};
FTL.helper.render_db_news=function(opts) {
	FTL.mkt.render_news('news-content',_.extend( {show_head: 0, show_foot: 1, set_busy: function() {set_box_busy(['news'], true); }, set_free: function() {set_box_busy(['news'], false);}}, (typeof opts!='undefined'?opts:null)));
};
