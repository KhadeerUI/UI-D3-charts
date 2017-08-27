<?php
error_reporting(E_ERROR | E_PARSE);
$servername = "localhost";
$dbname = "d3";

$conn = new mysqli($servername,'root','',$dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$name = $_POST["name"];
$comment = $_POST["comment"];
$submit = $_POST["submit"];

/*var_dump($_POST); ============ show post data */ 

if(isset($_POST) && !empty($_POST)){
	//if($submit && $comment){
		//$nameVal = $_POST['name'];
		//$commentVal = $_POST['comment'];

		$query = 'INSERT INTO comments (name,comment) VALUES ("'.$name.'", "'.$comment.'")';
		$insert = $conn->query($query);
		
		if($insert){
			echo 'success';			
		} else {
			echo 'failed';
		}
	//}
	//else{
		//echo "Please fill out all the fields";
	//}
}


?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Comments</title>
</head>
<body>
	<form action="comment.php" method="post">
		<table>
			<tr>
				<td>Name: <input type="text" name="name"></td>
			</tr>
			<tr>
				<td>Comment: <textarea name="comment"></textarea></td>
			</tr>
			<tr>
				<td><input type="submit" name="submit" value="Comment"></td>
			</tr>
		</table>
	</form>


<?php

$getquery = $conn->query("SELECT * FROM comments ORDER BY id DESC");
while($row = $getquery->fetch_assoc()) {
        echo "id: " . $row["id"]. " - Name: " . $row["name"]. " " . $row["comment"]. "<br>";
    }

$conn->close();
?>

</body>
</html>