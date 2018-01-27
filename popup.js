document.addEventListener('DOMContentLoaded', function() {
	// Populate address book with saved addresses
	chrome.storage.sync.get(null, function(items) {
		var allKeys = Object.keys(items);
		console.log(allKeys);
		console.log(items);
		var table = document.getElementById('address_table');
		var row;
		for (var i=0; i < allKeys.length; ++i) {
			console.log('Appending item: ' + allKeys[i]);
			var row = buildAddressRow(allKeys[i]);
			table.appendChild(row);
		}
	});

    // Add user input to the address book
    document.getElementById('add_address').onclick = function() {
        var user_input = document.getElementById('user_input').value;

        var row = buildAddressRow(user_input);

        // Add address row to table
        document.getElementById('address_table').appendChild(row);

        // Save address to persistent storage
        var addressKeyValue = {}; addressKeyValue[user_input] = "1";
        chrome.storage.sync.set(addressKeyValue, function() {
        	console.log('Address saved: ' + user_input);
        });
    };

    // Build a listing in the address book
    function buildAddressRow(address) {
    	var row = document.createElement('tr');

        var col1 = document.createElement('td');
        var col2 = document.createElement('td');

        var textnode = document.createTextNode(address);
        var removeButton = document.createElement('button');
        var btnText = document.createTextNode('x');

        // ex: address | x        
        removeButton.id = 'address_remove_button';
        removeButton.appendChild(btnText);

        // Remove the selected row from the address book
        removeButton.onclick = function() {
            var row = this.parentNode.parentNode;
            var address = row.childNodes[0].firstChild.nodeValue;

            row.parentNode.removeChild(row);

            // Remove address from persistent storage
            chrome.storage.sync.remove(address, function() {
            	console.log('Address removed: ' + address);
            });
        };

        col1.appendChild(textnode);
        col2.appendChild(removeButton);

        row.append(col1);
        row.append(col2);

    	return row;
    }
});
