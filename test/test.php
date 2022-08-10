<?php
	require('./pretty_logs.php');
	PrettyLogs::init(
		'b3421560b911bae084e636192ad387ef246129173d559f1c6505d99bd1ab264d175790cbbe7a93070674c84533cc7c11',
		'Dev',
		true, // (true ignores https errors)
		'http://localhost:3000'
	);

	function aFunction() {
		bFunction();
	}

	function bFunction() {
		cFunction();
	}

	function cFunction() {
		plog('Lorem ipsum');
		plog('Elementum ex hendrerit', array('Lorem' => 'Ipsum', 'Dolar' => 'Sit'));
		asdf('An error occurred', 1);
	}

	aFunction();
?>