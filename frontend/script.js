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

let items = [];

async function searchItem() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase();
    try {
        const response = await fetch(`${apiUrl}/search?search=${searchTerm}`);
        const filteredItems = await response.json();
        displayItems(filteredItems);
    } catch (error) {
        console.error('Error searching products:', error);
    }
}

// async function addItem() {
//     let itemName = document.getElementById("itemName").value;
//     let quantity = parseInt(document.getElementById("quantity").value);
//     let buyingPrice = parseFloat(document.getElementById("addItemBuyingPrice").value);
//     let sellingPrice = parseFloat(document.getElementById("addItemSellingPrice").value);
//     let priceDifference = parseFloat(document.getElementById("addItemPriceDifference").value);
//     let currency = document.getElementById("currency").value;
//     let reference = generateReference();
//     let barcode = generateBarcode({ itemName, quantity, buyingPrice, sellingPrice, priceDifference, currency });

//     let newItem = { reference, name: itemName, quantity, buyingPrice, sellingPrice, priceDifference, currency, barcode };

//     try {
//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(newItem)
//         });
//         if (response.ok) {
//             const addedItem = await response.json();
//             items.push(addedItem);
//             displayItems(items);
//         } else {
//             console.error('Failed to add item:', response.statusText);
//         }
//     } catch (error) {
//         console.error('Error adding item:', error);
//     }
// }
async function addItem() {
    let itemName = document.getElementById("itemName").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    let buyingPrice = parseFloat(document.getElementById("addItemBuyingPrice").value);
    let sellingPrice = parseFloat(document.getElementById("addItemSellingPrice").value);
    let currency = document.getElementById("currency").value;
    let reference = generateReference();
    let barcode = generateBarcode({ itemName, quantity, buyingPrice, sellingPrice, currency });

    // Calculate the price difference
    let priceDifference = sellingPrice - buyingPrice;

    let newItem = { reference, name: itemName, quantity, buyingPrice, sellingPrice, priceDifference, currency, barcode };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        if (response.ok) {
            const addedItem = await response.json();
            items.push(addedItem);
            displayItems(items);
        } else {
            console.error('Failed to add item:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding item:', error);
    }
}



async function deleteItem() {
    const reference = document.getElementById("deleteReferenceInput").value.trim();
    if (!reference) {
        alert("Please enter the reference of the item you want to delete.");
        return;
    }
    try {
        const response = await fetch(`${apiUrl}/${reference}`, { method: 'DELETE' });
        if (response.ok) {
            items = items.filter(item => item.reference !== reference);
            displayItems(items);
            alert("Item deleted successfully!");
        } else {
            console.error('Failed to delete item:', response.statusText);
            alert("Failed to delete item. Please try again later.");
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert("An error occurred while deleting the item. Please try again later.");
    }
}

function generateBarcode(item) {
    const barcodeString = `${item.name}-${item.quantity}-${item.buyingPrice}-${item.sellingPrice}-${item.priceDifference}-${item.currency}`;
    const encodedInfo = btoa(barcodeString);
    return encodedInfo;
}


function generateReference() {
    return 'REF' + Math.floor(Math.random() * 1000);
}

function displayItems(itemArray) {
    const itemListDiv = document.getElementById("itemList");
    itemListDiv.innerHTML = "";

    itemArray.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.classList.add("item-card");

        itemCard.innerHTML = `
        <div>
            <p>Name: ${item.name}</p>
            <p>Reference: ${item.reference}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Buying Price: ${item.buyingPrice} ${item.currency}</p>
            <p>Selling Price: ${item.sellingPrice} ${item.currency}</p>
            <p>Price Difference: ${item.priceDifference} ${item.currency}</p>
            <img src="${item.barcode}" alt="Barcode">
        </div>  
        `;

        const downloadButton = document.createElement("button");
        downloadButton.textContent = "Download Ticket";
        downloadButton.onclick = () => downloadTicket(item);

        itemCard.appendChild(downloadButton);
        itemListDiv.appendChild(itemCard);
    });
}

function downloadTicket(item) {
    const ticketHTML = generateTicketHTML(item);
    const options = {
        margin: 1,
        filename: 'ticket_' + item.reference + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(options).from(ticketHTML).save();
}

function generateTicketHTML(item) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, item.barcode);
    const barcodeDataURL = canvas.toDataURL();

    return `
        <div id="content">
            <h1>Ticket for ${item.name}</h1>
            <p>Reference: ${item.reference}</p>
            <p>Price: ${item.sellingPrice} ${item.currency}</p>
            <img src="${barcodeDataURL}" alt="Barcode">
        </div>
    `;
}

async function exportToExcel() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const items = await response.json();
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
        XLSX.writeFile(workbook, 'items.xlsx');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
}

async function exportSearchedItemsToExcel() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase();
    try {
        const response = await fetch(`${apiUrl}/search?search=${searchTerm}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const items = await response.json();
        const worksheet = XLSX.utils.json_to_sheet(items);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Searched Items');
        XLSX.writeFile(workbook, 'searched_items.xlsx');
    } catch (error) {
        console.error('Error exporting searched items to Excel:', error);
    }
}

function scanBarcode() {
    const videoElement = document.getElementById('barcodeScanner');
    videoElement.style.display = 'block';
    Quagga.init({
        inputStream: { name: 'Live', type: 'LiveStream', target: videoElement },
        decoder: { readers: ['code_128_reader'] }
    }, err => {
        if (err) {
            console.error('Error initializing Quagga:', err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(async result => {
        const code = result.codeResult.code;
        try {
            const response = await fetch(`${apiUrl}/barcode/${code}`);
            if (response.ok) {
                const item = await response.json();
                displayItems([item]);
            } else {
                console.error('Item not found:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching item by barcode:', error);
        }
        Quagga.stop();
        videoElement.style.display = 'none';
    });
}

window.onload = fetchProducts;
