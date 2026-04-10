<?php
class PrettyLogs {
	private $auth;
	private $project_name;
	private $url;
	private $ignore_https_errors;
	private $ignore_levels = array();

	private $logs = array();
	private $last_sent = null;

	static $instances = array();

	private function __construct($auth = '', $project_name = '', $ignore_https_errors, $url, $ignore_levels = array()) {
		$this->auth = $auth;
		$this->project_name = $project_name;
		$this->url = $url;
		$this->ignore_https_errors = $ignore_https_errors;
		$this->ignore_levels = $ignore_levels;

		static::$instances[] = $this;
	}

	static function init($auth = '', $project_name = '', $ignore_https_errors = false, $url = null, $ignore_levels = array()) {
		if (!$url)
			$url = 'https://prettylogs.com';

		foreach (static::$instances as $instance) {
			if ($instance->auth == $auth && $instance->project_name == $project_name) {
				return $instance;
			}
		}
		$new = new PrettyLogs($auth, $project_name, $ignore_https_errors, $url, $ignore_levels);
		return $new;
	}

	public function plog() {
		$bt = array_slice(debug_backtrace(false), 2, 5); // Drop first 2 backtrace lines as they're pretty_logs.php specific

		$caller = isset($bt[0]) ? $bt[0] : null; // We want to know where the call came from!
		$common_log_data = array(
			'referrer' => self::current_page_url(),
			'level' => 'info',
			'stack_trace' => self::prep_backtrace($bt),
			'context' => self::get_code(isset($caller['file']) ? $caller['file'] : null, isset($caller['line']) ? $caller['line'] : null)
		);

		$args = func_get_args();
		if (count($args) == 1):
			$message = array_shift($args);
		else:
			$message = $args;
		endif;

		$logs = array_merge($common_log_data, array('message' => self::stringify_message($message), 'created' => round(microtime(true) * 1000)));
		$this->write_log_message($logs);
	}

	private function send_log_messages() {
		$this->last_sent = microtime(true);
		if (empty($this->logs)) return;

		$data = json_encode($this->logs);
		$this->logs = array();

		$ch = curl_init($this->url . '/api/intake?project=' . $this->project_name . '&auth=' . urlencode($this->auth));
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
		curl_setopt($ch, CURLOPT_TIMEOUT, 2);
		if ($this->ignore_https_errors) {
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		}
		$http = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
		$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : null;
		$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : null;
		curl_setopt($ch, CURLOPT_REFERER, "$http$host$uri");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($data))
		);

		$response = curl_exec($ch);

		$error = curl_error($ch);
		if ($error) {
			if (strstr($error, 'SSL')) {
				print "<p>Something seems to be wrong with your SSL.</p><p>ERROR: \"$error\".</p><p>If you're not worried about security, you can pass TRUE to init() as the third parameter.</p>";
			} else {
				print "<p>$error</p>";
			}
			error_log($error);
		}

		if ($response) {
			$response = json_decode($response);
			if (isset($response->error)) {
				print '<p>' . $response->error . '</p>';
				error_log($response->error);
			}
		}
	}

	private function write_log_message($message) {
		if (in_array($message['level'], $this->ignore_levels)) {
			return;
		}
		if (!$this->last_sent)
			$this->last_sent = microtime(true);
		$this->logs[] = $message;
		if ((microtime(true) - $this->last_sent) > .5) 
			$this->send_log_messages();
	}

	private static function current_page_url() {
		$pageURL = 'http';
		if (in_array('HTTPS', $_SERVER) && $_SERVER["HTTPS"] == "on") {$pageURL .= "s";}

		$pageURL .= "://";
		if (isset($_SERVER["SERVER_PORT"]) && $_SERVER["SERVER_PORT"] != "80") {
			$pageURL .= (isset($_SERVER["SERVER_NAME"]) ? $_SERVER["SERVER_NAME"] : "") . ":" . (isset($_SERVER["SERVER_PORT"]) ? $_SERVER["SERVER_PORT"] : "" ) . (isset($_SERVER["REQUEST_URI"]) ? $_SERVER["REQUEST_URI"] : "");
		} else {
			$pageURL .= (isset($_SERVER["SERVER_NAME"]) ? $_SERVER["SERVER_NAME"] : "") . (isset($_SERVER["REQUEST_URI"]) ? $_SERVER["REQUEST_URI"] : "");
		}
		return $pageURL;
	}

	private static function get_level($type) {
		switch ($type) {
			case E_ERROR:
			case E_CORE_ERROR:
			case E_USER_ERROR:
				return 'error';
				break;
			case E_PARSE:
				return 'error';
				break;
			case E_WARNING:
			case E_CORE_WARNING:
			case E_USER_WARNING:
				return 'warning';
				break;
			case E_COMPILE_ERROR:
				return 'error';
				break;
			case E_COMPILE_WARNING:
				return 'warning';
				break;
			case E_NOTICE:
			case E_USER_NOTICE:
				return 'notice';
				break;
		}
		return 'info';
	}

	private static function get_code($file, $line) {
		return '';
		if ($file && $line):
			$lines = '';
			$file = new SplFileObject($file);
			$file->seek($line-3);
			for($i = 0; !$file->eof() && $i < 6; $i++) {
				if (!$file->current())
					print 'asdf';
				$lines .= $file->current();
				$file->next();
			}
			return htmlentities($lines);
		endif;
	}

	// Args can get HUUUUGE so we're removing it. Maybe later when/if we decide to display this, we will truncate it to basic info.
	private static function prep_backtrace($bt) {
		foreach ($bt as $key => &$value) {
			unset($value['args']);
		}

		return json_encode($bt);
	}

	private static function stringify_message($message) {
		// TODO: Make this serialize non-arraylike objects. Class names?
		if (is_string($message) || is_numeric($message)):
			return $message;
		elseif (is_object($message)):
			$object_vars = get_object_vars($message);
			if (empty($object_vars)) {
				return print_r($message, true);
			}
			return json_encode($object_vars);
		else:
			return json_encode($message);
		endif;
		// error_log(get_class($message));
		// return json_encode($message);
	}

	static function pretty_logs_handler($errno, $errstr, $errfile = null, $errline = null, $errcontext = null) {
		if (error_reporting() < $errno || E_NOTICE == $errno) return false;
		$log = array(
			'level' => self::get_level($errno),
			'exception' => $errstr,
			'message' => $errstr,
			'stack_trace' => self::prep_backtrace(array_slice(debug_backtrace(false), 1, 5)),
			'created' => round(microtime(true) * 1000),
			'context' => self::get_code($errfile, $errline)
		);

		foreach (static::$instances as $instance) {
			$instance->write_log_message($log);
		}
	}

	static function pretty_logs_shutdown() {
		$lastError = error_get_last(); // returns an array with error information:
		if ($lastError):
			switch ($lastError['type']) {
				case E_ERROR:
				case E_PARSE:
				case E_CORE_ERROR:
				case E_CORE_WARNING:
				case E_COMPILE_ERROR:
				case E_COMPILE_WARNING:
					$lastError['level'] = self::get_level($lastError['type']);
					$lastError['referrer'] = self::current_page_url();
					$lastError['created'] = round(microtime(true) * 1000);
					$lastError['exception'] = $lastError['message'];
					$lastError['stack_trace'] = json_encode(array(array('line' => $lastError['line'], 'file' => $lastError['file'])));
					$lastError['context'] = self::get_code($lastError['file'], $lastError['line']);

					unset($lastError['type']);
					
					foreach (static::$instances as $instance) {
						$instance->write_log_message($lastError);
					}
				break;
			}
		endif;

		foreach (static::$instances as $instance) {
			$instance->send_log_messages();
		}
	}    
}

function plog() {
	foreach (PrettyLogs::$instances as $instance) {
		call_user_func_array(array($instance, 'plog'), func_get_args());
	}
}

register_shutdown_function('PrettyLogs::pretty_logs_shutdown');
set_error_handler('PrettyLogs::pretty_logs_handler', E_ALL);
