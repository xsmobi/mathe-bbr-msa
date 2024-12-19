function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form');
}

// Add a row
function addRow(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow(data);
  return 'Row added successfully!';
}

// Edit a row
function editRow(id, updatedData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      for (let j = 0; j < updatedData.length; j++) {
        sheet.getRange(i + 1, j + 1).setValue(updatedData[j]);
      }
      return `Row with ID ${id} updated successfully!`;
    }
  }
  return `No row found with ID ${id}`;
}

// Delete a row
function deleteRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == id) {
      sheet.deleteRow(i + 1);
      return `Row with ID ${id} deleted successfully!`;
    }
  }
  return `No row found with ID ${id}`;
}

// Search rows
function searchRows(query) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].some(cell => cell.toString().toLowerCase().includes(query.toLowerCase()))) {
      results.push(rows[i]);
    }
  }
  return results;
}