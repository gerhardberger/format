(function($, _, huk) {
	var abc = 'abcdefghijklmnopqrstuvwxyz'.split('')

	$.fn.nth = function() {
		var that = this[0], lis = $(this).parent().children(), result
		lis.each(function(ix) { if (this === that) result = ix })
		return result
	}
	$.fn.rest = function() { return $(this).slice(1) }
	$.fn.initial = function() { return $(this).slice(0,$(this).length-1) }

	function isTwoPower(n) {
		if (n == 1) return true
		if (n % 2 == 0) return isTwoPower(n/2)
		return false
	}

	function calcMargins(ix) {
		var match = {
			height: 59
			, margin: parseInt($('.bracket-row .match').styled('format').get('margin-top'))
		}

		return { fst: (Math.pow(2, ix-1)-1) * (match.margin + match.height) + match.margin/2 + match.height/2 + match.margin
			, rest: (Math.pow(2, ix)-1) * (match.margin + match.height) + match.margin }
	}

	function getOffset(e) {
		return {
			height: e.offsetHeight
			, width: e.offsetWidth
			, top: e.offsetTop
			, left: e.offsetLeft
		}
	}


	function drawBracket(b) {
		var id = _.uniqueId('bracket-')
			, bracket = huk.div({
				class: 'bracket'
				, id: id
				, content: huk()
					.close('bracket-close')
					.input({
						type: 'text'
						, class: 'format-name'
						, value: b.name
					})
				.val()
			})

		if (!isTwoPower(b.size)) return

		var arr  = []
			, size = b.size
		while (size > 1) {
			arr.push(size/2)
			size /= 2 
		}

		arr = arr.map(function(a, ix) { return huk.bracketRow({n: a, ix: ix}) })
		$(bracket).append(arr)

		$(bracket).find('.bracket-close').on('click', function() {
			$(this).parent().remove()
		})

		return bracket
	}

	function drawDoubleBracket(data) {
		var id = _.uniqueId('dbracket-')
			, bracket = huk.div({
				class: 'bracket'
				, id: id
				, content: huk()
					.close('bracket-close')
					.input({
						type: 'text'
						, class: 'format-name'
						, value: data.name
					})
					.div({ class: 'winner' })
					.div({ class: 'loser' })
				.val()
			})
			, winner = $(bracket).find('.winner')[0]
			, loser = $(bracket).find('.loser')[0]
		;

		if (!isTwoPower(data.size)) return

		var arr  = []
			, size = data.size
		while (size > 1) {
			arr.push(size/2)
			size /= 2 
		}

		var arr_ = arr.map(function(a, ix) {
			return huk.bracketRow({n: a, ix: ix, offset: ix == arr.length-1 ? 2 : 1 })
		})
		$(winner).append(arr_)


		arr = _.rest(arr).length === 1 ? _.rest(arr) :  _.initial(_.rest(arr))
		arr = _.flatten(arr.map(function(a, ix) {
			return [{v: a, ix: ix}, {v: a, ix: ix}]
		})).concat([{v: 1, ix: arr.length}])

		arr = data.size === 4 ? _.initial(arr) : arr
		arr = arr.map(function(a, ix) {
			return huk.bracketRow({n: a.v, ix: ix, ix_: a.ix})
		})

		$(loser).css('margin-top', ($(winner).find('.bracket-row').first().height()+40) + 'px').append(arr)

		$(bracket).find('.bracket-close').on('click', function() {
			$(this).parent().remove()
		})

		return bracket
	}


	// huk bundles
	huk.bundle('close', function(c) {
		return huk.button({
			class: 'close' + (' '+(c || ''))
			, content: '×'
		})
	})

	huk.bundle('bracketMatch', function() {
		return huk()
			.input({ class: 'player A', type: 'text' })
			.input({ class: 'player B', type: 'text' })
		.val()
	})

	huk.bundle('bracketRow', function(data) {
		var row = huk.div({class: 'bracket-row round' + 2*data.n, css: {left: (((data.offset) && (data.ix > 1) ? data.ix*2-data.offset : data.ix) * 205 + 15) + 'px'}})

		huk(row)
			.div({
				class: 'head'
				, content: huk.input({
					value: 'Round of ' + 2*data.n
					, type: 'text'
				})
			})
			.list({
				items: _.range(data.n)
				, justItems: true
				, itemTag: 'div'
				, itemArgs: {
					class: 'match'
					, content: huk.bracketMatch()
				}
			})
		.append()

		if (data.ix === 0) return row

		var fst    = $(row).find('.match').first()
			, rest   = $(row).find('.match').rest()
			, margins = calcMargins(_.isUndefined(data.ix_) ? data.ix : data.ix_)

		fst.css('margin-top', margins.fst + 'px')
		rest.css('margin-top', margins.rest + 'px')

		return row
	})

	huk.bundle('branch', function(p) {
		var h = p.b.y - p.a.y
		if (h === 1) h = 2

		var canvas = huk.canvas({
			class: 'branch'
			, css: {
				top: p.a.y
				, left: p.a.x
			}
			, width: p.m
			, height: Math.abs(h) + 1
		})

		if (h < 0) {
			$(canvas).css({
				'-moz-transform':      'matrix(1, 0, 0, -1, 0, ' + h + ')'
				, '-webkit-transform': 'matrix(1, 0, 0, -1, 0, ' + h + ')'
				, '-o-transform':      'matrix(1, 0, 0, -1, 0, ' + h + ')'
				, 'transform':         'matrix(1, 0, 0, -1, 0, ' + h + ')'
			})
		}

		h = Math.abs(h)

		var ctx = canvas.getContext('2d')

		ctx.beginPath()

		ctx.lineWidth = 1
		ctx.strokeStyle = '#4D4D4D'
		ctx.lineCap = 'square'

		ctx.moveTo(0,1)
		ctx.lineTo(p.m / 2, 1)
		ctx.lineTo(p.m / 2, h-1)
		ctx.lineTo(p.m,     h-1)
		ctx.stroke()

		ctx.closePath()

		return canvas
	})

	huk.bundle('groupsList', function(data) {
		var l = huk.list({
			items: _.range(data.size+1)
			, itemArgs: {
				content: huk.input({type: 'text'})
				, head: function() { $(this).html('Group ' + abc[data.ix].toUpperCase()) }
				, rest: function(e, ix_) { $(this).data('data', { ix: ix_ }).addClass('player') }
			}
		})

		if (data.ix == 0){
			$(l).find('.player').append(huk.close())
			huk(l).button({content: 'Add new!', class: 'new'}).append()
		}

		$(l).on('click', '.player .close', function() {
			var ix = $(this).parent().nth() + 1

			$($(data.self).find('ul li:nth-child(' + ix + ')')).remove()
		})

		$(l).find('.new').on('click', function() {
			$($(data.self).find('ul')).each(function() {
				var nth = $(this).parent().nth() - 1
				if (nth === 0) return

				var c = nth === 1 ?
					huk().input({type: 'text'}).close().val() :
					huk.input({type: 'text'})

				$(this).find('li').last().after(huk.li({
					class: 'player'
					, content: c
				}))
			})
		})

		if (data.ix < 1) return l

		var c = huk.close('close-group')
		$(c).on('click', function() {
			var div = $(this).parent().parent()
				, par = div.parent()

			div.remove()
			par.find('div').each(function(ix) {
				$(this).find('ul li:first-child').html('Group ' + abc[ix].toUpperCase())
			})
		})
		$(l).append(c)

		return l
	})







	// Groups bundle
	huk.bundle('groups', function(o) {
		o = o || {}

		// Set the default values if necessary
		o.name  = o.name  || 'Group Stage'
		o.count = o.count || 1
		o.size  = o.size  || 0


		var id     = _.uniqueId('groups-')
			, groups = huk.div({
				class: 'groups'
				, id: id
				, content: huk()
					.close('groups-close')
					.input({
						type: 'text'
						, class: 'format-name'
						, value: o.name
					}).val()
			})
			, arr    = _.range(o.count + 1).map(function(ix) { return {size: o.size, self: groups, ix: ix} })

		$(groups).find('.groups-close').on('click', function() { $(this).parent().remove() })

		huk(groups).groupsList(arr, 'div').append()

		huk($(groups).find('div').last()).button({ content: 'New group!', class: 'new-group' }).append()

		$(groups).on('click', '.new-group', function(event) {
			var divs = $(groups).find('div')

			var that = this
			$(this).remove()

			huk(groups).div(huk.groupsList({
				size: divs.last().find('ul li').length - 1
				, ix: divs.length
			})).append()

			$(groups).find('div:last-child').append(that)
		})

		return groups
	})


	// Bracket bundle
	huk.bundle('bracket', function(o) {
		o = o || {}

		// Set the default values if necessary
		o.name = o.name || 'Bracket Stage'
		o.size = o.size || 4
		o.type = o.type || 'se'

		return o.type == 'se' ?
			drawBracket(o) :
			drawDoubleBracket(o)
	}, function(o) {
		var self = this
		o = o || {}

		// Set the default values if necessary
		o.type = o.type || 'se'

		if (o.type == 'se') {
			var name = $('.bracket .format-name').styled('format')
				, name_= parseInt(name.get('font-size')) + parseInt(name.get('margin-top')) + 2*parseInt(name.get('margin-bottom')) + 10
			$(self).height(($(self).find('.bracket-row').first().height() + name_) + 'px')

			var init = $(self).find('.bracket-row').initial()
			init.map(function() {
				var row = this

				$(this).find('.match').map(function(ix) {
					var offsetA = getOffset(this)
						, pointA = { x: offsetA.left + offsetA.width, y: offsetA.top + offsetA.height/2 + 4 }

					ix--
					var nextMatch = $(row).next().find('.match')[ ix % 2 === 0 ? ix/2 : (ix+1)/2 ]
						,  offsetB = getOffset(nextMatch)

					offsetB.left = 0
					var pointB = { x: offsetB.left, y: offsetB.top + offsetB.height/2 + 5 }


					huk(this).branch({
						a: pointA
						, b: pointB
						, m: 2 * parseInt($(self).find('.bracket-row').css('margin-right'))
					}).after()
				})
			})
		}
		else {
			var winner = $(this).find('.winner')
				, loser  = $(this).find('.loser')
				, bracket = this
			$(loser).css('margin-top', ($(winner).find('.bracket-row').first().height()+parseInt($(loser).css('margin-top'))) + 'px')
			$(bracket).height(($(loser).find('.bracket-row').first().height() + $(winner).find('.bracket-row').first().height()+100) + 'px')

			var init = $(winner).find('.bracket-row').initial()
			init.map(function() {
				var row = this

				$(this).find('.match').map(function(ix) {
					var offsetA = getOffset(this)
						, pointA = { x: offsetA.left + offsetA.width, y: offsetA.top + offsetA.height/2 + 4 }

					ix--
					var nextMatch = $(row).next().find('.match')[ ix % 2 === 0 ? ix/2 : (ix+1)/2 ]
						,  offsetB = getOffset(nextMatch)

					offsetB.left = parseInt($(nextMatch).parent().css('left')) - parseInt($(self).find('.bracket-row').css('margin-right'))
					var pointB = { x: offsetB.left, y: offsetB.top + offsetB.height/2 + 5 }

					var distance = pointB.x - (parseInt($(this).parent().css('left')) + offsetA.width - parseInt($(self).find('.bracket-row').css('margin-right')))
					huk(this).branch({
						a: pointA
						, b: pointB
						, m: distance
					}).after()
				})
			})

			init = $(loser).find('.bracket-row').initial()
			init.map(function(ix_) {
				var row = this

				$(this).find('.match').map(function(ix) {
					var offsetA = getOffset(this)
						, pointA = { x: offsetA.left + offsetA.width, y: offsetA.top + offsetA.height/2 + 4 }

					ix--
					var nextIx = ix_ % 2 === 0 ? ix + 1	: (ix % 2 === 0 ? ix/2 : (ix+1)/2)
					var nextMatch = $(row).next().find('.match')[nextIx]
						,  offsetB = getOffset(nextMatch)

					offsetB.left = parseInt($(nextMatch).parent().css('left')) - parseInt($(self).find('.bracket-row').css('margin-right'))
					var pointB = { x: offsetB.left, y: offsetB.top + offsetB.height/2 + 5 }

					var distance = pointB.x - (parseInt($(this).parent().css('left')) + offsetA.width - parseInt($(self).find('.bracket-row').css('margin-right')))
					huk(this).branch({
						a: pointA
						, b: pointB
						, m: distance
					}).after()
				})
			})
		}
	})

})(jQuery, _, huk)