document.addEventListener('DOMContentLoaded', function() {
	// Populate address book with saved addresses
	chrome.storage.sync.get(null, function(items) {
		var allKeys = Object.keys(items);
		var table = document.getElementById('address-table');
		var row;

		for (var i=0; i < allKeys.length; ++i) {
			console.log('Loaded address: ' + allKeys[i]);
			var row = buildAddressRow(allKeys[i]);
			table.appendChild(row);
		}
	});

    // Add user input to the address book
    document.getElementById('add-address-button').onclick = function() {
        var userInput = document.getElementById('user-input').value;

        var row = buildAddressRow(userInput);

        // Add address row to table
        document.getElementById('address-table').appendChild(row);

        // Save address to persistent storage
        var addressKeyValue = {}; addressKeyValue[userInput] = "1";
        chrome.storage.sync.set(addressKeyValue, function() {
        	console.log('Address saved: ' + userInput);
        });
    };

    // Add donation address to the address book
    document.getElementById('donate-button').onclick = function() {
    	addAddress('1Hf9nMbzh17ePqpdAF6qhK3x1NcJERcV6A');
    	console.log('Thank you for your support!');
    }

    // Add an address to the address book
    function addAddress(address) {
    	var row = buildAddressRow(address);
    	document.getElementById('address-table').appendChild(row);
    }

    // Build a listing for the address book
    function buildAddressRow(address) {
    	var row = document.createElement('tr');

        var col1 = document.createElement('td');
        var col2 = document.createElement('td');
        var col3 = document.createElement('td');

        var addressNode = document.createTextNode(address);

        var copyButton = document.createElement('button');
        var copyText = document.createTextNode('copy');

        var removeButton = document.createElement('button');
        var removeText = document.createTextNode('x');

        // ex: address | copy | x

        copyButton.id = 'address-copy-button';
        copyButton.appendChild(copyText);
        // Copy the address to the clipboard
        copyButton.onclick = function() {
        	copyTextToClipBoard(address);
        };

        removeButton.id = 'address-remove-button';
        removeButton.appendChild(removeText);
        // Remove the row from the address book
        removeButton.onclick = function() {
            var row = this.parentNode.parentNode;
            var address = getAddressText(row);

            row.parentNode.removeChild(row);

            // Remove address from persistent storage
            chrome.storage.sync.remove(address, function() {
            	console.log('Address removed: ' + address);
            });
        };

        col1.appendChild(addressNode);
        col2.appendChild(copyButton);
        col3.appendChild(removeButton);

        row.append(col1);
        row.append(col2);
        row.append(col3);

    	return row;
    }

    // Get address text from an address row
    function getAddressText(row) {
    	return row.childNodes[0].firstChild.nodeValue;
    }

    function copyTextToClipBoard(text) {
    	  var textArea = document.createElement("textarea");
		  //
		  // *** This styling is an extra step which is likely not required. ***
		  //
		  // Why is it here? To ensure:
		  // 1. the element is able to have focus and selection.
		  // 2. if element was to flash render it has minimal visual impact.
		  // 3. less flakyness with selection and copying which **might** occur if
		  //    the textarea element is not visible.

		  // Place in top-left corner of screen regardless of scroll position.
		  textArea.style.position = 'fixed';
		  textArea.style.top = 0;
		  textArea.style.left = 0;

		  // Ensure it has a small width and height. Setting to 1px / 1em
		  // doesn't work as this gives a negative w/h on some browsers.
		  textArea.style.width = '2em';
		  textArea.style.height = '2em';

		  // We don't need padding, reducing the size if it does flash render.
		  textArea.style.padding = 0;

		  // Clean up any borders.
		  textArea.style.border = 'none';
		  textArea.style.outline = 'none';
		  textArea.style.boxShadow = 'none';

		  // Avoid flash of white box if rendered for any reason.
		  textArea.style.background = 'transparent';


		  textArea.value = text;

		  document.body.appendChild(textArea);

		  textArea.select();

		  try {
		    var successful = document.execCommand('copy');
		    var msg = successful ? 'successful' : 'unsuccessful';
		    console.log('Copying text command was ' + msg);
		  } catch (err) {
		    console.log('Unable to copy:\n\t' + err.name + ': ' + err.message);
		  }

		  document.body.removeChild(textArea);
	}
});
