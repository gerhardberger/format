(function($, _) {

	function Styled(selector, filename) {
		var styles

		if (filename) {
			var fs = filename.replace(/\s/g,'').split(',').map(function(f) { return f + '.css' })
			styles = fs.map(function(fname) {
				return _.filter(document.styleSheets, function(style) {
					return (style.href == null) ? false : (style.href.indexOf(fname) > -1)
				})
			})
			styles = _.flatten(styles)
		}
		else { styles = _.map(document.styleSheets, function(s) { return s }) }
		if (styles.length === 0) return

		var rules = styles.map(function(style) {
			return _.filter(style.cssRules, function(rule) {
				if (rule instanceof CSSMediaRule) return false
				var sText = rule.selectorText
					, ix    = sText.indexOf(selector)
					, ix_   = sText.indexOf(selector + ',')
				if (ix === -1) return

				// The rule goes through the filter,
				// IF
				// the selector name is in the `selectorText`
				// and it is not regarding to a preciding element
				// OR
				// the selector name is in a enumeration (ending with an `,`)
				// (the DOM fixes whitespaces and such in the selectors)
				return ((ix + selector.length == sText.length) || (ix_ > -1))
			})
		})
		rules = _.flatten(rules)
		this.matched = rules

		var os = rules.map(function(rule) {
			var style = rule.style
				, keys  = _.map(style, function(s) { return s })
				, keys_ = keys.map(function(key) {
					key = key.replace(/-./g, function(k, ix) {
						// IF the first character is `-` replace with '' 
						return (ix === 0) ? k[1] : k[1].toUpperCase()
					})
					return key
				})

			var o = {}
			keys.map(function(key, ix) {
				var k = keys_[ix]
				o[key] = style[k]
			})

			return o
		})

		// The extend order is how the rule in the file
		// other ordering is possible
		os = _.extend.apply(null, os)

		this.selector = selector
		this.css = os

		return this
	}

	Styled.prototype.get = function(key) {
		return this.css[key]
	}

	$.fn.styled = function(f) {
		return new Styled(this.selector, f)
	}
})(jQuery, _)