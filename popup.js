document.addEventListener('DOMContentLoaded', function() {
	// Setup UI
	loadContainers();

    // Load containersto UI
    function loadContainers() {
    	// ** Header **
    	// Add address Button
    	var addButton = document.createElement('button');
    	addButton.id = 'address-add-button';
    	addButton.title = 'Add Address';
    	addImageToButton(addButton, 'images/add24.png');
	
    	addButton.onclick = function() {
    		// Add user input to the address book
	        var inputName = document.getElementById('input-name').value;
	        var inputAddress = document.getElementById('input-address').value;

	        if (!inputAddress || !inputName) {
	        	console.log('Invalid user input');
	        	return;
	        }

	        addAddress(inputName, inputAddress);

	        // Save address to persistent storage
	        var addressKeyValue = {}; addressKeyValue[inputAddress] = inputName;
	        chrome.storage.sync.set(addressKeyValue, function() {
	        	console.log('Address saved: ' + inputAddress);
	        });
    	};

    	document.getElementById('add-address').appendChild(addButton);

    	// ** Address list **
    	populateAddressList();

    	// ** Footer **
    	var donateToggled = false;
    	document.getElementById('donate-button').onclick = function() {
    		// Toggles listing the donation addresses in the address book
    		// TODO: backwards compatible const?
    		const BTC_ADDRESS = '1Hf9nMbzh17ePqpdAF6qhK3x1NcJERcV6A';
    		const ETH_ADDRESS = '0xc8460bfb239ccd76ab862d88982f1074153285b2';
    		if (donateToggled) {
    			// Untoggle donation addresses
    			removeAddress(BTC_ADDRESS);
    			removeAddress(ETH_ADDRESS);
    			donateToggled = false;
    		} else {
    			// Add donation address to the address book
		    	addAddress('Donate Bitcoin', BTC_ADDRESS);
		    	addAddress('Donate Ethereum', ETH_ADDRESS);
		    	console.log('Thank you for your support!');
		    	donateToggled = true;
    		}

    	}
    }

    // Populate address book with saved addresses
    function populateAddressList() {
		chrome.storage.sync.get(null, function(items) {
			var allKeys = Object.keys(items);
			var table = document.getElementById('address-table');
			var row;

			for (var i=0; i < allKeys.length; ++i) {
				var address = allKeys[i];
				var name = items[address];
				console.log('Loaded:\n\tname: ' + name + '\n\taddress: ' + address);
				addAddress(name, address);
			}
		});
    }

    // Add an address to the address book
    function addAddress(name, address) {
    	var row = buildAddressRow(name, address);
    	document.getElementById('address-table').appendChild(row);
    }

    // Remove an address from the address book
    function removeAddress(address) {
    	var addressTable = document.getElementById('address-table');
    	var rows = addressTable.childNodes;

    	for (var i=2; i < rows.length; ++i) {
    		var row = rows[i];
    		var addressText = getAddressText(row);
    		if (addressText === address) {
    			row.parentNode.removeChild(row);
    			console.log('Removed address: ' + address);
    		}
    	}
    }

    // Build a listing for the address book
    function buildAddressRow(name, address) {
    	var row = document.createElement('tr');

        var col1 = document.createElement('td');
        var col2 = document.createElement('td');
        var col3 = document.createElement('td');
        var col4 = document.createElement('td');
        var col5 = document.createElement('td');

        var nameNode = document.createTextNode(name);

        var addressNode = document.createTextNode(address);

        var copyButton = document.createElement('button');

        var qrButton = document.createElement('button');

        var removeButton = document.createElement('button');
        var removeText = document.createTextNode('x');

        // ex: name | address | copy | qr | x

        copyButton.id = 'address-copy-button';
        copyButton.title = 'Copy to Clipboard';
        addImageToButton(copyButton, 'images/copy20.png');
        // Copy the address to the clipboard
        copyButton.onclick = function() {
        	copyTextToClipBoard(address);
        };

        qrButton.id = 'address-qr-button';
        qrButton.title = 'Show QR Code'
        addImageToButton(qrButton, 'images/qr20.png');
        // Show QR code
        qrButton.onclick = function() {
        	showQR(address);
        };

        removeButton.id = 'address-remove-button';
        removeButton.title = 'Remove';
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

        col1.appendChild(nameNode);
        col2.appendChild(addressNode);
        col3.appendChild(copyButton);
        col4.appendChild(qrButton);
        col5.appendChild(removeButton);

        row.append(col1);
        row.append(col2);
        row.append(col3);
        row.append(col4);
        row.append(col5);

    	return row;
    }

    // Get address text from an address row
    function getAddressText(row) {
    	return row.childNodes[1].firstChild.nodeValue;
    }

    // Generate and show a QR code of the specified text
    function showQR(text) {
    	var qrLink = "https://chart.googleapis.com/chart?cht=qr&chl=" + htmlEncode(text) + "&chs=160x160&chld=L|0"
    	var qrLinkKV = {}; qrLinkKV["url"] = qrLink;
    	chrome.tabs.create(qrLinkKV);
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

	// Escape html unfriendly characters
	function htmlEncode(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function addImageToButton(button, imgPath) {
		var img = document.createElement('img');
		var imgURL = chrome.extension.getURL(imgPath);

		img.setAttribute('src', imgURL);
        button.appendChild(img);
	}
});
