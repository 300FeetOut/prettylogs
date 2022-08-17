<?php
	require('./pretty_logs.php'); // The prettylogs lib.
	PrettyLogs::init(
		'b3421560b911bae084e636192ad387ef246129173d559f1c6505d99bd1ab264d175790cbbe7a93070674c84533cc7c11', // Your api key. You'll find it in the top right corner of prettylogs.vercel.app when logged in.
		'Dev', // Project name. If it doesn't exist, it will be created the first time a log is sent to it.
		true, // (true ignores https errors)
		// 'https://prettylogs.vercel.app', // Live prettylogs domain
		'http://localhost:3000' // For developing prettylogs
	);

	function aFunction() {
		bFunction();
	}

	function bFunction() {
		cFunction();
	}

	function cFunction() {
		plog('Lorem ipsum');
		plog(array(
			'Lorem' => 'Ipsum',
			'Dolar' => 'Sit',
			'Etiam' => 'cursus',
			'laoreet' => 'sem',
			'sed' => 'tincidunt',
			'Donec' => 'semper',
			'orci' => 'eu',
			'a' => 'b',
			'c' => 'd',
			'e' => 'f',
			'g' => 'h',
		));
		plog('Elementum ex hendrerit', array(
			'Lorem' => 'Ipsum',
			'Dolar' => 'Sit',
			'Etiam' => 'cursus',
			'laoreet' => 'sem',
			'sed' => 'tincidunt',
			'Donec' => 'semper',
			'orci' => 'eu',
			'sed' => 'tincidunt',
			'Donec' => 'semper',
			'orci' => 'eu'
		));
		dFunction();
		asdf('An error occurred', 1);
	}

	function dFunction() {
		plog(array(
			'key' => 'value',
			'longkey' => 'Curabiturpharetraligulaegetvariussodales.Praesentetcursusaugue.Etiamidultricieslibero.Morbiatdiamnonarcueleifendfermentumvitaeutlibero.Morbiultricesvelitefficiturleofeugiattincidunt.'
		));
	}

	aFunction();
?>