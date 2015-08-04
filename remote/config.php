<?php

ini_set( "display_errors", true );
date_default_timezone_set( "America/Fortaleza" );

define( 'DB_DSN', 'mysql:host=localhost;dbname=eceel_3' );
define( 'DB_USERNAME', 'root' );
define( 'DB_PASSWORD', '' );

define( "ADMIN_PATH", "admin/" );
define( "CONTENT_PATH", "conteudo/" );

define( "ADMIN_USERNAME", "admin" );
define( "ADMIN_PASSWORD", "37fa265330ad83eaa879efb1e2db6380896cf639" ); // sha1 -- pwd

define( "LOGIN_TIME_OUT", 3 );
define( "MAX_LISTING_PER_PAGE", 20 );


function handleException( $e )
{
    echo "Erro!";
    error_log( $e->getMessage() );
}

set_exception_handler( 'handleException' );


include 'utils.php';
include 'db_conn.php';

?>