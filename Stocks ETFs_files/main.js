(function() {
	var is_msie=$.browser.msie;
	var gc_clicked=false, busy_tmr=null, gc_btn, gc_timeout=12000;
	var $expDates, e_len=0;
	var $ocs =''; 
	var $stockPrice = 0.00;
	var $optionChains;
	var $strikeInterval = -1;
	var $lastStrike = -1;
	var $section='cp'; // default to calls/puts
	var	ft_locale = $.cookie('ft_locale') || 'en-us';
	var lc_select, lc_symbol, lc_usym, lc_call, lc_put, lc_calls, lc_puts, lc_bear_call, lc_bull_call, lc_bear_put, lc_bull_put, lc_weeklys, lc_weekly, lc_quarterly, lc_standard, lc_non_standard, lc_open, lc_close, lc_ask, lc_bid, lc_basize, lc_chg, lc_change, lc_vol, lc_volume, lc_strike, lc_interest, lc_interest_rate, lc_vertical_call_spread, lc_vertical_put_spread, lc_open_ask, lc_open_bid, lc_close_ask, lc_close_bid, lc_short_strangle, lc_long_strangle, lc_restore_defaults, lc_30day_hv, lc_volatility, lc_real_time, lc_delayed, lc_stock_price, lc_greeks_analytical,lc_prompt_select,lc_zero_prompt,lc_invalid_symbol;
	var odb_option;
	var top_bar,cr;
	var cp_div, strangle_div, st_div, vcs_div, vps_div, ccs_div, cps_div, greeks_div, cp_tr, st_tr, vcs_tr1, vcs_tr2, vps_tr1, vps_tr2;
	

	if(!window.OPC) window.OPC={};

	function zp() {
		alert(lc_zero_prompt);
	}
	function prompt_empty() {
		var p=get_section();
		var tbl=$('table.start', p),
			h='<table class="start" style="display:none;"> <tbody><tr> <td><span>'+lc_prompt_select+'</span></td> </tr></table>';
		if( tbl.length<1 ) {
			p.append(h);
		} else {
			tbl.replaceWith(h).show();
		}
		tbl=$('table.start', p);
		$('#opc_expDates li.current').length<1 && tbl.show() || tbl.hide();
	}
	function prompt_symbol() {
		var p=get_section();
		var tbl=$('table.start', p),
			h='<table class="start" style="display:none;"> <tbody><tr> <td><span>'+lc_prompt_symbol+'</span></td> </tr></table>';
		if( tbl.length<1 ) {
			p.append(h);
		} else {
			tbl.replaceWith(h);
		}
		$('table.start', p).show();
	}
	function sh_arrow(i) {
		if(e_len<=9) {
			return;
		}
		var la=$('#opc_left_arrow'), ra=$('#opc_right_arrow');
		if(i<=0) {
			// hide left
			la.hasClass('left_gray')||la.addClass('left_gray');
			ra.hasClass('right_gray')&&ra.removeClass('right_gray');
		} else if(i>=e_len-1||i+9>=e_len) {
			// hide right
			ra.hasClass('right_gray')||ra.addClass('right_gray');
			la.hasClass('left_gray')&&la.removeClass('left_gray');
		} else {
			la.hasClass('left_gray')&&la.removeClass('left_gray');
			ra.hasClass('right_gray')&&ra.removeClass('right_gray');
		}
	}
	function get_section() {
		switch($section) {
			case 'cp': return cp_div;
			case 'g': return greeks_div;
			case 'st': return st_div;
			case 'vcs': return vcs_div;
			case 'vps': return vps_div;
			case 'ccs': return ccs_div;
			case 'cps': return cps_div;
			default: cp_div.show();
		}
	}
	function update_comp_chg() {
		vcs_change();
		vps_change();
		ccs_change();
		cps_change();
	}
	function is_monthly(date_str) {return (0|((new Date(date_str)).getDate()-1)/7)==2;}
	function isEmpty(obj) { for(var prop in obj) { if(obj.hasOwnProperty(prop)) return false; } return true; }
	function gen_class(a) {
		var t='';
		for(var i=0, _l=a.length;i<_l;i++) {
			if(a[i]!='') { t+=t?' '+a[i]:a[i]; }
		}
		return t?' class="'+t+'"':'';
	}
	function bl( trans, usym, expdate, strike, cp ) {
		return "{trans:'"+trans+"',usym:'"+ usym+"',expdate:'"+expdate+"',strike:'"+strike+"',cp:'"+cp+"'}";	
	}

	function init(dict) {
		gc_btn=$('#optionChain .opc_go_btn');
		cp_div=$('#opc_calls_puts');
		strangle_div=$('#opc_strangle');
		st_div=$('#opc_straddle');
		vcs_div=$('#opc_VerticalCallSpread');
		vps_div=$('#opc_VerticalPutSpread');
		ccs_div=$('#opc_CalendarCallSpread');
		cps_div=$('#opc_CalendarPutSpread');
		greeks_div=$('#opc_greeks');
		lc_select=dict.select||'Select';
		lc_symbol=dict.symbol||'Symbol';
		lc_usym=dict.usym||'Underlying Symbol';
		lc_call=dict.call||'Call';
		lc_calls=dict.calls||'CALLS';
		lc_put=dict.put||'Put';
		lc_puts=dict.puts||'PUTS';
		lc_bear_call=dict.bear_call||'Bear Call';
		lc_bull_call=dict.bull_call||'Bull Call';
		lc_bear_put=dict.bear_put||'Bear Put';
		lc_bull_put=dict.bull_put||'Bull Put';
		lc_weekly=dict.weekly||'Weekly';// might not need
		lc_monthly=dict.monthly||'Monthly';
		lc_quarterly=dict.quarterly||'Quarterly';
		lc_standard=dict.standard||'Standard';
		lc_non_standard=dict.non_standard||'Non-Standard';
		lc_open=dict.open||'Open';
		lc_close=dict.close||'Close';
		lc_ask=dict.ask||'Ask';
		lc_bid=dict.bid||'Bid';
		lc_basize=dict.basize||'BxA Size';
		lc_last=dict.last||'Last';
		lc_chg=dict.chg||'Chg';
		lc_change=dict.change||'Change';
		lc_vol=dict.vol||'Vol';
		lc_volume=dict.volume||'Volume';
		lc_vol=dict.volume||'Vol';
		lc_strike=dict.strike||'Strike';
		lc_interest=dict.interest||'Interest';
		lc_interest_rate=dict.interest_rate||'Interest Rate';
		lc_vertical_call_spread=dict.vertical_call_spread||'Vertical Call Spread';
		lc_vertical_put_spread=dict.vertical_put_spread||'Vertical Put Spread';
		lc_open_ask=dict.open_ask='Open (Ask)';
		lc_open_bid=dict.open_bid='Open (Bid)';
		lc_close_ask=dict.close_ask='Close (Ask)';
		lc_close_bid=dict.close_bid='Close (Bid)';
		lc_short_strangle=dict.short_strangle||'SHORT STRANGLE';
		lc_long_strangle=dict.long_strangle||'LONG STRANGLE';
		lc_restore_defaults=dict.restore_defaults||'Restore Defaults';
		lc_30day_hv=dict.thirty_day_hv||'30-day Historical Volatility';
		lc_greeks_analytical=dict.greeks_analytical||'Greeks/Analytical';
		lc_stock_price=dict.stock_price||'Stock Price';
		lc_volatility=dict.volatility||'Volatility';
		lc_real_time=dict.real_time||'Real-time';
		lc_delayed=dict.delayed||'Delayed';
		lc_prompt_select=dict.prompt_select||'Please select at least one expiration date above.';
		lc_prompt_symbol=dict.prompt_symbol||'To retrieve an option chain enter the underlying symbol in the field above and click GO.';
		lc_zero_prompt=dict.zero_prompt||'Options with zero cost spread cannot be traded online. Please call us 1-800-869-6600 if you wish to place this order.';
		lc_invalid_symbol=dict.invalid_symbol||'Invalid Symbol.';
		odb_option=$('div#optionChain .odb_option');
		top_bar=$('div#optionChain .top .bar');
		cr=$('#chains_range').val();
		$('#chains_range').change( function() { cr=$(this).val(); });
		// caching table headers for better performance
		cp_tr='<tr><th class="left_t cp">'+lc_calls+'</th><th class="lastpx">'+lc_last+'</th><th class="chg">'+lc_change+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th class="int" style="border-right:1px solid #cccccc;">'+lc_interest+'</th><th width="72" class="gray">'+lc_strike+'</th><th class="left_t cp">'+lc_puts+'</th><th class="lastpx">'+lc_last+'</th><th class="chg">'+lc_change+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th class="int">'+lc_interest+'</th></tr>';
		st_tr='<tr class="th_nbl2"><th class="left_t cp">'+lc_calls+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th style="text-align:center;" width="62">'+lc_strike+'</th><th width="62">'+lc_close_bid+'</th><th width="64">'+lc_open_ask+'</th><th class="left_t cp">'+lc_puts+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th></tr>';
		vcs_tr1='<tr class="th_nbl"><th colspan="5"></th><th width="0">'+lc_strike+'</th><th colspan="2">'+lc_bear_call+'</th><th colspan="2">'+lc_bull_call+'</th><th colspan="5"></th></tr><tr class="th_nbl2"><th class="left_t cp">'+lc_calls+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th><select style="width:82px; margin-bottom:3px;" name="select_vcs"><option>'+lc_select+'</option>';
		vcs_tr2='</th><th width="62">'+lc_close_ask+'</th><th width="59">'+lc_open_bid+'</th><th width="62">'+lc_close_bid+'</th><th width="64">'+lc_open_ask+'</th><th class="left_t cp">'+lc_calls+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th></tr></table>';
		vps_tr1='<tr class="th_nbl"><th colspan="5"></th><th width="0">'+lc_strike+'</th><th colspan="2">'+lc_bear_put+'</th><th colspan="2">'+lc_bull_put+'</th><th colspan="5"></th></tr><tr class="th_nbl2"><th class="left_t cp">'+lc_puts+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th><select style="width:82px; margin-bottom:3px;" name="select_vps"><option>'+lc_select+'</option>';
		vps_tr2='</th><th width="62">'+lc_close_bid+'</th><th width="64">'+lc_open_ask+'</th><th width="67">'+lc_close_ask+'</th><th width="59">'+lc_open_bid+'</th><th class="left_t cp">'+lc_puts+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th></tr></table>';
	}

	function norm_xml(str) {
		var xmlDoc;
		if (typeof(DOMParser) != "undefined") {
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(str, "application/xhtml+xml");							
		}else{
			xmlDoc=new ActiveXObject("MSXML2.DOMDocument.3.0");
			xmlDoc.async="false";
			xmlDoc.loadXML(str); 
		}
		return xmlDoc;
	}

	function XMLtoString(elem){
		var serialized;
		try {
			// XMLSerializer exists in current Mozilla browsers
			serializer = new XMLSerializer();
			serialized = serializer.serializeToString(elem);
		} 
		catch (e) {
			// Internet Explorer has a different approach to serializing XML
			serialized = elem.xml;
		}
		return serialized;
	}

	function getOptionChain(symbol,exp_date, cb){
		$.ajax({
				url: '/cgi-bin/getchain',
				data: {data_format:'xml', expiration_type:$('#expiration_type').val(), chains_range:$('#chains_range').val(), quoteSymbol:symbol},
				cache: false,
				type:'GET',
				success: function(str){
					cb(str);
				},
				error: function(str){
				}
		});		
	}

	function parseExpDate(xml){
		if($("exp-date",xml).length > 0){
			$("exp-date",xml).each(function(id) {
				var quote = $("exp-date",xml).get(id);
				$date = $(quote).attr('date');
				//$expDates.push($date);
				var date_str=$.format.date($date, 'MMM dd, yyyy');
				var ind=$.format.date($date, 'yyyyMMdd');
				$expDates.push( {
					date:$date,
					index:ind, 
					date_str:date_str,
					is_monthly: is_monthly(date_str)
				});
				e_len=$expDates.length;
				// prepopulate the divs
				if(is_msie) {
					var t='<div class="symbol section_'+ind+'" style="display: none;"></div>';
					$.each([cp_div, strangle_div, st_div, vcs_div, vps_div, ccs_div, cps_div, greeks_div], function() {
						this.append(t);
					});
				}
			});
		}		
	}

	function xmlToArray(xml){
		$optionChains=[];
		$strikeInterval = -1;
		$lastStrike = -1;
		$('option-chain',xml).each(function(id){
			var optionChain = {};
			var quote = $('option-chain',xml).get(id);
			var date = $(quote).attr('exp-date');
			optionChain.date = date;
			var index=$.format.date(date, 'yyyyMMdd');
			optionChain.index = index;
			var date_str=$.format.date(date, 'MMM dd, yyyy');
			optionChain.date_str = date_str;
			optionChain.is_monthly = is_monthly(date_str);
			optionChain.options = [];
			$currentOptionChain = this;
			$("option",$currentOptionChain).each(function(i){
				var option = {};
				var quote = $('option',$currentOptionChain).get(i);
				option.symbol = $(quote).attr('option-symbol');
				option.side = $(quote).attr('side');
				option.change = $(quote).attr('change');
				option.last = $(quote).attr('last');
				option.interest = $(quote).attr('interest');
				option.strike_str = $(quote).attr('strike');
				option.strike = parseFloat(option.strike_str);
				option.ask_str = $(quote).attr('ask');
				option.ask = parseFloat(option.ask_str)||0.00; // in case blank string
				option.bid_str = $(quote).attr('bid');
				option.bid = parseFloat(option.bid_str)||0.00;
				option.volume = $(quote).attr('volume');
				option.bidsize = $(quote).attr('bidsize');
				option.asksize = $(quote).attr('asksize');
				optionChain.options.push(option);
				if ($lastStrike < 0)
				{
					$lastStrike = option.strike;
				}else{
					if(($strikeInterval < 0 || $strikeInterval > option.strike - $lastStrike) && option.strike - $lastStrike > 0){
						$strikeInterval = option.strike - $lastStrike;
					}
					$lastStrike = option.strike;
				}
			});
			$optionChains.push({index:index, chain:optionChain});
		});
	}
	function get_date(ymd) {
		var r={};
		$.each($expDates, function(i, item) {
			if(item.index==ymd) {
				r=item;
				return false;
			}
		});
		return r;
	}
	function get_chain(ymd) {
		var r={};
		$.each($optionChains, function(i, item) {
			if(item.index==ymd) {
				r=item;
				return false;
			}
		});
		return r;
	}

	function dayCount(date){
		return parseInt(new Date($.format.date(date, 'yyyy/MM/dd hh:mm:ss')).getTime()/1000/60/60/24 - new Date().getTime()/1000/60/60/24);
	}

	// daycounts
	function gen_dc(days) {
		switch(ft_locale) {
			case 'en-us': return days+' Day'+(days==1?'':'s')+' to Expiration';
			case 'zh-tw': var v="離過期日還有"+days+"天"; return v;
			case 'zh-cn': var v="离过期日还有"+days+"天"; return v;
			default: return days+' Days to Expiration';
		}
	}

	function gen_link(symbol, face, t, px) {
		// generates link for bid, ask, or call/put
		switch(t) {
			case 'bid': return '<a href="javascript:void(0)" onclick="javascript:orderbar_changelimitorder(\''+px+'\',\''+symbol+'\',\'ask\')">'+face+'</a>';
			case 'ask': return '<a href="javascript:void(0)" onclick="javascript:orderbar_changelimitorder(\''+px+'\',\''+symbol+'\',\'ask\')">'+face+'</a>';
		}
	}

	
	function gsq_main_ls(obj) {
		if(!obj) return;
		var fix2dec_quote = new Fix2dec_quote(obj.getNewValue('3'),obj.getNewValue('5'),obj.getNewValue('10'),obj.getNewValue('11'),obj.getNewValue('1'),obj.getNewValue('2'),"+0.00");
		fix2dec_quote.update2Dec();
		
		var chg=fix2dec_quote.change;
		var val_change=parseFloat(chg);
		var cls_chg=val_change>0?' class="green"':(val_change<0?' class="red"':' ');
		//var rt_ind=realtime=='T'?quotetime.substr(0,5)+quotetime.substr(8,3):lc_delayed;
		var rt_ind='';
		var _sym=obj.getNewValue('4')||'';
		if(!_sym) return;
		var q={
			symbol:_sym,
			last:fix2dec_quote.last,
			bid:fix2dec_quote.bid,
			ask:fix2dec_quote.ask,
			vol:obj.getNewValue('7'),
			quotetime:parse_qt(obj.getNewValue('9')),
			chg:fix2dec_quote.change,
			cls_chg:cls_chg,
			rt_ind:rt_ind
		};
		
		var symbol=q.symbol;
		var fix2dec_quote = new Fix2dec_quote(q.last,q.chg,'0.00','0.00',q.bid,q.ask,"+0.00");
		fix2dec_quote.update2Dec();
		q.last = fix2dec_quote.last;
		q.chg = fix2dec_quote.change;
		q.bid = fix2dec_quote.bid;
		q.ask = fix2dec_quote.ask;
		
		/*
		if(symbol=='') { qdiv.html('<ul><li class="quote_ph">'+lc_invalid_symbol+'</li></ul>'); return; }
		var is_stock=symbol.length<=6;
		var qcls=is_stock?'odbq':'odbq odbq2';
		if(parseFloat(q.last.replace(',', ''))>10000) {
			q.last=trim_dec(q.last);
			q.chg=trim_dec(q.chg);
			q.bid=trim_dec(q.bid);
			q.ask=trim_dec(q.ask);
		}
		if(!is_stock) {
			var x=/^(.* )(Call|put)$/i.exec(symbol);
			if(x) { symbol=x[1]+x[2].substr(0,1); }
		}

		var h='<table class="'+qcls+'" cellpadding="0">';
		h+='<colgroup>';
		h+='<col class="col_sym">';
		h+='<col class="col_last">';
		h+='<col class="col_chg">';
		h+='<col class="col_bid">';
		h+='<col class="col_ask">';
		h+='<col class="col_vol">';
		h+='<col class="col_updated">';
		if(is_stock) {
			h+='<col class="col_idc">';
			h+='<col class="col_idc">';
			h+='<col class="col_idc">';
		}
		h+='</colgroup><tr class="lbl">';
		h+='<th>'+lc_sym+'</th>';
		h+='<th>'+lc_last+'</th>';
		h+='<th>'+lc_chg+'</th>';
		h+='<th>'+lc_bid+'</th>';
		h+='<th>'+lc_ask+'</th>';
		h+='<th>'+lc_vol+'</th>';
		h+='<th>'+lc_updated+'</th>';
		if(is_stock) {h+='<th colspan="3">&nbsp;</th>';}
		h+='</tr><tr class="dat">';
		h+='<td><a href="javascript:void(0);" onclick="javascript:ShowCheatSheet(\''+symbol+'\');">'+symbol+'</a></td>';
		h+='<td>'+q.last+'</td>';
		h+='<td'+q.cls_chg+'>'+q.chg+'</td>';
		h+='<td><a href="javascript:void(0);" onclick="javascript:orderbar_changelimitorder(\''+q.bid+'\',\''+symbol+'\',\'bid\');">'+q.bid+'</a></td>';
		h+='<td><a href="javascript:void(0);" onclick="javascript:orderbar_changelimitorder(\''+q.ask+'\',\''+symbol+'\',\'ask\');">'+q.ask+'</a></td>';
		h+='<td>'+q.vol+'</td>';
		h+='<td class="qtime">'+q.quotetime+'</td>';
		if(is_stock) {
			h+='<td><a class="icharts" href="javascript:void(0)" title="'+lc_charts+'" onclick="javascript:headerChange(\'/content/researchtools/stocks/charts?SYMBOL_US='+symbol+'\');">Charts</a></td>';
			h+='<td><a class="iquote" href="javascript:void(0)" title="'+lc_quotes+'" onclick="javascript:headerChange(\'/content/researchtools/stocks/quote?SYMBOL_US='+symbol+'\');">Charts</a></td>';
			h+='<td><a class="inews" href="javascript:void(0)" title="'+lc_news+'" onclick="javascript:headerChange(\'/content/researchtools/stocks/news?SYMBOL_US='+symbol+'\');">Charts</a></td>';
		}
		h+='</tr><table>';
		qdiv.html(h);
		*/
		
		
			var	last=q.last,
				bid=q.bid,
				ask=q.ask,
				change=q.chg,
				val_change=parseFloat(change),
				vol=q.vol,
				realtime=q.quotetime,
				quotetime=q.quotetime,
				rt_ind=q.rt_ind,
				quote_class='',
				chg_color;
			$stockPrice=parseFloat(last);
			// qutoe up or down
			/*
			if(tick=='U') {
				quote_class='quote_up';
			} else if(tick=='D') {
				quote_class='quote_down';
			}			
			
			
			chg_color=val_change>0?'green': (val_change<0?'red':'');
			*/
			//rt_ind=realtime=='T'?lc_real_time:lc_delayed;
			rt_ind=realtime=='T'?'':lc_delayed;
			var q='<ul>'
				+'<li class="refresh" style="margin-left:4px"><a href="javascript:void(0)" onclick="javascript:OPC.gsq(\''+symbol+'\')">refresh</a></li>'
				+'<li><a href="javascript:void(0);" onclick="javascript:ShowCheatSheet(\''+symbol+'\')">'+symbol+'</a></li>'
				+'<li><div class="'+quote_class+'">&nbsp</div></li>'
				+'<li><strong>'+last+'</strong><strong class="'+chg_color+'"></strong>'
				+'<li>'+lc_chg+': '+'<strong class="'+chg_color+'">'+change+'</strong></li>'
				+'<li>'+lc_bid+': '+gen_link(symbol, bid, 'bid', bid)+'</li>'
				+'<li>'+lc_ask+': '+gen_link(symbol, ask, 'ask', ask)+'</li>'
				+'<li>Vol: <strong>'+vol+'</strong></li>'
				+'<li><span class="time">'+rt_ind+' '+quotetime+'</span></li>'
				+'</ul>';
			top_bar.html(q);
			
			
	}
	
	
	function gsq_main(str) {
		var xml=norm_xml(str);
		var quote=$($('response', xml).find('quote')[0]);
		var symbol=quote.find('symbol').text().toUpperCase();
		if($.trim(symbol)=='') {
			top_bar.html('<ul><li><strong>'+lc_invalid_symbol+'</strong></li></ul');
			return;
		}
		var	last=quote.find('last').text(),
			bid=quote.find('bid').text(),
			ask=quote.find('ask').text(),
			change=quote.find('change').text(),
			tick=quote.find('tick').text(),
			val_change=parseFloat(change),
			vol=quote.find('vol').text(),
			realtime=quote.find('realtime').text(),
			quotetime=quote.find('quotetime').text(),
			rt_ind,
			quote_class='',
			chg_color;
		$stockPrice=parseFloat(last);
		// qutoe up or down
		if(tick=='U') {
			quote_class='quote_up';
		} else if(tick=='D') {
			quote_class='quote_down';
		}			
		chg_color=val_change>0?'green': (val_change<0?'red':'');
		//rt_ind=realtime=='T'?lc_real_time:lc_delayed;
		rt_ind=realtime=='T'?'':lc_delayed;
		var q='<ul>'
			+'<li class="refresh" style="margin-left:4px"><a href="javascript:void(0)" onclick="javascript:OPC.gsq(\''+symbol+'\')">refresh</a></li>'
			+'<li><a href="javascript:void(0);" onclick="javascript:ShowCheatSheet(\''+symbol+'\')">'+symbol+'</a></li>'
			+'<li><div class="'+quote_class+'">&nbsp</div></li>'
			+'<li><strong>'+last+'</strong><strong class="'+chg_color+'"></strong>'
			+'<li>'+lc_chg+': '+'<strong class="'+chg_color+'">'+change+'</strong></li>'
			+'<li>'+lc_bid+': '+gen_link(symbol, bid, 'bid', bid)+'</li>'
			+'<li>'+lc_ask+': '+gen_link(symbol, ask, 'ask', ask)+'</li>'
			+'<li>'+lc_vol+': <strong>'+vol+'</strong></li>'
			+'<li><span class="time">'+rt_ind+' '+quotetime+'</span></li>'
			+'</ul>';
		top_bar.html(q);
	}
	// get stock quote
	function gsq(s) {
				top_bar.empty();
		if($.trim(s)=='') return;
		$.ajax({
			url:'/cgi-bin/getxml',
			cache:false,
			data:{page:'quo', quoteSymbol:s},
			success: function(str) {
				// odbar quote
				// only update the chain itself , no orderbar anymore
				//addMessages(str);
				//$('#quoteSymbol').val(s);
				gsq_main(str);
			}
		});
	}
	function do_fill_comp_order(type, legs, px, _cd) {
		var c=currentpage||'';
		if(!/^[2-5]$/.test(c)) return;
		//isShowingOptionChain = !isShowingOptionChain;$('#optionChain').animate({height:0});
		var cd=_cd||'';
		var opp;
		switch(c) {
			case '2': opp='3';break;
			case '3': opp='2';break;
			case '4': opp='5';break;
			case '5': opp='4';break;
		}
		// trans usym expdate strike cp
		var leg1=legs[0], leg2=legs[1], orig_cp, opp_cp;

		if(c=='3') { c='2';opp='3';}
		else if(c=='5') {c='4';opp='5';}

		if(!isEmpty(leg1)) {
			orig_cp=leg1.cp=='C'?'_call':'_put';
			var orig_trans=leg1.trans;
			$('#option_transactionType'+c).val(orig_trans);
			$('#option_underlyingsymbol'+c).val(leg1.usym).keyup().blur();
			$('#option_callputtype'+c+orig_cp).click();
			getStrikeMonth(c, leg1.expdate, leg1.strike+'0');
			setTimeout(function() {getSingleOptionquote('no', c);}, 500);
		}

		if(!isEmpty(leg2)) {
			var opp_trans=leg2.trans;
			$('#option_transactionType'+opp).val(opp_trans);
			opp_cp=leg2.cp=='C'?'_call':'_put';;
			$('#option_underlyingsymbol'+opp).val(leg2.usym).keyup().blur();
			$('#option_callputtype'+opp+opp_cp).click();
			getStrikeMonth(opp, leg2.expdate, leg2.strike+'0');
			setTimeout(function() {getSingleOptionquote('no', opp);}, 850);
		}
		if(px!=''&&!isNaN(px)) {
			$('input[name="netprice_'+type+'"]').val(px);
		}
		if(cd&&(cd=='C'||cd=='D')) {
			var p;
			if(c=='2'||c=='3') p='3';
			else if(c=='4'||c=='5') p='5';
			if(p) $('#limittype_'+cd+p).trigger('click');

		}
	}

	function fill_comp_order(type, legs, px, _cd) {
		if(!isEmpty(legs[0])&&!isEmpty(legs[1])&&px==0.00) {
			zp();
			return;
		}
		if( window.location.href.indexOf('#/cgi-bin/option_order')==-1 ) {
			headerChange('/cgi-bin/option_order');
		}
		isShowingOptionChain = !isShowingOptionChain;$('#optionChain').animate({height:0});
		var lp=0, limit=70;
		setTimeout( function wait_for_opt() {
			lp++;
			if(lp>limit) return;
			if($('#st_preview').length) {
				if(type=='st') {
					currentpage='4';
					$('span#straddle').click();
				} else if(type=='sp') {
					currentpage='2';
					$('span#spread').click();
				}
				if(!isEmpty(legs[0])&&!isEmpty(legs[1])) {
					OPT.reset_order(type);
				}
				var st_tab_pp=$('span#straddle').parent().parent(),
					sp_tab_pp=$('span#spread').parent().parent();
				if(type=='sp') {
					st_tab_pp.hasClass('current')&&st_tab_pp.removeClass('current');
					sp_tab_pp.hasClass('current')||sp_tab_pp.addClass('current');
				} else if (type=='st') {
					sp_tab_pp.hasClass('current')&&sp_tab_pp.removeClass('current');
					st_tab_pp.hasClass('current')||st_tab_pp.addClass('current');
				}
				do_fill_comp_order(type, legs, px, _cd);
			} else {
				setTimeout(wait_for_opt, 200);
			}
		}, 200);	
	}
	function fill_opt_order(fullsymbol, symbol, expdate, strike, cp, px, bidask) {
		var c=currentpage;
		var optdiv;
		if(c=='') {
			optdiv=$('div#option_orderbar_main');
			$('#option_underlyingsymbol', optdiv).val(symbol);
			_usym = symbol;
			_exptriggered = true;
			getStrikeMonth(c, expdate, strike+'0');
			// exp in mm/dd/yyyy format
			ChangeForm('show-option');
			$('#option_callputtype', optdiv).val(cp);
			$('#option_underlyingsymbol1', optdiv).val(symbol);
			MaxOrderbar();
			updateOptionChainHeight();
		} else {
			optdiv=$('div.optionsB');
			ULsymbol[parseInt(c)]=symbol;
			if(cp=='C')
				$('#option_callputtype'+c+'_call', optdiv).prop('checked', true);
			else 
				$('#option_callputtype'+c+'_put', optdiv).prop('checked', true);
			isShowingOptionChain = !isShowingOptionChain;
			$('#option_underlyingsymbol'+c, optdiv).val(symbol);
			getStrikeMonth(c, expdate, strike+'0');
			$('#optionChain').animate({height:0}); 
		}
		if(typeof px=='string' && px!='') {
			$('input#option_limitPrice'+c, optdiv).val(px);
			if(c=='') {
				$('select#option_priceType'+c, optdiv).val('2');
			} else if(c=='1') {
				$('#option_priceType1', optdiv).prop('checked', true);
			} else if(c=='3') {
				$('#option_priceType3_limit', optdiv).prop('checked', true);
			}
		} else {
			$('#option_limitPrice'+c, optdiv).val('');
		}

		if(c!='') {
			if(c=='1') { 
				setTimeout( function() { getSingleOptionquote('no', '1') }, 1000);
			} else {
				var opppage,strat;
				switch(c) {
					case '2': opppage='3';strat='sp';break;
					case '3': opppage='2';strat='sp';break;
					case '4': opppage='5';strat='st';break;
					case '5': opppage='4';strat='st';break;
				}	
				if(opppage) {
					if(
						typeof($("#OCA_LINK").attr('class')) =="undefined" &&
						($('#option_underlyingsymbol'+c, optdiv).val() != $('#option_underlyingsymbol'+opppage, optdiv).val() || $('#option_expdate'+opppage,optdiv).val()=='' ))
					{
						setTimeout( function() {
							$('#option_underlyingsymbol'+c, optdiv).trigger('keyup');	
							$('select#option_expdate'+opppage, optdiv).html( $('select#option_expdate'+c, optdiv).html() );
							$('select#option_expdate'+opppage, optdiv).val( $('select#option_expdate'+c, optdiv).val() );
							getStrike(opppage);
							OPT.cpchange(strat, c, opppage);
						}, 1000);
					}
					else if(typeof($("#OCA_LINK").attr('class')) =="undefined") {
						setTimeout( function() {
							OPT.cpchange(strat, c, opppage);
						}, 1000);
					} else {
						setTimeout( function() {
							getSingleOptionquote('no', c);
						}, 1000);
					}

				}
			}
		}
		else
		{
            		setTimeout( function() {getSingleOptionquote('no','');}, 1000);
		
		}
		return false;
	}
	function vcs_change() {
			$('#opc_VerticalCallSpread table tbody tr th select').change(function(){
				$(this).parent().parent().parent().children('tr').each(function (i){
					if(this.className==''){
						$(this).remove();
					}
				});
				var tbody = $(this).parent().parent().parent();
				var arr=$(this).val().split('_');
				var date = arr[0];
				var expdate_mdy=arr[2];
				var interval = parseFloat(arr[1]);

				var tmp_text=[];
				$.each($optionChains,function(i, item){
					var chain=item.chain;
					if(chain.date_str == date){
						$.each(chain.options,function(key,option){
							if((cr=='O'||cr=='I') && option.volume=='') {return true;}
							if(option.side == 'CALL'){
								var callStrike = option.strike;
								var callBid = option.bid;
								var callAsk = option.ask;
								var callVolume = option.volume;
								var leftColor,rightColor;
								if(callStrike < $stockPrice){
									leftColor = cr=='O'?'':'yellow ';
									rightColor = cr=='I'?'yellow ':'';
								}else{
									leftColor = cr=='I'?'yellow ':'';
									rightColor = cr=='O'?'':'yellow ';
								}
								$.each(chain.options,function(key,option){
									if((cr=='O'||cr=='I')&&option.volume=='') {return true;}
									if(callStrike - option.strike == interval && option.side == "CALL"){
										var c2=callStrike.toFixed(2), os=option.strike_str;
										var ab2=(parseFloat(option.ask) - parseFloat(callBid)).toFixed(2),
											ba2=(parseFloat(option.bid) - parseFloat(callAsk)).toFixed(2);
										if(ab2<0) ab2='0.00'; if(ba2<0) ba2='0.00';
										if(callVolume!='0'&&option.volume!='0')tmp_text.push('<tr>'
										+'<td class="' + leftColor+ ' left_d"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('',$ocs,expdate_mdy,os,'C')+',null],\'\')"><span>'+ option.strike_str +' Call</span></a></td>'
										+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',[null,'+bl('SO',$ocs,expdate_mdy,os,'C')+'],\''+option.bid_str+'\')">'+ option.bid_str +'</a></td>'
										+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,os,'C')+',null],\''+option.ask_str+'\')">'+ option.ask_str +'</a></td>'
										+'<td'+gen_class([leftColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
										+'<td class="' + leftColor+ '">'+ option.volume +'</td>'
										+'<td class="gray_r center">'+ os +' / '+ c2 +'</td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('SC',$ocs,expdate_mdy,c2,'C')+','+bl('BC',$ocs,expdate_mdy,os,'C')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,c2,'C')+','+bl('SO',$ocs,expdate_mdy,os,'C')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('SC',$ocs,expdate_mdy,os,'C')+','+bl('BC',$ocs,expdate_mdy,c2,'C')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,os,'C')+','+bl('SO',$ocs,expdate_mdy,c2,'C')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'
										+'<td class="' + rightColor+ 'left_d"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('',$ocs,expdate_mdy,c2,'C')+',null],\'\')"><span>'+ c2 +' Call</span></a></td>'
										+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',[null,'+bl('',$ocs,expdate_mdy,c2,'C')+'],\''+callBid+'\')">'+ callBid +'</a></td>'
										+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('',$ocs,expdate_mdy,c2,'C')+',null],\''+callAsk+'\')">'+ callAsk +'</a></td>'
										+'<td'+gen_class([rightColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
										+'<td class="' + rightColor+ '">'+ callVolume +'</td>'
										+'</tr>');
									}
								});
							}
						});
					}
				})	
				tbody.append(tmp_text.join(''));
			});
	}

	function vps_change() {
			$('#opc_VerticalPutSpread table tbody tr th select').change(function(){
				$(this).parent().parent().parent().children('tr').each(function (i){
					if(this.className==''){
						$(this).remove();
					}
				});
				var tbody = $(this).parent().parent().parent();
				var arr=$(this).val().split('_');
				var date = arr[0];
				var expdate_mdy=arr[2];
				var interval = parseFloat(arr[1]);

				var tmp_text=[];
				$.each($optionChains,function(i,item){
					var chain=item.chain;
					if(chain.date_str == date){
						$.each(chain.options,function(key,option){
							if((cr=='O'||cr=='I') && option.volume=='') {return true;}
							if(option.side == 'PUT'){
								var higherStrike = option.strike;
								var higherBid = option.bid;
								var higherAsk = option.ask;
								var higherVolume = option.volume;
								var leftColor,rightColor;
								if(higherStrike < $stockPrice){
									leftColor = cr=='O'?'':"yellow ";
									rightColor = cr=='I'?'yellow ':'';
								}else{
									leftColor = cr=='I'?'yellow ':'';
									rightColor = cr=='O'?'':"yellow ";
								}
								var row='';
								$.each(chain.options,function(key,option){
									if((cr=='O'||cr=='I') && option.volume=='') {return true;}
									var strike_str=option.strike_str;
									if(higherStrike - option.strike == interval && option.side == 'PUT'){
										var h2=higherStrike.toFixed(2), os2=option.strike.toFixed(2);
										var ba2=(parseFloat(higherBid) - parseFloat(option.ask)).toFixed(2),
											ab2=(parseFloat(higherAsk) - parseFloat(option.bid)).toFixed(2);
										if(ab2<0) ab2='0.00'; if(ba2<0) ba2='0.00';
										if(higherVolume!='0'&&option.volume!='0')tmp_text.push('<tr>'
										+'<td class="' + leftColor+ ' left_d"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('',$ocs,expdate_mdy,h2,'P')+',null],\'\')"><span>'+ h2  +' Put</span></a></td>'
										+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',[null,'+bl('SO',$ocs,expdate_mdy,h2,'P')+'],\''+higherBid+'\')">'+ higherBid +'</a></td>'
										+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,h2,'P')+',null],\''+higherAsk+'\')">'+ higherAsk +'</a></td>'
										+'<td'+gen_class([leftColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
										+'<td class="' + leftColor+ '">'+ higherVolume +'</td>'
										+'<td class="gray_r center">'+ h2 +' / '+ os2 +'</td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('SC',$ocs,expdate_mdy,h2,'P')+','+bl('BC',$ocs,expdate_mdy,os2,'P')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,h2,'P')+','+bl('SO',$ocs,expdate_mdy,os2,'P')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('SC',$ocs,expdate_mdy,os2,'P')+','+bl('BC',$ocs,expdate_mdy,h2,'P')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'
										+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,os2,'P')+','+bl('SO',$ocs,expdate_mdy,h2,'P')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'
										+'<td class="' + rightColor+ 'left_d"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('',$ocs,expdate_mdy,strike_str,'P')+',null],\'\')"><span>'+ strike_str +' Put</span></a></td>'
										+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',[null,'+bl('SO',$ocs,expdate_mdy,option.bid_str,'P')+'],\''+option.bid_str+'\')">'+ option.bid_str +'</a></td>'
										+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="OPC.fco(\'sp\',['+bl('BO',$ocs,expdate_mdy,option.ask_str,'P')+',null],\''+option.ask_str+'\')">'+ option.ask_str +'</a></td>'
										+'<td'+gen_class([rightColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
										+'<td class="' + rightColor+ '">'+ higherVolume +'</td>'
										+'</tr>');
									}
								});
							}
						});
					}
				})	
				tbody.append(tmp_text.join(''));
			});
	}

	function ccs_change() {
			$('#opc_CalendarCallSpread table tbody tr th select').change(function(){
				var o=$(this);
				if(o.val()==lc_select) return;
				o.parent().parent().parent().children('tr').each(function (i){
					if(this.className==''){
						$(this).remove();
					}
				});
				var tbody = o.parent().parent().parent();
				var leftDate = o.val().split('_')[0];
				var rightDate = o.val().split('_')[1];
				if(!rightDate) return;
				var left_mdy, right_mdy;
				var leftChain,rigthChain;

				$.each($optionChains,function(i, item){
					var chain=item.chain;
					if(chain.date_str == leftDate){
						leftChain = chain;
					}
					if(chain.date_str == rightDate){
						rigthChain = chain;
					}
				});
				$.each($expDates, function(i, item) {
					if(item.date_str == leftDate){
						leftDate = $.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2);
						left_mdy=$.format.date(item.date, 'MM/dd/yyyy');
					}
					if(item.date_str == rightDate){
						rightDate = $.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2);
						right_mdy=$.format.date(item.date, 'MM/dd/yyyy');
					}  
				});
				$(this).parent().parent().parent().children("tr").each(function (i){
					if(this.className=='th_nbl'){
						$(this).children('th').each(function (i){
							if(i==4){
								$(this).empty();
								$(this).append(rightDate);
							}
						});
					}
				});
				var tmp_text=[];
				$.each(leftChain.options,function(key,option){
					if(option.side == 'CALL'){
						if((cr=='O'||cr=='I') && option.volume=='') {return true;}
						var leftStrike = option.strike, l2=leftStrike.toFixed(2);
						var leftBid = option.bid;
						var leftAsk = option.ask;
						var leftVolume = option.volume;
						var leftColor,rightColor;
						if(leftStrike < $stockPrice){
							leftColor = cr=='O'?'':"yellow ";
							rightColor = cr=='I'?'yellow ':'';
						}else{
							leftColor = cr=='I'?'yellow ':'';
							rightColor = cr=='O'?'':"yellow ";
						}
						$.each(rigthChain.options,function(key,option){
							if(option.side == 'CALL' && option.strike == leftStrike){
								var ba2=(parseFloat(option.bid) - parseFloat(leftAsk)).toFixed(2),
									ab2=(parseFloat(option.ask) - parseFloat(leftBid)).toFixed(2);
								if(ab2<0) ab2='0.00'; if(ba2<0) ba2='0.00';
								if(leftVolume!='0'&&option.volume!='0')tmp_text.push('<tr>'
								+'<td class="' + leftColor+ ' left_d"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('',$ocs,left_mdy,l2,'C')+',null],\'\')"><span>'+ l2 +' Call</span></a></td>'
								+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',[null,'+bl('',$ocs,left_mdy,l2,'C')+'],\''+leftBid+'\')">'+ leftBid +'</a></td>'
								+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('BO',$ocs,left_mdy,l2,'C')+'],\''+leftAsk+'\')">'+ leftAsk +'</a></td>'
								+'<td'+gen_class([leftColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td class="' + leftColor+ '">'+ leftVolume +'</td>'
								+'<td class="gray_r center">'+ leftDate +' / '+ rightDate + ' ' +leftStrike +'</td>'
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('SC',$ocs,right_mdy,l2,'C')+','+bl('BC',$ocs,left_mdy,l2,'C')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'           
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('BO',$ocs,right_mdy,l2,'C')+','+bl('SO',$ocs,left_mdy,l2,'C')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'     
								+'<td class="' + rightColor+ 'left_d"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('',$ocs,right_mdy,l2,'C')+'],\''+option.strike.toFixed(2)+'\')"><span>'+ option.strike.toFixed(2) +' Call</span></a></td>'
								+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',[null,'+bl('',$ocs,right_mdy,l2,'C')+'],\''+option.bid+'\')">'+ option.bid +'</a></td>'
								+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('',$ocs,right_mdy,l2,'C')+',null],\''+option.ask+'\')">'+ option.ask +'</a></td>'
								+'<td'+gen_class([rightColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td class="' + rightColor+ '">'+ option.volume +'</td>'
								+'</tr>');
							}
						});
					}
				});
				tbody.append(tmp_text.join(''));
			});
	}

	function cps_change() {
			$('#opc_CalendarPutSpread table tbody tr th select').change(function(){
				var o=$(this);
				o.parent().parent().parent().children('tr').each(function (i){
					if(this.className==''){
						$(this).remove();
					}
				});
				var tbody = o.parent().parent().parent();
				var leftDate = o.val().split('_')[0];
				var rightDate = o.val().split('_')[1];
				if(!rightDate) return;
				var left_mdy,right_mdy;
				var leftChain,rigthChain;

				$.each($optionChains,function(i, item){
					var chain=item.chain;
					if(chain.date_str == leftDate){
						leftChain = chain;
					}
					if(chain.date_str == rightDate){
						rigthChain = chain;
					}
				});
				$.each($expDates, function(i, item) {
					if(item.date_str == leftDate){
						leftDate = $.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2);
						left_mdy=$.format.date(item.date, 'MM/dd/yyyy');
					}
					if(item.date_str == rightDate){
						rightDate = $.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2);
						right_mdy=$.format.date(item.date, 'MM/dd/yyyy');
					}  
				});
				$(this).parent().parent().parent().children('tr').each(function (i){
					if(this.className=='th_nbl'){
						$(this).children('th').each(function (i){
							if(i==4){
								$(this).empty();
								$(this).append(rightDate);
							}
						});
					}
				});
				var tmp_text=[];
				$.each(leftChain.options,function(key,option){
					if(option.side == 'PUT'){
						if((cr=='O'||cr=='I') && option.volume=='') {return true;}
						var leftStrike = option.strike, l2=leftStrike.toFixed(2);
						var leftBid = option.bid;
						var leftAsk = option.ask;
						var leftVolume = option.volume;
						var leftColor,rightColor;
						if(leftStrike < $stockPrice){
							leftColor = cr=='O'?'':'yellow ';
							rightColor = cr=='I'?'yellow ':'';
						}else{
							leftColor = cr=='I'?'yellow ':'';
							rightColor = cr=='O'?'':'yellow ';
						}
						$.each(rigthChain.options,function(key,option){
							if(option.side == 'PUT' && option.strike == leftStrike){
								var ba2=(parseFloat(option.bid) - parseFloat(leftAsk)).toFixed(2),
									ab2=(parseFloat(option.ask) - parseFloat(leftBid)).toFixed(2);
								if(ab2<0) ab2='0.00'; if(ba2<0) ba2='0.00';
								if(leftVolume!='0'&&option.volume!='0')tmp_text.push('<tr>'
								+'<td class="' + leftColor+ ' left_d"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('',$ocs,left_mdy,l2,'P')+'],\'\')"><span>'+ l2 +' Put</span></a></td>'
								+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',[null,'+bl('SO',$ocs,left_mdy,l2,'P')+'],\''+leftBid+'\')">'+ leftBid +'</a></td>'
								+'<td class="' + leftColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('BO',$ocs,left_mdy,l2,'P')+',null],\''+leftAsk+'\')">'+ leftAsk +'</a></td>'
								+'<td'+gen_class([leftColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td class="' + leftColor+ '">'+ leftVolume +'</td>'
								+'<td class="gray_r center">'+ leftDate +' / '+ rightDate + " " +leftStrike +'</td>'
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('SC',$ocs,right_mdy,l2,'P')+','+bl('BC',$ocs,left_mdy,l2,'P')+'],\''+ba2+'\',\'C\')">'+ ba2 +'</a></td>'           
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('BO',$ocs,right_mdy,l2,'P')+','+bl('SO',$ocs,left_mdy,l2,'P')+'],\''+ab2+'\',\'D\')">'+ ab2 +'</a></td>'     
								+'<td class="' + rightColor+ 'left_d"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',['+bl('',$ocs,right_mdy,l2,'P')+'],\''+option.strike.toFixed(2)+'\')"><span>'+ option.strike.toFixed(2) +' Put</span></a></td>'
								+'<td class="' + rightColor+ '"><a href="javascript:void(0)" onclick="javascript:OPC.fco(\'sp\',[null,'+bl('SO',$ocs,right_mdy,l2,'P')+'],\''+option.bid+'\')">'+ option.bid +'</a></td>'
								+'<td class="' + rightColor+ '"><a href="javascript:void(0)"  onclick="javascript:OPC.fco(\'sp\',['+bl('BO',$ocs,right_mdy,l2,'P')+',null],\''+option.ask+'\')">'+ option.ask +'</a></td>'
								+'<td'+gen_class([rightColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td class="' + rightColor+ '">'+ option.volume +'</td>'
								+'</tr>');
							}
						});
					}
				});
				tbody.append(tmp_text.join(''));
			});
	}

	function render_oc(ymd) {
		var r_list=[];
		var r_all=false;
		// to do: get the right date
		if(typeof ymd=='undefined') {
			r_all=true;
			r_list=$optionChains;
		} else {
			r_list=[ get_chain(ymd) ];
		}

		$.each(r_list, function(i, item) {
			var index=item.index;
			var chain=item.chain;
			var sec_cls=index;
			var date = chain.date;
			var date_str = chain.date_str;
			var expdate_mdy=$.format.date(date, 'MM/dd/yyyy');
			var exp_type=chain.is_monthly?lc_monthly:lc_weekly;
			// callputs
			var cp_cls=$('div.section_'+sec_cls,cp_div);
			if(r_all||cp_cls.length<1||cp_cls.is(':empty')) {
				var cp_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_c">Call / Puts</div><h2>'
					+$ocs +'</h2><h3>'
					+date_str +' <em>(' +exp_type+')</em></h3><span>'
					+gen_dc( dayCount(date) )+'</span></div>';
				var cp_tbl_text='<table style="display: none;" class="section_'+sec_cls+'">'+cp_tr;

				$.each(chain.options, function(j, option) {
					var side = option.side;
					var cp=side.substring(0,1);
					var strike_str = option.strike_str;
					var strike = option.strike;
					var color = '';
					var change = option.change;
					var chgcolor='';
					var fullsymbol=option.symbol;
					var bid = option.bid;
					var ask = option.ask;
					var bid_str = option.bid_str;
					var ask_str = option.ask_str;
					var volume = option.volume;
					if(parseFloat(change)>0){
						change = '+'+change;
						chgcolor=' green';
					} else if(parseFloat(change)<0) {
						chgcolor=' red';
					}
					if((strike < $stockPrice && side == "CALL") || (strike >= $stockPrice && side == "PUT")){
						color = "yellow";
					}
					if(side == "CALL"){				
						row='<tr>'
							+'<td'+gen_class([color, 'left_d'])+'"><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\'\',\'\')">'+'<span>'+strike_str+' Call</span></a></td>'
							+'<td'+gen_class([color])+'>'+option.last+'</td>'
							+'<td'+gen_class([color,chgcolor])+'>'+change+'</td>'
							+'<td'+gen_class([color])+'><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\''+bid_str+'\',\'bid\')">'+bid_str+'</a></td>'
							+'<td'+gen_class([color])+'><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\''+ask_str+'\',\'ask\')">'+ask_str+'</a></td>'
							+'<td'+gen_class([color])+'>'+option.bidsize+' x '+option.asksize+'</td>'
							+'<td'+gen_class([color])+'>'+volume+'</td>'
							+'<td'+gen_class([color])+'>'+option.interest+'</td>'
							+'<td class="gray">'+strike_str+'</td>';

					}else{
						row='<td'+gen_class([color, 'left_d'])+'><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\'\',\'\')"><span>'+strike_str+' Put</span></a></td>'
							+'<td'+gen_class([color])+'>'+option.last+'</td>'
							+'<td'+gen_class([color,chgcolor])+'>'+change+'</td>'
							+'<td'+gen_class([color])+'><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\''+bid_str+'\',\'bid\')">'+bid_str+'</a></td>'
							+'<td'+gen_class([color])+'><a href="javascript:void(0)" onclick="OPC.fill_opt_order(\''+fullsymbol+'\',\''+$ocs+'\',\''+expdate_mdy+'\',\''+strike_str+'\',\''+cp+'\',\''+ask_str+'\',\'ask\')">'+ask_str+'</a></td>'
							+'<td'+gen_class([color])+'>'+option.bidsize+' x '+option.asksize+'</td>'
							+'<td'+gen_class([color])+'>'+volume+'</td>'
							+'<td'+gen_class([color])+'>'+option.interest+'</td>'
							+'</tr>';
					}
					cp_tbl_text+=row;
				});
				cp_tbl_text+='</table>';
				if(is_msie) {
					cp_cls.replaceWith(cp_text);
					$(cp_tbl_text).insertAfter($('div.section_'+sec_cls,cp_div));
				} else {
					cp_div.append(cp_text+cp_tbl_text);
				}
			}
			// straddle
			// OPC.fco(type, symbol, expdate, strike,px) 
			var st_cls=$('div.section_'+sec_cls,st_div);
			if(r_all||st_cls.is(':empty')) {
				var st_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_s">Straddle</div><h2>'
					+$ocs
					+'</h2><h3>'
					+ date_str +' <em>('+exp_type+')</em></h3><span>'+gen_dc( dayCount(date) )+'</span></div>';
					var st_tbl_text='<table style="display: none;" class="section_'+sec_cls+'">'+st_tr;
				var call_strike = '';
				var call_bid = '';
				var call_ask = '';
				var call_volume = '';
				$.each(chain.options, function(j, option) {
					var callColor,putColor, straddle_row;
					var strike_str=option.strike_str;
					var strike=option.strike;
					var volume = option.volume;
					var bid = option.bid;
					var ask = option.ask;
					var bid_str = option.bid_str;
					var ask_str = option.ask_str;
					if(parseFloat(option.strike) < $stockPrice){
						callColor = "yellow";
						putColor = "";
					}else{
						callColor = "";
						putColor = "yellow";
					}
					if(option.side == "PUT"){			
						if(call_strike!=""){
							//if((cr=='O'||cr=='I') && volume=='') {return true;}
							var aca2=(ask + parseFloat(call_ask)).toFixed(2),
								bcb2=(bid + parseFloat(call_bid)).toFixed(2);
							straddle_row='<tr>'
								+'<td'+gen_class([callColor, 'left_d'])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('',$ocs,expdate_mdy,call_strike,'C')+',null],\'\')"><span>'+call_strike+' Call</span></a></td>'
								+'<td'+gen_class([callColor])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',[null,'+bl('SO',$ocs,expdate_mdy,call_strike,'C')+'],\''+call_bid+'\')">'+ call_bid +'</a></td>'
								+'<td'+gen_class([callColor])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('BO',$ocs,expdate_mdy,call_strike,'C')+',null],\''+call_ask+'\')">'+ call_ask +'</a></td>'
								+'<td'+gen_class([callColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td'+gen_class([callColor])+'>'+ call_volume +'</td>'
								+'<td class="gray_r center">'+ strike_str +'</td>'
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('SC',$ocs,expdate_mdy,call_strike,'C')+','+bl('SC',$ocs, expdate_mdy,call_strike,'P')+'],\''+bcb2+'\')">'+bcb2+'</a></td>'     
								+'<td class="gray_r"><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('BO',$ocs,expdate_mdy,call_strike,'C')+','+bl('BO',$ocs, expdate_mdy,call_strike,'P')+'],\''+aca2+'\')">'+aca2+'</a></td>'           
								+'<td'+gen_class(['left_d',putColor])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('',$ocs,expdate_mdy,strike_str,'P')+',null],\'\')"><span>'+strike_str +' Put</span></a></td>'
								+'<td'+gen_class([putColor])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',[null,'+bl('SO',$ocs,expdate_mdy,strike_str,'P')+'],\''+bid_str+'\')">'+ bid_str +'</a></td>'
								+'<td'+gen_class([putColor])+'><a href="javascript:void(0)" onclick="OPC.fco(\'st\',['+bl('BO',$ocs,expdate_mdy,strike_str,'P')+',null],\''+ask_str+'\')">'+ ask_str +'</a></td>' 
								+'<td'+gen_class([putColor])+'>'+option.bidsize+' x '+option.asksize+'</td>'
								+'<td'+gen_class([putColor])+'>'+ volume +'</td>'
								+'</tr>';
							call_strike = "";
							call_bid = "";
							call_ask = "";
							call_volume = "";						
							st_tbl_text+=straddle_row;
						}												
					}else{
						call_strike = strike_str
						call_bid = bid_str;
						call_ask = ask_str;
						call_volume = volume;
					}
				});
				st_tbl_text+='</table>';
				if(is_msie) {
					st_cls.replaceWith(st_text);
					$(st_tbl_text).insertAfter($('div.section_'+sec_cls,st_div));
				} else {
					st_div.append(st_text+st_tbl_text);
				}
			}
			// vcs
			var vcs_cls=$('div.section_'+sec_cls,vcs_div);
			if(r_all||vcs_cls.is(':empty')) {
				var vcs_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_s">'+lc_vertical_call_spread+'</div><h2>'
					+$ocs
					+'</h2><h3>'
					+ date_str +' <em>('+exp_type+')</em></h3><span>'+gen_dc( dayCount(date) )+'</span></div>';
				var vcs_tbl_text='<table style="display: none;" class="section_'+sec_cls+'">'+vcs_tr1+'<option selected value ="'+date_str+"_"+$strikeInterval+'_'+expdate_mdy+'">'+$strikeInterval.toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*2+'_'+expdate_mdy+'">'+($strikeInterval*2).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*3+'_'+expdate_mdy+'">'+($strikeInterval*3).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*4+'_'+expdate_mdy+'">'+($strikeInterval*4).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*5+'_'+expdate_mdy+'">'+($strikeInterval*5).toFixed(2)+'</option></select>'+vcs_tr2;
				if(is_msie) {
					vcs_cls.replaceWith(vcs_text);
					$(vcs_tbl_text).insertAfter($('div.section_'+sec_cls,vcs_div));
				} else {
					vcs_div.append(vcs_text+vcs_tbl_text);
				}
			}	
			// vps
			var vps_cls=$('div.section_'+sec_cls,vps_div);
			if(r_all||vps_cls.is(':empty')) {
				var vps_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_s">'+lc_vertical_put_spread+'</div><h2>'
					+$ocs
					+'</h2><h3>'
					+ date_str +' <em>('+exp_type+')</em></h3><span>'+gen_dc( dayCount(date) )+'</span></div>';
				var vps_tbl_text='<table style="display: none;" class="section_'+sec_cls+'">'+vps_tr1+'<option selected value ="'+date_str+"_"+$strikeInterval+'_'+expdate_mdy+'">'+$strikeInterval.toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*2+'_'+expdate_mdy+'">'+($strikeInterval*2).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*3+'_'+expdate_mdy+'">'+($strikeInterval*3).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*4+'_'+expdate_mdy+'">'+($strikeInterval*4).toFixed(2)+'</option><option value ="'+date_str+"_"+$strikeInterval*5+'_'+expdate_mdy+'">'+($strikeInterval*5).toFixed(2)+'</option></select>'+vps_tr2;
				if(is_msie) {
					vps_cls.replaceWith(vps_text);
					$(vps_tbl_text).insertAfter($('div.section_'+sec_cls,vps_div));
				} else {
					vps_div.append(vps_text+vps_tbl_text);
				}
			}	
			// ccs
			var cnt=0;
			var ccs_cls=$('div.section_'+sec_cls,ccs_div);
			if(r_all||ccs_cls.is(':empty')) {
				var ccs_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_s">Calendar Call Spread</div><h2>'
					+$ocs
					+'</h2><h3>'
					+ date_str +' <em>('+exp_type+')</em></h3><span>'+gen_dc( dayCount(date) )+'</span></div>'
				var ccs_tbl_text='<table style="display: none;" class="section_'+sec_cls+'"><tr class="th_nbl"><th colspan="5" style="text-align:left;">'+ $.format.date(date, 'MMM dd')+ " '" + $.format.date(date, 'yyyy').slice(2)+'</th><th>'+lc_strike+'</th><th></th><th></th><th colspan="5" style="text-align:left;"></th></tr><tr class="th_nbl2"><th class="left_t cp">'+lc_calls+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th><select style="width:142px; margin-bottom:3px;" name="select_ccs"><option>'+lc_select+'</option>';
				$.each($expDates, function(i, item) {
					var item_date_str=item.date_str;
					if(parseInt($.format.date(date, 'yyyyMMdd')) < parseInt(item.index)){
						var selected=(cnt==0)?' selected ':' ';
						cnt++;
						ccs_tbl_text+='<option'+selected+'value="'+date_str+"_"+ item_date_str+'">'+$.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2)+'</option>';  
					}					
				});
				ccs_tbl_text+='</select></th><th width="64">'+lc_close_bid+'</th><th width="64">'+lc_open_ask+'</th><th class="left_t cp">'+lc_calls+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th></tr></table>';
				if(is_msie) {
					ccs_cls.replaceWith(ccs_text);
					$(ccs_tbl_text).insertAfter($('div.section_'+sec_cls,ccs_div));
				} else {
					ccs_div.append(ccs_text+ccs_tbl_text);
				}
			}
			// cps
			var cps_cls=$('div.section_'+sec_cls,cps_div);
			if(r_all||cps_cls.is(':empty')) {
				var cps_text='<div class="symbol section_'+sec_cls+'" style="display: none;"><div class="type_s">Calendar Put Spread</div><h2>'
					+$ocs
					+'</h2><h3>'
					+ date_str +' <em>('+exp_type+')</em></h3><span>'+gen_dc( dayCount(date) )+'</span></div>';
				var cps_tbl_text='<table style="display: none;" class="section_'+sec_cls+'"><tr class="th_nbl"><th colspan="5" style="text-align:left;">'+ $.format.date(date, 'MMM dd')+ " '" + $.format.date(date, 'yyyy').slice(2)+'</th><th>'+lc_strike+'</th><th></th><th></th><th colspan="5" style="text-align:left;"></th></tr><tr class="th_nbl2"><th class="left_t cp">'+lc_puts+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th><th><select style="width:142px; margin-bottom:3px;" name="select_cps"><option>'+lc_select+'</option>';
				cnt=0;
				$.each($expDates, function(i, item) {
					var item_date_str=item.date_str;
					if(parseInt($.format.date(date, 'yyyyMMdd')) < parseInt(item.index)){
						var selected=(cnt==0)?' selected ':' ';
						cps_tbl_text+='<option'+selected+'value="'+date_str+"_"+ item_date_str +'">'+$.format.date(item.date, 'MMM dd')+ " '" + $.format.date(item.date, 'yyyy').slice(2)+'</option>';  
						cnt++;
					}					
				});
				cps_tbl_text+='</select></th><th width="64">'+lc_close_bid+'</th><th width="64">'+lc_open_ask+'</th><th class="left_t cp">'+lc_puts+'</th><th class="bidask">'+lc_bid+'</th><th class="bidask">'+lc_ask+'</th><th class="basize nw">'+lc_basize+'</th><th class="vol">'+lc_volume+'</th></tr></table>';
				if(is_msie) {
					cps_cls.replaceWith(cps_text);
					$(cps_tbl_text).insertAfter($('div.section_'+sec_cls,cps_div));
				} else {
					cps_div.append(cps_text+cps_tbl_text);
				}
			}	
		});
	}

	function parseOptionChain() {
		if(e_len<1) return;
		if(is_msie) {
			if($expDates.length) {
				var _d=$expDates[0];
				render_oc(_d.index);
			}
		} else {
			render_oc();
		}
	}

	//function get_greeks(cb){ return; // todo }

	function comp_pick_1() {
		$('select', get_section()).each( function() {
			var o=$(this);
			o&& o.change();
		});
	}

	//function parseGreeksXML(xml){ return; }
	function gc_sym(sym) {
		$('#opc_symbol').val(sym);
		gc(currentpage);
	}
	function gc(t) {
		if(typeof t=='string' && (/^\d+$/.test(t)||t=='')) {
			currentpage=t;
		}/* else {
			currentpage='';
		}*/
		if(gc_clicked) return;
		var _sym=$.trim($('#opc_symbol').val()).toUpperCase();
		var inputmonth = $.trim($('#opc_expDates').val()); 
		$('#opc_expDates').val("");
		$expDates = [];
		$('#opc_expDates').empty();
		gc_clicked=true;
		// set busy
		gc_btn.hasClass('opc_busy_btn')||gc_btn.addClass('opc_busy_btn'); 
		busy_tmr=setTimeout( function() {
			gc_btn.hasClass('opc_busy_btn')&&gc_btn.removeClass('opc_busy_btn'); 
		}, gc_timeout);
		gsq(_sym);
		cp_div.empty();
		greeks_div.empty();
		strangle_div.empty();
		st_div.empty();
		vcs_div.empty();
		vps_div.empty();
		ccs_div.empty();
		cps_div.empty();
		$('#optionChain div.odb_option .day .daymain').hide();
		if(_sym==='') {
			gc_clicked=false;
			gc_btn.hasClass('opc_busy_btn')&&gc_btn.removeClass('opc_busy_btn'); 
			prompt_symbol();
			return;
		}
		//alert($.trim($('#opc_expDate').val()).toUpperCase());
		getOptionChain(_sym,'', function(str) {
			FTL.valid_session(str);
			var xml=norm_xml(str);
			parseExpDate(xml);
			// underlying symbol
			$('option-chains',xml).each(function(id) {
				var quote = $('option-chains',xml).get(id);
				var symbol = $(quote).attr('underlying-symbol');
				$ocs = symbol;
			});	
			xmlToArray(xml);
			parseOptionChain();
			$('#optionChain .opc_go_btn').hasClass('opc_busy_btn')&&$('#optionChain .opc_go_btn').removeClass('opc_busy_btn');
			// clear busy tm
			if(busy_tmr) clearTimeout(busy_tmr);
			
			var date_str='';
			$.each($expDates, function(i, item) {
				var d_css=item.is_monthly?' class="monthly"':'';
				date_str+='<li><a rel="'+item.index+'"href="javascript:void(0)"'+d_css+'>'+item.date_str+'</a></li>';  
			});
			$('#opc_expDates').append(date_str);
			//$('#optionChain .day a.daymain').css('visibility',e_len<=9?'hidden':'visible');
			e_len>0 && $('#optionChain div.odb_option .day .daymain').show();
			//get_greeks(function(str) { }); 

			var firstDayIndex = 0;
			sh_arrow(firstDayIndex);
			$('#opc_right_arrow').click(function(){
				if(firstDayIndex < e_len - 9){
					$('.day ul li:eq('+firstDayIndex+')', odb_option).stop().animate({width:0,opacity:0},'fast');	
					$('.day ul li:eq('+(firstDayIndex + 9)+')', odb_option).stop().animate({width:87,opacity:1},'fast');
					firstDayIndex +=1;
					sh_arrow(firstDayIndex);
				}		
			});

			$('#opc_left_arrow').click(function(){
				if(firstDayIndex > 0){
					$('.day ul li:eq('+(firstDayIndex + 8)+')', odb_option).stop().animate({width:0,opacity:0},'fast');	
					$('.day ul li:eq('+(firstDayIndex - 1)+')', odb_option).stop().animate({width:87,opacity:1},'fast');
					firstDayIndex -=1;
					sh_arrow(firstDayIndex);
				}		
			});
			$('#opc_expDates li a').click(function(){
				var ymd=$(this).attr('rel');
				if(! /^\d{8}$/.test(ymd) ) return;
				if($('.main table.section_'+ymd).length<1) {
					render_oc(ymd);
					update_comp_chg();
				} 
				var li=$(this).parent();
				if(li.hasClass('current')) {
					li.removeClass('current');
					$('.main .section_'+ymd).css('display', 'none');
					$('.main .section_'+ymd).parent().scrollTop(0);
				} else {
					li.addClass('current');
					$('.main .section_'+ymd).css('display', '');
					comp_pick_1();
					$('.main .section_'+ymd).parent().scrollTop(0);
					var firstshowing = false;
					$('.main .section_'+ymd).each(function (index){
							if($(this).parent().css('display')=="block" && firstshowing ==false)
							{
								firstshowing =true;
								$(this).parent().scrollTop($(this).offset().top - $(this).parent().offset().top);
							}
					});
					
				}
				prompt_empty();
				if(is_msie) $(this).blur();
			});

			//strangle
			var _stt=$('#opc_strangle table tbody tr th select');
			_stt.length && _stt.change(function(){
				$(this).parent().parent().parent().children('tr').each(function (i){
					if(this.className==''){
						$(this).remove();
					}
				});
				var tbody = $(this).parent().parent().parent();
				var date = $(this).val().split('_')[0];
				var interval = parseFloat($(this).val().split('_')[1]);

				var tmp_text=[];
				$.each($optionChains,function(i, item){
					var chain=item.chain;
					if(chain.date_str == date){
						$.each(chain.options,function(key,option){
							if(option.side == 'CALL'){
								var callStrike = option.strike;
								var callAsk = option.ask;
								var callBid = option.bid;
								var callVolume = option.volume;
								var callColor,putColor;
								if(callStrike < $stockPrice){
									callColor = 'yellow ';
									putColor = '';
								}else{
									callColor = '';
									putColor = 'yellow ';
								}
								$.each(chain.options,function(key,option){
									if(callStrike - option.strike == interval && option.side == 'PUT'){
										tmp_text.push('<tr>'
								+'<td class="' + callColor+ ' left_d"><a href="javascript:void(0)"><span>'+ callStrike.toFixed(2) +' Call</span></a></td>'
								+'<td class="' + callColor+ '"><a href="javascript:void(0)">'+ callBid +'</a></td>'
								+'<td class="' + callColor+ '"><a href="javascript:void(0)">'+ callAsk +'</a></td>'
								+'<td class="' + callColor+ '">'+ callVolume +'</td>'
								+'<td class="gray_r">'+ callStrike.toFixed(2) +'C/'+ option.strike.toFixed(2) +'P</td>'
								+'<td class="gray_r"><a href="javascript:void(0)">'+ (parseFloat(callAsk) + parseFloat(option.ask)).toFixed(2) +'</a></td>'           
								+'<td class="gray_r"><a href="javascript:void(0)">'+ (parseFloat(callBid) + parseFloat(option.bid)).toFixed(2) +'</a></td>'     
								+'<td class="gray_r"><a href="javascript:void(0)">'+ (parseFloat(callBid) + parseFloat(option.bid)).toFixed(2) +'</a></td>'
								+'<td class="gray_r"><a href="javascript:void(0)">'+ (parseFloat(callAsk) + parseFloat(option.ask)).toFixed(2) +'</a></td>'
								+'<td class="' + putColor+ 'left_d"><a href="javascript:void(0)"><span>'+ option.strike.toFixed(2) +' Put</span></a></td>'
								+'<td class="' + putColor+ '"><a href="javascript:void(0)">'+ option.bid +'</a></td>'
								+'<td class="' + putColor+ '"><a href="javascript:void(0)">'+ option.ask +'</a></td>'     
								+'<td class="' + putColor+ '">'+ option.volume +'</td>'
								+'</tr>');
									}
								});
							}
						});
					}
				})	
				tbody.append(tmp_text.join(''));
			});


			if(!is_msie) {
				update_comp_chg();
			}

			$('#opc_greeks .symbol_h ul li input:radio').click(function(){
				var date = parseInt($(this).attr('name').split('_')[1]);
				var side = $(this).val();
				$('#greeks_table_'+date).find('tr').each(function (j){
					if(j>0){
						$(this).remove();
					}					
				});
				var greeks = {};
				$.each($greeksArr, function() {
					if(this.date && $.format.date(this.date, 'yyyyMMdd')==date){
						greeks = this;
						return false; //added
					}
				});
				$.each(greeks.options, function(key,value) {
					if(value.side == side ){
						var occ_symbol = ($ocs + " " + $.format.date(greeks.date, 'MMM dd yyyy') + " " + value.strike + " " + value.side).toUpperCase();
						$("#greeks_table_"+date).append('<tr><td>'+value.strike+'</td><td style="text-align:left;"><a href="javascript:void(0)">'+occ_symbol+'</a></td><td><a href="javascript:void(0)">'+value.bid+'</a></td><td><a href="javascript:void(0)">'+value.ask+'</a></td><td>'+value.imp_vol+'</td><td>'+value.opt_val+'</td><td>'+value.delta+'</td><td>'+value.gamma+'</td><td>'+value.theta+'</td><td>'+value.vega+'</td><td>'+value.rho+'</td></tr>');
					}
				});									

			});
			var foundinputmonth=false;
			$('#opc_expDates li a').each(function( index ) {
				if($(this).prop( "rel" )==inputmonth)
				{
					$(this).click();
					foundinputmonth=true;
				}	
			})
			if(foundinputmonth==false)
				$('#opc_expDates li a.monthly').eq(0).click();
			if(_stt.length>0) _stt.get(0).selectedIndex=1;
			_stt.length && _stt.trigger('change');
			gc_clicked=false;

		
		});
	}

	function change_chain_type() {
		$section=$('#chain_type_select').val();
		var cr_dd=$('#chains_range');
		cp_div.hide();
		strangle_div.hide();
		st_div.hide();
		vcs_div.hide();
		vps_div.hide();
		ccs_div.hide();
		cps_div.hide();
		greeks_div.hide();
		switch($section) {
			case 'cp': cr_dd.prop('disabled', false); cp_div.show(); break;
			case 'g': cr_dd.prop('disabled', false); greeks_div.show(); break;
			case 'st': 
				try {cr_dd.val('A');} catch(ex) { setTimeout( function() {cr_dd.val('A');},1 ); }
				if($('#opc_symbol').val()!='') {$('#optionchaingo').click();}cr_dd.prop('disabled', true);
				st_div.show(); break;
			case 'vcs': cr_dd.prop('disabled', false); is_msie&&vcs_change(); vcs_div.show(); break;
			case 'vps': cr_dd.prop('disabled', false); is_msie&&vps_change(); vps_div.show(); break;
			case 'ccs': cr_dd.prop('disabled', false); is_msie&&ccs_change(); ccs_div.show(); break;
			case 'cps': cr_dd.prop('disabled', false); is_msie&&cps_change(); cps_div.show(); break;
			default: cr_dd.prop('disabled', false); cp_div.show();
		}
		comp_pick_1();
	}

	window.OPC.init=init;	
	window.OPC.gc=gc;
	window.OPC.cct=change_chain_type;
	window.OPC.fill_opt_order=fill_opt_order;
	window.OPC.gsq=gsq;
	window.OPC.gsq_main=gsq_main;
	window.OPC.fco=fill_comp_order;
	window.OPC.gc_sym=gc_sym;
	window.OPC.norm_xml=norm_xml;
})();

(function() {
	if(!window.ODB) window.ODB={};
	var lc_ph,lc_sym,lc_bid,lc_ask,lc_chg,lc_vol,lc_charts,lc_quotes,lc_news,lc_updated,lc_delayed,lc_rt,qdiv;
	function init(d) {
		lc_sym=d.sym||'Symbol';
		lc_bid=d.bid||'Bid';
		lc_ask=d.ask||'Ask';
		lc_chg=d.chg||'Change';
		lc_vol=d.vol||'Volume';
		lc_charts=d.charts||'Charts';
		lc_quotes=d.quotes||'Quotes';
		lc_news=d.news||'News';
		lc_updated=d.updated||'Updated';
		lc_delayed=d.delayed||'Delayed';
		lc_rt=d.delayed||'Realtime';
		lc_ph=d.ph||'Please enter a stock, option, or mutual fund symbol to the left and click [GO]';
		lc_invalid_symbol=d.invalid_symbol||'<strong>Invalid symbol.</strong>';
		qdiv=$('#quotedata');
	}
	function parse_chg(chg, val_chg) {
		var m=chg.toString().match( /([+-]\d+)\.(\d+)/ );
		if(m) {
			var i=m[1].length, r=m[2].length;
			if(i+r>6) {
				var cv=round_num(val_chg, 6-i);
				return cv>=0? '+'+cv: cv.toString();
			}
		}
		return chg;
	}

	function round_num(num, dec) {
		if(dec<0) {dec=0;}
		var result = Math.round( Math.round( num * Math.pow( 10, dec + 1 ) ) / Math.pow( 10, 1 ) ) / Math.pow(10,dec);
		return result;
	}
	function parse_qt(qt) {
		if(!qt||!/^\d{2}:\d{2}:\d{2} (a|p)m$/.test(qt)) return '';
		var r=qt.substr(0,2)*1+qt.substr(2,3)+qt.substr(8,3);
		if(r=='12:00 am') { r='--:--'; }
		return r;
	}
	function trim_dec(v) {
		var m=/^([+-]?(\d+,)*\d+)\.(\d+)*$/.exec(v);
		if(m) {
			return m[1];
		} else {
			return v
		}	
	}
	function parse_x(str) {
		// parse xml
		var xml=OPC.norm_xml(str);
		var quote=$($('response', xml).find('quote')[0]);
		var	change=quote.find('change').text();	
		var val_change=parseFloat(change);
		var cls_chg=val_change>0?' class="green"':(val_change<0?' class="red"':' ');
		var realtime=quote.find('realtime').text();
		var	quotetime=quote.find('quotetime').text();
		var rt_ind=realtime=='T'?parse_qt(quotetime):lc_delayed;
		return {
			symbol:quote.find('symbol').text().toUpperCase(),
			last:quote.find('last').text(),
			bid:quote.find('bid').text(),
			ask:quote.find('ask').text(),
			chg:parse_chg(change, val_change),
			cls_chg:cls_chg,
			vol:quote.find('vol').text(),
			quotetime:rt_ind
		}
	}
	function do_gen_q(q) {
		//if(!lc_bid) init({});
		var symbol=q.symbol;
		var fix2dec_quote = new Fix2dec_quote(q.last,q.chg,'0.00','0.00',q.bid,q.ask,"+0.00");
		fix2dec_quote.update2Dec();
		q.last = fix2dec_quote.last;
		q.chg = fix2dec_quote.change;
		q.bid = fix2dec_quote.bid;
		q.ask = fix2dec_quote.ask;
		
		
		if(symbol=='') { qdiv.html('<ul><li class="quote_ph">'+lc_invalid_symbol+'</li></ul>'); return; }
		var is_stock=symbol.length<=6;
		var qcls=is_stock?'odbq':'odbq odbq2';
		if(parseFloat(q.last.replace(',', ''))>10000) {
			q.last=trim_dec(q.last);
			q.chg=trim_dec(q.chg);
			q.bid=trim_dec(q.bid);
			q.ask=trim_dec(q.ask);
		}
		if(!is_stock) {
			var x=/^(.* )(Call|put)$/i.exec(symbol);
			if(x) { symbol=x[1]+x[2].substr(0,1); }
		}

		var h='<table class="'+qcls+'" cellpadding="0">';
		h+='<colgroup>';
		h+='<col class="col_sym">';
		h+='<col class="col_last">';
		h+='<col class="col_chg">';
		h+='<col class="col_bid">';
		h+='<col class="col_ask">';
		h+='<col class="col_vol">';
		h+='<col class="col_updated">';
		if(is_stock) {
			h+='<col class="col_idc">';
			h+='<col class="col_idc">';
			h+='<col class="col_idc">';
		}
		h+='</colgroup><tr class="lbl">';
		h+='<th>'+lc_sym+'</th>';
		h+='<th>'+lc_last+'</th>';
		h+='<th>'+lc_chg+'</th>';
		h+='<th>'+lc_bid+'</th>';
		h+='<th>'+lc_ask+'</th>';
		h+='<th>'+lc_vol+'</th>';
		h+='<th>'+lc_updated+'</th>';
		if(is_stock) {h+='<th colspan="3">&nbsp;</th>';}
		h+='</tr><tr class="dat">';
		h+='<td><a href="javascript:void(0);" onclick="javascript:ShowCheatSheet(\''+symbol+'\');">'+symbol+'</a></td>';
		h+='<td>'+q.last+'</td>';
		h+='<td'+q.cls_chg+'>'+q.chg+'</td>';
		h+='<td><a href="javascript:void(0);" onclick="javascript:orderbar_changelimitorder(\''+q.bid+'\',\''+symbol+'\',\'bid\');">'+q.bid+'</a></td>';
		h+='<td><a href="javascript:void(0);" onclick="javascript:orderbar_changelimitorder(\''+q.ask+'\',\''+symbol+'\',\'ask\');">'+q.ask+'</a></td>';
		h+='<td>'+q.vol+'</td>';
		h+='<td class="qtime">'+q.quotetime+'</td>';
		if(is_stock) {
			h+='<td><a class="icharts" href="javascript:void(0)" title="'+lc_charts+'" onclick="javascript:headerChange(\'/content/researchtools/rt-market/research/?ap=charts&ticker='+symbol+'\');">Charts</a></td>';
			h+='<td><a class="iquote" href="javascript:void(0)" title="'+lc_quotes+'" onclick="javascript:headerChange(\'/content/researchtools/rt-market/research?ticker='+symbol+'\');">Quotes</a></td>';
			h+='<td><a class="inews" href="javascript:void(0)" title="'+lc_news+'" onclick="javascript:headerChange(\'/content/researchtools/rt-market/research/?ap=news&ticker='+symbol+'\');">News</a></td>';
		}
		h+='</tr><table>';
		qdiv.html(h);
	}
	// static
	function gen_q(str) {
		var q=parse_x(str);
		do_gen_q(q);
	}
	// live
	function ls_gen_q(obj) {
		if(!obj) return;
		/*
		var chg=obj.getNewValue('5');
		var val_change=parseFloat(chg);
		var cls_chg=val_change>0?' class="green"':(val_change<0?' class="red"':' ');
		//var rt_ind=realtime=='T'?quotetime.substr(0,5)+quotetime.substr(8,3):lc_delayed;
		var rt_ind='';
		var _sym=obj.getNewValue('4')||'';
		if(!_sym) return;
		var q={
			symbol:_sym,
			last:obj.getNewValue('3'),
			bid:obj.getNewValue('1'),
			ask:obj.getNewValue('2'),
			vol:obj.getNewValue('7'),
			quotetime:parse_qt(obj.getNewValue('9')),
			chg:chg,
			cls_chg:cls_chg,
			rt_ind:rt_ind
		};
		*/
		var fix2dec_quote = new Fix2dec_quote(obj.getNewValue('3'),obj.getNewValue('5'),obj.getNewValue('10'),obj.getNewValue('11'),obj.getNewValue('1'),obj.getNewValue('2'),"+0.00");
		fix2dec_quote.update2Dec();
		
		var chg=fix2dec_quote.change;
		var val_change=parseFloat(chg);
		var cls_chg=val_change>0?' class="green"':(val_change<0?' class="red"':' ');
		//var rt_ind=realtime=='T'?quotetime.substr(0,5)+quotetime.substr(8,3):lc_delayed;
		var rt_ind='';
		var _sym=obj.getNewValue('4')||'';
		if(!_sym) return;
		var q={
			symbol:_sym,
			last:fix2dec_quote.last,
			bid:fix2dec_quote.bid,
			ask:fix2dec_quote.ask,
			vol:obj.getNewValue('7'),
			quotetime:parse_qt(obj.getNewValue('9')),
			chg:fix2dec_quote.change,
			cls_chg:cls_chg,
			rt_ind:rt_ind
		};
		
		do_gen_q(q);
	
	}
	// live
	/*
	//Lightstream 6.0 Client
	function ls_gen_q2(obj) {
		if(!obj) return;
		var fix2dec_quote = new Fix2dec_quote(obj.getValue('last'),obj.getValue('change'),'0.00','0.00',obj.getValue('bid'),obj.getValue('ask'),"+0.00");
		fix2dec_quote.update2Dec();
		
		var chg=fix2dec_quote.change;
		var val_change=parseFloat(chg);
		var cls_chg=val_change>0?' class="green"':(val_change<0?' class="red"':' ');
		var rt_ind='';
		var _sym=obj.getValue('symbol')||'';
		if(!_sym) return;
		var q={
			symbol:_sym,
			last:fix2dec_quote.last,
			bid:fix2dec_quote.bid,
			ask:fix2dec_quote.ask,
			vol:obj.getValue('vol'),
			quotetime:parse_qt(obj.getValue('tradetime')),
			chg:fix2dec_quote.change,
			cls_chg:cls_chg,
			rt_ind:rt_ind
		};
		
		do_gen_q(q);
	}
	//Lightstream 6.0 Client
	*/
	window.ODB.gen_q=gen_q;
	window.ODB.ls_gen_q=ls_gen_q;
	//Lightstream 6.0 Client
	//window.ODB.ls_gen_q2=ls_gen_q2;
	//Lightstream 6.0 Client
	window.ODB.init=init;
})();

$(document).ready( function() {
	window.onresize=function(){ updateOptionChainHeight(); }
	$('#opc_symbol').bind('mouseup', function(e) {
		e.preventDefault();
	});
	$('a.show_btn, a.hide_btn').click(function(){
		$(this).parent().parent().children('div:gt(1)').toggle()
		$(this).parent().parent().children('ul').toggle()

		if(this.className == 'show_btn'){
			this.className = 'hide_btn'
		}else{
			this.className = 'show_btn'
		}
		return false
	});
});
function update2Dec_quote(){
	var tempchange = this.change;
	var templast = this.last;
	var tempask = this.ask;
	var tempbid = this.bid;
	var temphigh = this.high;
	var templow = this.low;
	if(tempchange ==null) {
		tempchange = 0;
	} else {
		tempchange=tempchange.replace(/(?:\+|,)/g,'');
	}
	if(templast ==null) {
		templast = 0;
	} else {
		tempchange=tempchange.replace(/(?:\+|,)/g,'');
	}
	if(tempask ==null)
		tempask = 0;
	else
		tempask = tempask.replace(",","");
	if(tempbid ==null)
		tempbid = 0;
	else
		tempbid=tempbid.replace(",","");
	if(temphigh ==null)
		temphigh = 0;
	else
		temphigh=temphigh.replace(",","");
	if(templow ==null)
		templow = 0;
	else
		templow=templow.replace(",","");
	if(templast ==null || templast ==0) 
        	templast = 0;
    	else
        	templast=templast.replace(",","");
	templast  = parseFloat(templast);
	tempchange = parseFloat(tempchange);
	tempask  = parseFloat(tempask);
	tempbid = parseFloat(tempbid);
	temphigh  = parseFloat(temphigh);
	templow = parseFloat(templow);
	
	if(tempask==0)
		this.ask = "0.00";
	else
	{
		if(templast>1)
			tempask=tempask.toFixed(2);
		this.ask = FTL.addCommas(tempask);
	}
	if(tempbid==0)
		this.bid = "0.00";
	else
	{
		if(templast>1)
			tempbid= tempbid.toFixed(2);
		this.bid = FTL.addCommas(tempbid);
	}
	if(temphigh==0)
		this.high = "0.00";
	else
	{
		if(templast>1)
			temphigh= temphigh.toFixed(2);
		this.high = FTL.addCommas(temphigh);
	}
	if(templow==0)
		this.low = "0.00";
	else
	{
		if(templast>1)
			templow = templow.toFixed(2);
		this.low = FTL.addCommas(templow);
	}
	
	if(templast==0  )
	{
		this.change = "+0.00";
		this.last = "0.00";
		return;
	}
	var prev = templast-tempchange;
	var newlast = parseFloat(prev.toFixed(2)) + parseFloat(tempchange.toFixed(2));
	newlast = newlast.toFixed(2);
	newlast = FTL.addCommas(newlast);
	
	if(templast>1 ) {
		
		if(tempchange ==0) {
			this.change = "+0.00";
			this.change_percent = "+0.00";
		} else {
			var tempchange_percent=(tempchange/prev*100).toFixed(2);
			if(tempchange_percent.substring(0,1) !="-")
				tempchange_percent = "+"+tempchange_percent;
			this.change_percent = tempchange_percent;
			
			tempchange = tempchange.toFixed(2);
			tempchange = FTL.addCommas(tempchange);
			if(tempchange.substring(0,1) !="-")
				tempchange = "+"+tempchange;
			this.change = tempchange;
		}
		this.last = newlast;
	}
	
}

function deleteStreamingObject(quoteobject)
{
	delete quoteobject.last;
	delete quoteobject.change;
	delete quoteobject.low;
	delete quoteobject.high;
	delete quoteobject.bid;
	delete quoteobject.ask;
	delete quoteobject.change_percent;
	delete quoteobject;
}
function Fix2dec_quote(last,change,high, low, bid,ask,change_percent) {
    this.last = last;
    this.change = change;
	this.low = low;
	this.high = high;
	this.bid = bid;
	this.ask = ask;
	this.change_percent= change_percent;
	this.update2Dec = update2Dec_quote;
}

function streaming_onoff(onoff) {
	if(onoff=='1')
	{
		$.cookie('turn_off_streaming_p_wl',"N");
		if(can_stream==true)
		{
			if(  !(typeof position_streamcount === "undefined")  )
				if(position_streamcount!=0)
	 				updatelightstreamer_watchlist(watchlistgroup,"positiontable");
			if(  !(typeof option_position_streamcount === "undefined")  )
				if(option_position_streamcount!=0)
	 				updatelightstreamer_watchlist(watchlistgroup_option,"option_positiontable");
			if($("#quotedata .dat td").eq(0).text()!="")
				if($("#quotedata .dat td").eq(0).text().length>15)
					getSingleOptionquote($("#quotedata .dat td").eq(0).text())
				else
					updatelightstreamer($("#quotedata .dat td").eq(0).text())
		//	$(".streaming_on").show();
		//	$(".streaming_off").hide();
		}
	}
	else
	{
		$.cookie('turn_off_streaming_p_wl',"Y");
	//	$(".streaming_on").hide();
	//	$(".streaming_off").show();
		var tablemap = pushPage.getTables();
		$.each(tablemap, function(key, value) { 
		//  if(key.toUpperCase().substring(0,9)=="WATCHLIST" )
		//  {
			pushPage.removeTable(key);
		//  }
		});
		
	}
}

function updatelightstreamer_watchlist(group2,section)
{
	if(pushPage.getTable("watchlist"+section)!=null)
	{
		pushPage.removeTable("watchlist"+section);
	}
	schema2 = 'bid ask last symbol change index_number vol tick tradetime high low bidasksize exchange change_percent';
	myTable2 = new NonVisualTable(group2,schema2,'MERGE');
	myTable2.setSnapshotRequired(true);
	myTable2.setDataAdapter('QUOTE');
	myTable2.onItemUpdate = function (itemPos, updateInfo, itemName) {
		
		
		
		if(updateInfo.getNewValue('4')!=null)
		{
				var fix2dec_quote = new Fix2dec_quote(updateInfo.getNewValue('3'),updateInfo.getNewValue('5'),updateInfo.getNewValue('10'),updateInfo.getNewValue('11'),updateInfo.getNewValue('1'),updateInfo.getNewValue('2'),updateInfo.getNewValue('14'));
				fix2dec_quote.update2Dec();
			
			    var alldaygain = 0;
				var totalvalue = 0;
				var overallgain = 0 ;
				var overcost = 0;
				var totalprev = 0;
				
				
				$("#"+section+" .streaming52").each(function(index) {
					
					
					var qty = parseFloat($(this).children("#qty").val().replace("+", "").replace(",", ""));
					var cost = parseFloat($(this).children("#cost").val().replace("+", "").replace(",", ""));
					var adj_cost = parseFloat($(this).children("#adj_cost").val().replace("+", "").replace(",", ""));
					var fcgi_change = parseFloat($(this).children("#fcgi_change").val().replace("+", "").replace(",", ""));
					var fcgi_last = parseFloat($(this).children("#fcgi_last").val().replace("+", "").replace(",", ""));
					//if($(this).text().substring(0,updateInfo.getNewValue('4').length) ==updateInfo.getNewValue('4'))
					if(trim($(this).text()) ==updateInfo.getNewValue('4') || ( $(this).text().indexOf(updateInfo.getNewValue('4')) !=-1 && $(this).text().length>15))
					{
						$(this).parent().find(".streaming1").text(fix2dec_quote.last);
						$(this).children("#fcgi_last").val(fix2dec_quote.last);
						fcgi_last = parseFloat(fix2dec_quote.last.replace("+", "").replace(",", ""));
						$(this).parent().find(".streaming30").text(fix2dec_quote.ask);
						$(this).parent().find(".streaming28").text(fix2dec_quote.bid);
						$(this).parent().find(".streaming34").text(fix2dec_quote.high);
						$(this).parent().find(".streaming35").text(fix2dec_quote.low);
						var bidasksize = updateInfo.getNewValue('12').split("x");
						$(this).parent().find(".streaming29").text(bidasksize[0]);
						$(this).parent().find(".streaming31").text(bidasksize[1]);
						$(this).parent().find(".streaming5").text(FTL.addCommas(updateInfo.getNewValue('7')));
						$(this).children("#fcgi_change").val(fix2dec_quote.change);
						fcgi_change = parseFloat(fix2dec_quote.change.replace("+", "").replace(",", ""));
					
					
					
					
						var pos_change =$(this).parent().find(".streaming3");
						pos_change.text(fix2dec_quote.change);
						pos_change.removeClass('red green');
						if(fcgi_change<0)
							pos_change.addClass('red');
						else if(fcgi_change>0)
							pos_change.addClass('green');
					
						
						if(fcgi_change==0)	
						{
							var pos_change_percent = $(this).parent().find(".streaming4");
							pos_change_percent.text("+0.00");
						}
						else
						{			
							var tempchange_percent = parseFloat(fix2dec_quote.change_percent.replace("+", "").replace(",", ""));
							var pos_change_percent = $(this).parent().find(".streaming4");
							pos_change_percent.text(fix2dec_quote.change_percent);
						}
						pos_change_percent.removeClass('red green');
						if(tempchange_percent<0)
							pos_change_percent.addClass('red');
						else if(tempchange_percent>0)
							pos_change_percent.addClass('green');
				

						if(section !='option_positiontable')
							var daygain =  fcgi_change * qty;		
						else
							var daygain =  fcgi_change * qty* 100;

								
						var pos_daygain = $(this).parent().find(".streaming47");
						pos_daygain.removeClass('red green');
						if (daygain == 0)
							daygain = "+0.00";
						else if (daygain > 0)
						{
							daygain = "+"+ FTL.addCommas(daygain.toFixed(2));
							pos_daygain.addClass('green');
						}
						else
						{
							daygain = FTL.addCommas(daygain.toFixed(2));
							pos_daygain.addClass('red');
						}
						pos_daygain.text(daygain);
					
					
					
						if(section !='option_positiontable')
							var gain = fcgi_last* qty - cost ;
						else
							var gain = fcgi_last* qty* 100 - cost ;
						if(cost==0)
							gain = 0;
						var pos_gain = $(this).parent().find(".streaming49");
						pos_gain.removeClass('red green');
						if (gain == 0)
							gain = "+0.00";
						else if (gain > 0)
						{
							pos_gain.addClass('green');
							gain = "+"+ FTL.addCommas(gain.toFixed(2));
						}
						else
						{
							pos_gain.addClass('red');
							gain = FTL.addCommas(gain.toFixed(2));
						}
						pos_gain.text(gain);
					
					
					
						if(section !='option_positiontable')
							var gain_pct = (fcgi_last*qty - cost)/cost*100;
						else
							var gain_pct = (fcgi_last*qty*100 - cost)/cost*100;
						if(cost==0)
							gain_pct = 0;
						var pos_gain_pct =$(this).parent().find(".streaming48");
						pos_gain_pct.removeClass('red green');
						if (cost==0)
							gain_pct = "+0.00";
						else if (gain_pct > 0 )
						{
							pos_gain_pct.addClass('green');
							gain_pct = "+"+ FTL.addCommas(gain_pct.toFixed(2));
						}
						else
						{
							pos_gain_pct.addClass('red');
							gain_pct = FTL.addCommas(gain_pct.toFixed(2));
						}	
						pos_gain_pct.text(gain_pct);
					
					
						if(section !='option_positiontable')
							var adj_gain = fcgi_last* qty - adj_cost ;
						else
							var adj_gain = fcgi_last* qty* 100 - adj_cost ;
						var pos_adj_gain = $(this).parent().find(".streaming55");
						pos_adj_gain.removeClass('red green');
						if (adj_gain == 0 || adj_cost==0)
							adj_gain = "+0.00";
						else if(adj_gain > 0)
						{
							pos_adj_gain.addClass('green');
							adj_gain = "+"+ FTL.addCommas(adj_gain.toFixed(2));
						}
						else
						{
							pos_adj_gain.addClass('red');
							adj_gain = FTL.addCommas(adj_gain.toFixed(2));
						}
						pos_adj_gain.text(adj_gain);


						if(section !='option_positiontable')
							var adj_gain_pct = (fcgi_last*qty - adj_cost)/adj_cost*100;
						else
							var adj_gain_pct = (fcgi_last*qty*100 - adj_cost)/adj_cost*100;
						var pos_adj_gain_pct = $(this).parent().find(".streaming56");
						pos_adj_gain_pct.removeClass('red green');
						if (adj_cost==0)
							adj_gain_pct = "+0.00";
						else if (adj_gain_pct > 0 )
						{
							pos_adj_gain_pct.addClass('green');
							adj_gain_pct = "+"+ FTL.addCommas(adj_gain_pct.toFixed(2));
						}
						else
						{
							pos_adj_gain_pct.addClass('red');
							adj_gain_pct = FTL.addCommas(adj_gain_pct.toFixed(2));
						}
						pos_adj_gain_pct.text(adj_gain_pct);
					
					
					}
					if(!$(this).hasClass("open_tr") )
					{
						if(section !='option_positiontable')
						{
							alldaygain = alldaygain+ (fcgi_change * qty);
							totalvalue = totalvalue+ (fcgi_last * qty);
							if(cost!=0)
								overallgain = overallgain + (fcgi_last * qty) - cost ;
							overcost = overcost + cost ;
							totalprev  = totalprev + ((fcgi_last - fcgi_change) * qty) ;
						}
						else
						{
							alldaygain = alldaygain+ (fcgi_change * qty* 100);
							totalvalue = totalvalue+ (fcgi_last * qty * 100);
							if(cost!=0)
								overallgain = overallgain + (fcgi_last * qty* 100) - cost ;
							overcost = overcost + cost ;
							totalprev  = totalprev + ((fcgi_last - fcgi_change) * qty* 100) ;
						}
					
					}
					

				});
				$("#"+section).prev().find(".tt").text("$"+FTL.addCommas(totalvalue.toFixed(2)));
				
				var pos_dg = $("#"+section).prev().find(".dg");
				var pos_dgp = $("#"+section).prev().find(".dgp");
				var pos_og = $("#"+section).prev().find(".og");
				var pos_ogp = $("#"+section).prev().find(".ogp");
				if(alldaygain==0)
				{
					pos_dg.text("+$0.00");
					pos_dg.attr('style','color:5B5C5C');
				}	
				else if(alldaygain>0)
				{
					pos_dg.text("+$"+FTL.addCommas(alldaygain.toFixed(2)));
					pos_dg.attr('style','color:green');
				}
				else if(alldaygain<0)
				{
					pos_dg.text("-$"+FTL.addCommas(alldaygain.toFixed(2).substring(1)));
					pos_dg.attr('style','color:red');
				}
				
				if(alldaygain==0 || totalprev==0 )
				{
					pos_dgp.text("+0.00%");
					pos_dgp.attr('style','color:5B5C5C');
				}	
				else if(alldaygain/totalprev*100 > 0)
				{
					pos_dgp.text("+"+FTL.addCommas((alldaygain/totalprev*100).toFixed(2))+"%");
					pos_dgp.attr('style','color:green');
				}
				else if(alldaygain/totalprev*100 < 0)
				{
					pos_dgp.text(FTL.addCommas((alldaygain/totalprev*100).toFixed(2))+"%");
					pos_dgp.attr('style','color:red');
				}
				
				if(overallgain==0 )
				{
					pos_og.text("+$0.00");
					pos_og.attr('style','color:#5B5C5C');
				}	
				else if(overallgain > 0)
				{
					pos_og.text("+$"+FTL.addCommas(overallgain.toFixed(2)));
					pos_og.attr('style','color:green');
				}
				else if(overallgain < 0)
				{
					pos_og.text("-$"+FTL.addCommas(overallgain.toFixed(2).substring(1)));
					pos_og.attr('style','color:red');
					
				}
				if(overallgain==0 || overcost==0)
				{
					pos_ogp.text("+0.00%");
					pos_ogp.attr('style','color:#5B5C5C');
				}	
				else if(overallgain/overcost*100 > 0)
				{
					pos_ogp.text("+"+FTL.addCommas((overallgain/overcost*100).toFixed(2))+"%");
					pos_ogp.attr('style','color:green');
				}
				else if(overallgain/overcost*100 < 0)
				{
					pos_ogp.text(FTL.addCommas((overallgain/overcost*100).toFixed(2))+"%");
					pos_ogp.attr('style','color:red');

				}
				
				
				deleteStreamingObject(fix2dec_quote);

			
			
		}
	}
	pushPage.addTable(myTable2,"watchlist"+section);

}

function convertStreamingSymbol(symbol)
{
		var symbolarr = symbol.split(" ");
		price_array = symbolarr[2].split(".");
		var templength = price_array[0].length;
		var templength1 = price_array[1].length;
		for(i=0; i < 5 -templength  ; i++)
			price_array[0]= "0"+ price_array[0];
		for(i=0; i < 3 -templength1  ; i++)
			price_array[1]= price_array[1]+"0";
			
		var tempcallput;
		if( symbolarr[3].toUpperCase()=="CALL" )
			tempcallput = "C";
		else
			tempcallput = "P";
		month = symbolarr[1].substring(8,10) +symbolarr[1].substring(0,2)+ symbolarr[1].substring(3,5);
		symbol = symbolarr[0].toUpperCase()+month+tempcallput+price_array[0]+price_array[1];
		return symbol;
}


function updatelightstreamer_chain(symbol)
{
	symbol= symbol.replace(" ","");
	group_chain = 'r8_quote_chain_' + $.trim(symbol.toUpperCase())+" ";
	schema_chain = 'bid ask last symbol change index_number vol tick tradetime';
	myTable_chain = new NonVisualTable(group_chain,schema_chain,'MERGE');
	myTable_chain.setSnapshotRequired(true);
	myTable_chain.setDataAdapter('QUOTE');
	myTable_chain.onItemUpdate = function (itemPos, updateInfo, itemName) {
		ODB.ls_gen_q(updateInfo); return;
	}
	pushPage.addTable(myTable_chain,"chain");
}
