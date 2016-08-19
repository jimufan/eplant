#!/usr/bin/perl
################################################################################
# This is the JSmol webservice that returns the link to TAIR10 Phyre2 pdb file
# given an AGI.
# Author: Asher
# Date: March 2014
# Usage Example: http://bar.utoronto.ca/~eplant/cgi-bin/JSMol.cgi?agi=At1g01010
################################################################################
use warnings;
use strict;
use CGI;
use JSON;

my $cgiObj = new CGI;	# The CGI Oject
my $agi = $cgiObj->param('agi');	# AGI supplied by the user

# Check input for errors, and return correct AGI or exit
end() if (!defined($agi));
main();

################################################################################
# Subroutines
################################################################################

# This subroutine check AGI ID for errors, etc
sub checkAGI {
	my $agi = shift;

	$agi = uc($agi);
	if ($agi =~ /^(AT[\d|M|C]G\d{5}\.?\d?)$/) {
		$agi = $1;
		return $agi;
	} else {
		end();
	}
}

# This subroutine returns the link to pdb files
sub getLink {
	my $agi = shift;
	my $link = "";	# Link to pdb files
	my $dataDir = "/DATA/CDD3D_structures/TAIR10-Phyre2/";	# SymLink to pdb files
	my $ePlant = "http://bar.utoronto.ca/eplant_legacy/java/Phyre2-Models/";	# Link
	
	$agi = "Phyre2_".$agi;
	if ($agi =~ /\.\d$/) {
		$agi .= ".pdb";
		if (-e $dataDir.$agi) {
			$link = $ePlant . $agi;
		}
	} else {
		# Start with .1, .2, .3, .4, .5
		if (-e $dataDir.$agi.".1.pdb") {
			$link = $ePlant . $agi . ".1.pdb";
		} elsif (-e $dataDir.$agi.".2.pdb") {
			$link = $ePlant . $agi . ".2.pdb";
		} elsif (-e $dataDir.$agi.".3.pdb") {
			$link = $ePlant . $agi . ".3.pdb";
		} elsif (-e $dataDir.$agi.".4.pdb") {
			$link = $ePlant . $agi . ".4.pdb";
		} elsif (-e $dataDir.$agi.".5.pdb") {
			$link = $ePlant . $agi . ".5.pdb";
		} elsif (-e $dataDir.$agi.".6.pdb") {
			$link = $ePlant . $agi . ".6.pdb";
		} elsif (-e $dataDir.$agi.".7.pdb") {
			$link = $ePlant . $agi . ".7.pdb";
		} elsif (-e $dataDir.$agi.".8.pdb") {
			$link = $ePlant . $agi . ".8.pdb";
		} elsif (-e $dataDir.$agi.".9.pdb") {
			$link = $ePlant . $agi . ".9.pdb";
		} else {
			$link = "";
		}
	}
	return $link;
}

# Get the protein pdb seqeunce of the link
sub getSequence {
	my $link = shift;
	my $seq = "";
	my $dataDir = "/DATA/CDD3D_structures/TAIR10-Phyre2/";	# PDB files
	my $file = "";
	
	# If the link has a file name, parse it
	if ($link =~ /Phyre2-Models\/(Phyre2_.+pdb$)/) {
		# Get the FASTA file name
		$file = $1;
		$file =~ s/.pdb$/_FASTA.fas/g;
		$file = $dataDir . $file;
		
		# Get the sequence
		if (-e $file) {
			open(my $infh, "<", $file) or end();
			while (<$infh>) {
				chomp($_);
				unless ($_ =~ /^>/) {
					$seq .= $_;
				}
			}
			close $infh;
		}
	}
	return $seq;
}

# This program exits the script
sub end {
	print $cgiObj->header('application/json');
	print '{}';
	exit(0);
}

# The main function
sub main {
	my $link = "";	# This to file
	my $seq = "";	# The FASTA sequence of pdb file
	my $jsonObj;	# This is the final JSON object
	my %jsonHash;	# The json hash
	
	# Check AGI for errors
	$agi = checkAGI($agi);
	
	# Get the linked the TAIR10 phyre2 file
	$link = getLink($agi);
	$seq = getSequence($link);

	# Make json object
	$jsonHash{'link'} = $link;
	$jsonHash{'sequence'} = $seq;
	$jsonObj = encode_json(\%jsonHash);

	# Output results
	print $cgiObj->header('application/json');
	print $jsonObj;
}
	



