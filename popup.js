document.addEventListener('DOMContentLoaded', function() {
    // Add user input to the address book
    document.getElementById('add_address').onclick = function() {
        var user_input = document.getElementById('user_input').value;

        var row = document.createElement('tr');

        var col1 = document.createElement('td');
        var col2 = document.createElement('td');

        var textnode = document.createTextNode(user_input);
        var removeButton = document.createElement('button');
        var btnText = document.createTextNode('x');
        
        removeButton.id = 'address_remove_button';
        removeButton.appendChild(btnText);

        col1.appendChild(textnode);
        col2.appendChild(removeButton);

        row.append(col1);
        row.append(col2);

        // Remove the selected row from the address book
        removeButton.onclick = function() {
            var row = this.parentNode.parentNode;
            row.parentNode.removeChild(row);
        };

        document.getElementById('address_table').appendChild(row);
    };
});
