export default function prettyPrint(message, styles) {
	function render(thing, wrap_quotes = false, depth = 0) {
		if (thing === null) {
			return 'null'
		}

		const type = getType(thing)

		if (type == 'array' || type == 'object') {
			return renderObject(thing, depth, 0)
		}

		thing = new String(thing)
		const encoded_thing = encodeHtmlEntity(thing)

		if (depth == 0) {
			return '<div class="text">' + encoded_thing + '</div>'
		} else {
			if (wrap_quotes) {
				return '"' + encoded_thing + '"'
			} else {
				return encoded_thing + ''
			}
		}
	}

	function encodeHtmlEntity(str) {
		const buf = []
		for (var i = 0; i < str.length; i++) {
			buf.push(['&#', str.charCodeAt(i), ';'].join(''))
		}
		
		return buf.join('')
	}

	function truncate(thing, length) {
		return thing.substring(0, length)
	}

	function getType(thing) {
		if (thing === null) {
			return 'null'
		}

		if (thing instanceof Array) {
			return 'array'
		}

		if (thing instanceof Object) {
			return 'object'
		}

		return 'string'
	}

	function renderObject(object, depth, length) {
		let rendered_object = []
		const type = getType(object)

		for (let [key, value] of Object.entries(object)) {
			const child_type = getType(value)
			let empty = ''

			if ((child_type == 'object' && !Object.keys(value).length) || (child_type == 'array' && !value.length)) {
				empty = 'empty'
			}

			const label = `<div class="${styles.key} ${styles.collapsed} ${styles[child_type] || ''} ${styles[empty] || ''}">` + key + `:<div class="${styles.icon}"></div></div>`
			if (child_type == 'string' || child_type == 'null') {
				value = `<div class="${styles.value}">` + render(value, true, depth+1) + `<span class="${styles.comma}">,</span></div>`
			} else { // Render objects/arrays without a value wrapper
				value = render(value, true, depth+1)
			}
			rendered_object.push('<li>' + label + value + '</li>')
		}

		rendered_object = `<ul ng-click="test()" class="${styles.rendered} ${styles.collapsed} ${styles[type]}">` + rendered_object.join('') + '</ul>'

		let toggle_button = ''
		if (depth == 0 && Object.keys(object).length > 3) {
			toggle_button = `<div class="${styles.toggle}"></div>`
		}

		return rendered_object + toggle_button
	}

	return render(message, false, 0)
}