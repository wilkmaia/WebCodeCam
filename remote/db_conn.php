<?php

class DBConnection
{
    private $conn;
    private $sql;
	private $errorVar;

    public function __construct()
    {
        $this->conn = new PDO( DB_DSN, DB_USERNAME, DB_PASSWORD, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING) );
    }

    public function setSql( $a="" )
    {
        $this->sql = mysql_escape_string( $a );
    }

    public function executeQuery( $ar = array() )
    {
        $st = $this->conn->prepare($this->sql);
        if( $st->execute($ar) == true )
			$this->errorVar = 0;
		else
		{
			$this->errorVar = $st->errorCode();
			return false;
		}
        
        $list = array();
        while( $row = @$st->fetch() )
            $list[] = $row;
        return $list;
    }
	
	public function checkError()
	{
		return $this->errorVar;
	}

    public function __destruct()
    {
        $this->conn = null;
        $this->sql = null;
    }
}

?>