const apiUrl = 'http://localhost:3000/api/products';

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();
        displayItems(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

let items = []; // Array to store items
let barcodeCounter = 0; // Counter to ensure uniqueness of barcodes

async function searchItem() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let filteredItems = items.filter(item => {
        return item.name.toLowerCase().includes(searchTerm) ||
               item.reference.toLowerCase().includes(searchTerm) ||
               item.barcode.toLowerCase().includes(searchTerm);
    });
    displayItems(filteredItems);
}

function addItem() {
    let itemName = document.getElementById("itemName").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    let buyingPrice = parseFloat(document.getElementById("addItemBuyingPrice").value);
    let sellingPrice = parseFloat(document.getElementById("addItemSellingPrice").value);
    let priceDifference = parseFloat(document.getElementById("addItemPriceDifference").value);
    let currency = document.getElementById("currency").value;
    let reference = generateReference(); // Generate reference number
    let barcode = generateBarcode({ // Generate barcode with item information
        itemName: itemName,
        quantity: quantity,
        buyingPrice: buyingPrice,
        sellingPrice: sellingPrice,
        priceDifference: priceDifference,
        currency: currency
    });

    // Create new item object
    let newItem = {
        reference: reference,
        name: itemName,
        quantity: quantity,
        buyingPrice: buyingPrice,
        sellingPrice: sellingPrice,
        priceDifference: priceDifference,
        currency: currency,
        barcode: barcode
    };

    items.push(newItem); // Add item to the array
    displayItems(items); // Display updated list of items
}

function generateBarcode(item) {
    barcodeCounter++; // Increment the counter for unique barcode
    let barcodeData = {
        itemName: item.itemName,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        sellingPrice: item.sellingPrice,
        priceDifference: item.priceDifference,
        currency: item.currency,
        uniqueIdentifier: barcodeCounter // Ensure uniqueness
    };
    // Encode item information as JSON string
    let encodedInfo = JSON.stringify(barcodeData);

    // Convert JSON string to base64 to reduce barcode size
    let encodedBase64 = btoa(encodedInfo);

    return encodedBase64;
}

function generateReference() {
    // Generate a random reference number (for demonstration purposes)
    return 'REF' + Math.floor(Math.random() * 1000);
}

// The rest of your code remains unchanged

function generateReference() {
    // Generate a random reference number (for demonstration purposes)
    return 'REF' + Math.floor(Math.random() * 1000);
}
function displayItems(itemArray) {
    let itemListDiv = document.getElementById("itemList");
    itemListDiv.innerHTML = ""; // Clear previous items

    itemArray.forEach(item => {
        let itemCard = document.createElement("div");
        itemCard.classList.add("item-card");

        let name = document.createElement("p");
        name.textContent = "Name: " + item.name;

        let reference = document.createElement("p");
        reference.textContent = "Reference: " + item.reference;

        let quantity = document.createElement("p");
        quantity.textContent = "Quantity: " + item.quantity;

        let buyingPrice = document.createElement("p");
        buyingPrice.textContent = "Buying Price: " + item.buyingPrice + " " + item.currency; // Include currency

        let sellingPrice = document.createElement("p");
        sellingPrice.textContent = "Selling Price: " + item.sellingPrice + " " + item.currency; // Include currency

        let priceDifference = document.createElement("p");
        priceDifference.textContent = "Price Difference: " + item.priceDifference + " " + item.currency; // Include currency

        let barcode = document.createElement("p");
        barcode.textContent = "Barcode: " + item.barcode;

        let downloadButton = document.createElement("button");
        downloadButton.textContent = "Download Ticket";
        downloadButton.onclick = function() {
            downloadTicket(item);
        };

        itemCard.appendChild(name);
        itemCard.appendChild(reference);
        itemCard.appendChild(quantity);
        itemCard.appendChild(buyingPrice);
        itemCard.appendChild(sellingPrice);
        itemCard.appendChild(priceDifference);
        // itemCard.appendChild(barcode);
        itemCard.appendChild(downloadButton);

        itemListDiv.appendChild(itemCard);
    });
}


function downloadTicket(item) {
    let ticketHTML = generateTicketHTML(item);

    const options = {
        margin: 1,
        filename: 'ticket_' + item.reference + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    };

    html2pdf().set(options).from(ticketHTML).save();
}

function generateTicketHTML(item) {

    // -------------------------------
    // Create a canvas element to generate the barcode
    let canvas = document.createElement('canvas');
    JsBarcode(canvas, item.barcode);
    let barcodeDataURL = canvas.toDataURL();

    // Construct the ticket HTML
    let ticketHTML = `
        <div id="content">
            <h1>Ticket for ${item.name}</h1>
            <p>Reference: ${item.reference}</p>
            <p> Price: ${item.sellingPrice} ${item.currency}</p>
            <img src="${barcodeDataURL}" alt="Barcode">
        </div>
    `;
    return ticketHTML;
}

function showEditBlock() {
    document.getElementById("editBlock").style.display = "block";
}
function saveChanges() {
    let reference = document.getElementById("editReference").value;
    let quantity = parseInt(document.getElementById("editQuantity").value);
    let buyingPrice = parseFloat(document.getElementById("editBuyingPrice").value);
    let sellingPrice = parseFloat(document.getElementById("editSellingPrice").value);
    let priceDifference = parseFloat(document.getElementById("editPriceDifference").value);

    // Find the item with the given reference
    let itemIndex = items.findIndex(item => item.reference === reference);
    if (itemIndex !== -1) {
        // Update quantity, buying price, selling price, and price difference
        items[itemIndex].quantity = quantity;
        items[itemIndex].buyingPrice = buyingPrice;
        items[itemIndex].sellingPrice = sellingPrice;
        items[itemIndex].priceDifference = priceDifference;
        // Display updated items
        displayItems(items);

        // Save changes to the database or backend here
        // This could involve making an API call to update the item in the database
        // Example:
        // updateItemInDatabase(items[itemIndex]);
    }

    // Hide the edit block after saving changes
    document.getElementById("editBlock").style.display = "none";
}



function exportToExcel() {
    // Extract necessary fields from items
    let itemsData = items.map(({ name, reference, quantity, buyingPrice, sellingPrice, priceDifference }) => ({ name, reference, quantity, buyingPrice, sellingPrice, priceDifference }));

    // Convert data to worksheet
    let worksheet = XLSX.utils.json_to_sheet(itemsData);

    // Create workbook
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

    // Generate Excel file
    let today = new Date();
    let fileName = "items_" + today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + ".xlsx";
    XLSX.writeFile(workbook, fileName);
}

function exportSearchedItemsToExcel() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let filteredItems = items.filter(item => {
        return item.name.toLowerCase().includes(searchTerm) ||
               item.reference.toLowerCase().includes(searchTerm) ||
               item.barcode.toLowerCase().includes(searchTerm);
    });

    // Extract necessary fields from filtered items
    let itemsData = filteredItems.map(({ name, reference, quantity, buyingPrice, sellingPrice, priceDifference }) => ({ name, reference, quantity, buyingPrice, sellingPrice, priceDifference }));

    // Convert data to worksheet
    let worksheet = XLSX.utils.json_to_sheet(itemsData);

    // Create workbook
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

    // Generate Excel file
    let today = new Date();
    let fileName = "items_" + searchTerm + "_" + today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + ".xlsx";
    XLSX.writeFile(workbook, fileName);
}


function scanBarcode() {
    // Show the video element
    document.getElementById('barcodeScanner').style.display = 'block';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#barcodeScanner"),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment" // Use rear camera
            },
        },
        decoder: {
            readers: ["ean_reader", "upc_reader"]
        }
    }, function (err) {
        if (err) {
            console.error("Failed to initialize Quagga:", err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function (result) {
        let barcode = result.codeResult.code;
        Quagga.stop();
        handleBarcodeScan(barcode);
    });
}

document.addEventListener('DOMContentLoaded', fetchProducts);