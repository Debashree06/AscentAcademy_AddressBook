const form = document.querySelector('form');
const trHead = document.querySelector('#head');
const conData = document.querySelector('#data');
const fullnameInput = document.querySelector('#fullname');
const addressInput = document.querySelector('#address');
const phoneInput = document.querySelector('#phonenumber');
const emailInput = document.querySelector('#emailaddress');
const urlInput = document.querySelector('#url');
const button = document.querySelector('button');

let db

window.onload = () => {
    let request = window.indexedDB.open('contacts', 1)

    request.onerror = () => {
        console.log('Database failed to open')
    }

    request.onsuccess = () => {
        console.log('Database opened successfully')
        db = request.result;
        displayData();
    }
    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement:true });
    
        objectStore.createIndex('fullname', 'fullname', { unique: false });
        objectStore.createIndex('address', 'address', { unique: false });
        objectStore.createIndex('phonenumber', 'phonenumber', { unique: false });
        objectStore.createIndex('emailaddress', 'emailaddress', { unique: false });
        objectStore.createIndex('url', 'url', { unique: false });
    
        console.log('Database setup complete');
      };

    form.onsubmit = (e) => {
        e.preventDefault()
        let newItem = { fullname: fullnameInput.value, address: addressInput.value, phonenumber: phoneInput.value, emailaddress: emailInput.value, url: urlInput.value };
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectStore = transaction.objectStore('contacts');
        var request = objectStore.add(newItem)

        request.onsuccess = () => {
            fullnameInput.value = '';
            addressInput.value = '';
            phoneInput.value = '';
            emailInput.value = '';
            urlInput.value = '';
        };

        transaction.oncomplete = () => {
            console.log('Transaction completed: database modification finished.');
            displayData();
        };

        transaction.onerror = () => {
            console.log('Transaction not opened due to error');
        };
    }

    function displayData() {
        while (conData.firstChild) {
          conData.removeChild(conData.firstChild);
        }

        let objectStore = db.transaction('contacts').objectStore('contacts');

        objectStore.openCursor().onsuccess = (e) => {
          let cursor = e.target.result;

          if(cursor) {
            let tr = document.createElement('tr');
            let tdFullName = document.createElement('td'); 
            let tdAddress = document.createElement('td');
            let tdPhoneNumber = document.createElement('td');
            let tdEmailAddress = document.createElement('td');
            let tdUrl = document.createElement('td');

            tr.appendChild(tdFullName);
            tr.appendChild(tdAddress);
            tr.appendChild(tdPhoneNumber);
            tr.appendChild(tdEmailAddress);
            tr.appendChild(tdUrl);
            conData.appendChild(tr);
    
            tdFullName.textContent = cursor.value.fullname
            tdAddress.textContent = cursor.value.address
            tdPhoneNumber.textContent = cursor.value.phonenumber
            tdEmailAddress.textContent = cursor.value.emailaddress
            tdUrl.textContent = cursor.value.url
    
            tr.setAttribute('data-contact-id', cursor.value.id);

    
            let deleteBtn = document.createElement('button');
            tr.appendChild(deleteBtn);
            deleteBtn.textContent = 'Delete';
    
            deleteBtn.onclick = deleteItem;

            cursor.continue();
          } 
          else {
            if(!conData.firstChild) {
              let para = document.createElement('p');
              para.textContent = 'No contact stored.'
              conData.appendChild(para);
            }
            console.log('Notes all displayed');
          }
        };
      }

      function deleteItem(e) {
        let contactId = Number(e.target.parentNode.getAttribute('data-contact-id'));
        let transaction = db.transaction(['contacts'], 'readwrite');
        let objectStore = transaction.objectStore('contacts');
        let request = objectStore.delete(contactId);
    
        transaction.oncomplete = () => {
          e.target.parentNode.parentNode.removeChild(e.target.parentNode);
          console.log('Contact ' + contactId + ' deleted.');

          if(!conData.firstChild) {
            let para = document.createElement('p');
            para.textContent = 'No notes stored.';
            conData.appendChild(para);
          }
        };
      }
}
