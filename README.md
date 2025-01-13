# quovixi.com

Created by Vicky Carmichael

[quovixi.com](https://quovixi.com/)

## Background

This project started life as my submission for CS50's Homepage problem set, to test my understanding of using HTML, CSS and JavaScript. I've since adapted it to be my personal site with resume and list of projects.

## Projects

My bigger projects (such as [rankly](https://rankly.quovixi.com), [LinkedInspo](https://linkedinspo.quovixi.com) and [RSVPcalc](https://rsvpcalc.quovixi.com)) live on their own subdomains, but the following projects live on quovixi.com directly:

### [/resume](https://quovixi.com/resume)

A single page detailing my background, experience, education and skills. Makes liberal use of Bootstrap accordions.

### [/quonnections](https://quovixi.com/quonnections)

The first of several connecting wall style quizzes I have planned. The game dynamically shuffles the words, tracks player selections, and provides feedback for correct, incorrect, or near-miss guesses (e.g., "One away!"). Incorrect guesses are tallied, and correct groups are displayed as they're completed. A chance for me to practice grid layouts, DOM manipulation, and event handling.

### [/perfect-match](https://quovixi.com/perfect-match)

A name compatibility game I used to play as a kid, styled to look like a 90s kid's notebook. It counts occurrences of specific letters (L, O, V, E, S) in the combined names and reduces the counts through successive summations until a figure of 100 or less emerges, and this is presented as the "compatibility score" as a percentage. You can optionally toggle the calculation breakdown.

### [/playground](https://quovixi.com/playground)

Practicing my CSS skills by designing different themes for the Tito widget. When a theme button is clicked, a function is called to edit the href attribute of the <link> element to load a new CSS file path (e.g., themes/clean.css), update the href attribute of the download link to point to the corresponding theme's CSS file, and adjust other styles dynamically, such as the background color of the widget container and the appearance of the download link. 

### [/anthologia](https://quovixi.com/anthologia)

A digital anthology of art and media I love. A Google Sheet acts as a lightweight CMS, and a serverless function securely retrieves data from the Google Sheets API. Filter items by category, click on an item to see my review and toggle spoilers. 
