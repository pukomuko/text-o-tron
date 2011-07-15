//
//  utils
//

	function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
	 for(var item in arr) {
	  var value = arr[item];
	 
	  if(typeof(value) == 'object') { //If it is an array,
	   dumped_text += level_padding + "'" + item + "' ...\n";
	   dumped_text += dump(value,level+1);
	  } else {
	   dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
	  }
	 }
	} else { //Stings/Chars/Numbers etc.
	 dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
	} 
	
	function numberOfKeys(obj) {
		var count = 0;
		for(var prop in obj) {
			if (obj.hasOwnProperty(prop)) count++;
		}
		return count;
	}

	/**
	 * Function to find selected text - cross browser compatible
	 */
	function getSelectedText() {
	  if(window.getSelection) { return window.getSelection(); }
	  else if(document.getSelection) { return document.getSelection(); }
	  else {
			  var selectedText = document.selection && document.selection.createRange();
			  if(selectedText.text) { return selectedText.text; }
			  return false;
	  }
	  return false;
	}
	
		
	//
	// textotron jquery
	//
	$(function() {
		$("#garbleSlider").slider({
			range: "min",
			min: 1,
			max: 10,
			value: 4,
			slide: function(event, ui) {
				$("#garble").val(ui.value);
			}
		});
		$("#garble").val($("#garbleSlider").slider("value"));
		
		$("#lengthSlider").slider({
			range: "min",
			min: 100,
			max: 5000,
			step: 50,
			value: 500,
			slide: function(event, ui) {
				$("#outputLength").val(ui.value);
			}
		});
		$("#outputLength").val($("#lengthSlider").slider("value"));
		
		function getNGramFrequencies(inputText, garble) {
			var freq = [];
			for (g=0; g < garble; g++) {
				freq[g] = {}
				for (i=0; i < inputText.length-g; i++) {
					index = inputText.substring(i, i+g+1);
					if (!freq[g][index]) freq[g][index] = 0;
					freq[g][index]++;
				}
			}
			return freq;
		}
		
		function getRandomOneChar(freq) {
			sum = 0;
			for (gram in freq) {
				sum += freq[gram];
			}
			//console.log("sum", sum);
			rand = Math.floor(Math.random()*sum);
			pos = 0;
			for (gram in freq) {
				pos += freq[gram];
				if (rand < pos) return gram.substring(gram.length-1, gram.length);
			}
			return false;
		}
		
		function filterFreqForPreviousText(freq, level, previousText) {
			if (!previousText) return freq[0];
			if (previousText.length < level) level = previousText.length;

			for (; level > 0; level--) {
				var matchText = previousText.substring(previousText.length-level, previousText.length);
				var newFreq = {};
				for (gram in freq[level]) {
					if (matchText == gram.substring(0, level) )
						newFreq[gram] = freq[level][gram];
				}
				if (numberOfKeys(newFreq) > 0) return newFreq;
			}
			return freq[0];
		}
		
		function textotron(inputText, garble, outputLength) {
			var freq = getNGramFrequencies(inputText, garble);
			var text = "";
			while (text.length < outputLength) {

				// filter ngrams for suitable match of previous text select randomly
				// if no ngrams for garble level, decrease garble level
				// untill just random character
				
				
				var newText = getRandomOneChar(filterFreqForPreviousText(freq, garble, text));
				text += newText;
			}
			//console.log("freq.length", freq.length);
			//console.log("freq", dump(freq));
			//console.log("text", dump(text));
			
			return text;
		}
		
		$('#textotronButton').click(function() {
			outputText = textotron($('#textInput').val(), $("#garble").val(), $("#outputLength").val());
			$("#outputText").text(outputText);
		});
		
		$('.watermarked').each(function() {
			$(this).watermark('watermark', $(this).attr('title'));
		});
		
		$('#textInput').textAreaResizer();
		
		$('#outputText').mouseup(function(e) { 
			var selection = getSelectedText();
			if (selection && String(selection).length> 1) {
				$("#popText").remove();
				var popText = $("<div>").attr({'id':'popText'}).css({
						'position' : 'absolute',
						'background' : '#fff',
						'padding' : '2px',
						'top' : e.pageY + 5,
						'left' : e.pageX - 5
					}).hide();
				$("body").append(popText).find('#popText').fadeIn("slow").raty({
						onClick: function(score) {
							appendSnippet(selection, score);
							$("#popText").die();
							$("#popText").remove();
						}
				});
				
				$(document).mousedown(function(){
					$("#popText").fadeOut("slow");
				});
			}
		});
	   
	});

var globalSnippetCount = 0;
//
// append snippet to sidebar
//
function appendSnippet(text, score) {
	globalSnippetCount++;
	$('#blankState').remove();
	$('#snippetList').append('<li><p>'+text+'</p><div id="score'+ globalSnippetCount +'"></div></li>');
	$('#score'+globalSnippetCount).raty({
		readOnly: true,
		start: score,
	});
}
