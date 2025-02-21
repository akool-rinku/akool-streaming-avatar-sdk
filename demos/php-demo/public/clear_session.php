<?php
session_start();
unset($_SESSION['akool_session']);
session_destroy();
http_response_code(200); 