function createTable(data) {
    // Create table element
    let table = document.createElement('table');
    table.classList.add('styled-table');

    // Create thead element and row
    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    ['Nom', 'Score'].forEach(headerText => {
        let headerCell = document.createElement('td');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody element and rows
    let tbody = document.createElement('tbody');
    data.forEach(submission => {
        let row = document.createElement('tr');
        ['username', 'score'].forEach(key => {
            let cell = document.createElement('td');
            cell.textContent = submission[key];
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Clear existing content in table-container
    let tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    // Append the table to the container
    tableContainer.appendChild(table);
}
