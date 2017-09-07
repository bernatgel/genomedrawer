[![Project Status: Abandoned – Initial development has started, but there has not yet been a stable, usable release; the project has been abandoned and the author(s) do not intend on continuing development.](http://www.repostatus.org/badges/latest/abandoned.svg)](http://www.repostatus.org/#abandoned)


### **ABANDONED**: This code was abandoned in 2011

genomedrawer is a small javascript library to create images representing genome or protein annotations similar to those found on Ensembl or the UCSC Genome Browser.

It depends on Raphael to do the drawing and should support any major browser (including IE). 

jQuery is used in the testing pages, but the library does not.

Some amount of configuration/customization is allowed.

What does genomedrawer does?
    Draws features in the designated area
    Controls feature size and position
    Calls drawers as needed
    Includes a few basic drawers and a way to implement custom ones.

What does not?
    Does NOT include any way of actually getting data. 
    Does NOT include user interaction capabilities
    Does NOT listen to any kind of event (even drawing space resizing)
