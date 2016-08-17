<?php
/**
* Interactions webservice.
*
* Retrieve Interactions and SUBA3 data from the BAR databases for the use in ePlant 2.0 only.
* 
* @category	WebServices
* @Author	Asher
* @MySQL	Matt Ierullo
* @Date		July, 2014
* @Usage	http://bar.utoronto.ca/~asher/webservices/new_get_interactions.php?request=[{"agi":"At1g02130"},{"agi":%"At4g23810"},{"agi":"At3g01090"}]	
*/

// The Interactions Class
class Interactions
{
	// Constructor
	function __construct($JSONData) {
		$this->JSONData = $JSONData;
	}
	
	// Is the JSON valid?
	public function validateData() {
		if (json_decode($this->JSONData)) {
			$this->JSONData = json_decode($this->JSONData, true);
			return 1;
		} else {
			return 0;
		}
	}

	// Get the interactions
	public function getInteractions() {
		// Connect to MySQL
		$mysqli = $this->connect();

		// Now get interactions data
		$interactions = $this->execute($mysqli);

		// Disconnect from MySQL
		$this->disconnect($mysqli);
		
		return $interactions;
	}

	// Get interactions data
	private function execute($mysqli) {
		$finalData = array();
		
		for ($i = 0; $i < count($this->JSONData); $i++) {
			if (isset($this->JSONData[$i]["agi"])) {
				$gene = $this->JSONData[$i]["agi"];
				// Security checks
				$gene = $this->cleanInput($gene);
				
				// For MySQL
				$gene = $mysqli->real_escape_string($gene);

				// Run the first query
				if ($interactors = $mysqli->query("SELECT Protein1, Protein2 FROM interactions WHERE Protein1 = '$gene'")) {

					// Get data
					$listInteractors = array($gene);
					while ($row = mysqli_fetch_assoc($interactors)) {
						array_push($listInteractors, $row["Protein2"]);
					}
					$interactors->close();
				}

				// Now Build the second query
				$query = "SELECT Protein1, Protein2, Quality, Pcc FROM interactions WHERE (Protein1='" . $gene . "' AND Protein2='" . $gene . "')";
				foreach($listInteractors as $p1) {
					foreach($listInteractors as $p2) {
						if (! preg_match("/(Protein1='".$p2."' AND Protein2='".$p1."')/", $query) or preg_match("/(Protein1='".$p1."' AND Protein2='".$p2."')/", $query)) {
							$query = $query . " OR (Protein1='" . $p1 . "' AND Protein2='" . $p2 . "')";
						}
					}
				}

				// Now Run the query
				$data = array();
				if ($interactors = $mysqli->query($query)) {
					
					// Get Data
					while ($row = mysqli_fetch_assoc($interactors)) {
						array_push($data, array(
							"source" => $row["Protein1"],
							"target" => $row["Protein2"],
							"interolog_confidence" => $row["Quality"],
							"correlation_coefficient" => $row["Pcc"])
						);
					}
					$interactors->close();
				}
				if (isset($data)) {	
					$finalData[$gene] = $data;
					return $finalData;
				} else {
					$this->end();
				}
			} else {
				$this->end();
			}
		}
	}

	// Clean input
	private function cleanInput($data) {
		$data = trim($data);
		$data = stripslashes($data);
		$data = htmlspecialchars($data);
		if (preg_match("/^At.g\d{5}$/i", $data)) {
			return $data;	
		} else {
			$this->end();
		}
	}

	// Connect to database
	private function connect() {
		$mysqli = new mysqli("localhost", "eplant_usr", "4pLan7S", "interactions");
		
		if ($mysqli->connect_errno) {
			$this->end();
		}
		return $mysqli;
	}

	// Disconnect from database
	private function disconnect($mysqli) {
		$mysqli->close();
	}
	
	// Exit with error
	private function end() {
		header("Content-type: application/json");
		$response["Error"] = "An error has occured";
		echo json_encode($response);
		exit;
	} 
}

// The main program.
if (isset($_GET['request'])) {
	// Create a new object
	$interactionsObj = new Interactions($_GET['request']);

	if ($interactionsObj->validateData()) {
		header("Content-type: application/json");
		$response = $interactionsObj->getInteractions();
		echo json_encode($response);
	} else {
		header("Content-type: application/json");
		$response["Error"] = "Invalid input data";
		echo json_encode($response);
	}
}

