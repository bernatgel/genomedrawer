/*
 * genomedrawer Testing version 0.0.1
 *
 * Copyright (c) 2011 Bernat Gel
 * Licensed under the MIT license.
 */


/*
 * Creates a bunch of testing data and draws it using genomedrawer to test its functionality
 * 
 */

 $(document).ready(function() {
  
  
    var data1 = [
	{start: 1, end: 10, type: "ex"},
	{start: 15, end: 20, label:"id"},
	{start: 21, end: 30, type: "ex"},
	{start: 25, end: 50, strand: 0, label: "Negative", link: "www.google.com", type: "utr"},
	{start: 75, end: 80, type: "ex"},
	{start: 120, end: 130, label:"Important"},
	{start: 190, end: 190},
	{start: 55, end: 60},
    ];
    
    var data2 = [ 
	{start: 10+1, end: 5+10, type: "ex"},
	{start: 10+15, end: 5+20, label:"id"},
	{start: 10+21, end: 5+30, type: "ex"},
	{start: 10+25, end: 5+50, strand: 0, label: "Negative", link: "www.google.com", type: "utr"},
	{start: 10+75, end: 5+80, type: "ex"},
	{start: 10+120, end: 5+130, label:"Important"},
	{start: 10+190, end: 5+190},
	{start: 10+55, end: 5+60},
    ];
    
    var data_genes = [
	{start: 10, end: 15, type: "utr" },
	{start: 15, end: 18, type: "exon"},
	{start: 18, end: 50, type: "intron"},
	{start: 50, end: 57, type: "exon"},
	{start: 57, end: 120, type: "intron"},
	{start: 120, end: 125, type: "exon"},
	{start: 125, end: 150, type: "intron"},
	{start: 150, end: 159, type: "utr"},
	{start: 159, end: 180, type: "intron"},
	{start: 180, end: 183, type: "utr"}
    ];
    
    var gd = GenomeDrawer($("#testing1"), {doubleStranded: true, multiline: true});
    
    $('#draw').click(function() {
	gd.redraw("auto");
    });
    
    $("#zoom").click(function() {
	  gd.redraw({start: 30, stop: 76});
    });
    

    gd.addTrack("Test1", data1, {colorer: Drawers.typeColorer()});
    gd.addTrack("Test2", data2, {colorer: Drawers.sequentialColorer()});
    gd.addTrack("Gene", data_genes, {});
    

    
});

