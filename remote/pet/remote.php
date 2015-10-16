<?php

require "config.php";

function jsonp_encode($data)    
{
	$json = json_encode($data);
	return isset($_GET['callback']) ? "{$_GET['callback']}(".$json.")" : $json;
}

$opt = $_GET["opt"];
$db = new DBConnection();


/*
	OPЧеES VСLIDAS

# 1 - Cadastrar frequъncia
# 2 - Listar Usuсrios
# 3 - Listar Eventos

*/


switch( $opt )
{
	case "1":
		if ( $_GET["usuario"] == "" )
		{
			echo jsonp_encode("");
			break;
		}
		
		$users = explode( ',', $_GET["usuario"] );
		$events = explode( ',', $_GET["evento"] );
		$res = [];
		
		for( $i = 0; $i < sizeof($users); $i = $i + 1 )
		{
			$ar = [
				":id" => $users[$i],
			];
			$db->setSql( "SELECT * FROM cadastros WHERE id = :id" );
			$a = @$db->executeQuery($ar);
			
			// ID nуo registrado
			if( count($a) == 0 )
			{
				$a["id"] = -1;
				$res[] = json_encode($a);
				
				continue;
			}
			
			// ID registrado
			// Busca evento
			$ar = [
				":id" => $users[$i],
				":e" => $events[$i],
			];
			$db->setSql( "INSERT INTO frequencia ( usuario, evento ) VALUES ( :id, :e )" );
			@$db->executeQuery($ar);
			
			$a = $a[0];
			$a["evento"] = $events[$i];
			$a["error"] = $db->checkError();
			
			$res[] = json_encode($a);
		}
		
		echo jsonp_encode($res);
		break;
		
	
	
	case "2":
		$db->setSql( "SELECT * FROM cadastros" );
		$q = @$db->executeQuery();
		
		foreach( $q as $a )
		{
			$a["error"] = $db->checkError();
			$a = array_map("utf8_encode", $a);
			$res[] = json_encode($a);
		}
		
		echo jsonp_encode($res);
		break;
	
	
	
	case "3":
		$db->setSql( "SELECT * FROM eventos" );
		$q = $db->executeQuery();
		
		foreach( $q as $a )
		{
			$a["error"] = $db->checkError();
			$a = array_map("utf8_encode", $a);
			$res[] = json_encode($a);
		}
		
		echo jsonp_encode($res);
		break;
}

?>