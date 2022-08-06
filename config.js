export default {
	order: 'asc', // # asc or desc
	only_most_recent: 2, // 0 for false, # for how many seconds from now logs are considered to be "most recent".
	show_file_path: 1, // 1 shows only the file name. >1 show that many pieces of the path starting from the end.
	collapse_stack_trace: 0, // -1 doesn't collapse it at all. #s show how many stack trace lines to show (starting from most recent) (not including the most recent which is always shown)
	collapse_objects_depth: 0, // false doesn't collapse at all. #s collapse to that depth (0 collapses all levels).
	truncate_text: 500, // false doesn't collapse it at all. # of characters before it collapses the text.
	date_format: 'MMMM Do YYYY ', // http://momentjs.com/docs/#/displaying/format/
	time_format: 'h:mm:ssa',
	levels: ['info', 'notice', 'warning', 'error', 'critical'],
	default_filters: {levels: {'info':1, 'error':1}, saved_filters: [], active_filter: {}}
}