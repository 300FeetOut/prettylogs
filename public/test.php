<?php
	require('./pretty_logs.php');
	PrettyLogs::init(
		'e1f4850aab649b48a66aed38074bbe4b84a85fd6',
		'Dev',
		true, // (true ignores https errors)
		'http://localhost:3000'
	);

	plog('asdf');
?>