
import config from '/config.js'

module.exports.filePath = function(input) {
	let splitPath
	if (input.indexOf('/') > -1) {
		splitPath = input.split('/')
	} else {
		split_path = input.split('\\')
	}

	let path = split_path.slice - config.show_file_path
	return path.join('/')
}


//   window.Log.filter 'file_path', (CONFIG) ->
// 	return (input) ->
// 		if '/' in input
// 			split_path = input.split '/'
// 		else
// 			split_path = input.split '\\'
			
// 		path = split_path.slice -CONFIG.show_file_path
// 		return path.join('/')

// window.Log.filter 'level', () ->
// 	return (input, levels) ->
// 		filtered = []
// 		angular.forEach input, (value) ->
// 			if levels[value.level]
// 				filtered.push(value)
// 		return filtered

// window.Log.filter 'contains_string', () ->
// 	return (input, $scope) ->
// 		applied_filters = [$scope.filters.active_filter]
// 		saved_filters = $scope.filters.saved_filters.filter (saved_filter) ->
// 			return saved_filter.active
// 		applied_filters = applied_filters.concat saved_filters

// 		angular.forEach applied_filters, (filter) ->
// 			input = input.filter (log) ->
// 				active_regex = new RegExp filter.regex, 'gim'

// 				message = new String log.message
// 				it_matches = false
// 				it_matches = message.match(active_regex)
// 				if it_matches
// 					if parseInt(filter.negate)
// 						return false
// 					return true
// 				else
// 					if parseInt(filter.negate)
// 						return true
					
// 					return false

// 		return input