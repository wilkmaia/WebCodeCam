<?php

$pageNames = [
    'inicio' => 'Início',
    'pedidos' => 'Pedidos',
    'clientes' => 'Clientes',
    'representadas' => 'Representadas',
    'produtos' => 'Produtos',
    'comissoes' => 'Comissões',
    ];

$actionNames = [
    1 => 'Cadastrar',
    2 => 'Editar',
    3 => 'Visualizar',
    ];

function includeContent( $c )
{
    include CONTENT_PATH . $c . '.php';
}

function page2PageName( $a )
{
    global $pageNames;
    if( isset( $pageNames[$a] ) )
        return $pageNames[$a];
    else
        return '';
}

function action2PageName( $a )
{
    global $actionNames;
    if( isset( $actionNames[$a] ) )
        return $actionNames[$a];
    else
        return '';
}

function pointToCommaSeparator( $a )
{
	$p = '';
	$a = $a * 100;
	
	$i = 0;
	while( $a != 0 )
	{
		$p = ($a % 10) . '' . $p;
		$a = floor($a / 10);
		$i = $i + 1;
		if( $i == 2 )
			$p = ',' . $p;
		
		if( $i % 3 == 2 && $i >= 5 && $a != 0 )
			$p = '.' . $p;
	}
	
	if( $p == "" )
		$p = "0,00";
	
	return $p;
}

function commaToPointSeparator( $a )
{
	$b = explode( ',', $a );
	if( $b[1] )
	{
		$m = pow(10, strlen($b[1]));
		
		$c = $m * $b[0];
		$c = $c + $b[1];
		$c = $c / $m;
	}
	else
		$c = $a;
	
	return $c;
}

function myParseFloat( $n )
{
	$l = strlen( $n );
	$res = 0;
	$f = 0;
	
	for( $i = 0; $i < $l; $i = $i + 1 )
	{
		if( $n[$i] >= '0' && $n[$i] <= '9' )
		{
			$res = $res * 10;
			$res = $res + intval($n[$i]);
			if( $f != 0 )
				$f = $f + 1;
		}
		
		if( $n[$i] == ',' && $f == 0 )
			$f = $f + 1;
	}
	
	if( $f )
		return $res / pow(10, $f - 1);
	else
		return $res;
}

?>