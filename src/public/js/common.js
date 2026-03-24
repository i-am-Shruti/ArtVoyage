class MuseumForm {
  constructor() {
    this.state = {
      museumHeader: '',
      date: '',
      nationality: '',
      nationalityPrice: 0,
      item: '',
      itemValue: 0,
      document: '',
      documentNumber: '',
      adultNames: [],
      childNames: [],
      totalPrice: 0
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.initCustomSelects();
  }

  bindEvents() {
    document.getElementById('navigateButton1')?.addEventListener('click', () => window.location.href = '/');
    
    const addAdultBtn = document.getElementById('addAdultBtn');
    const addChildBtn = document.getElementById('addChildBtn');
    const proceedBtn = document.getElementById('navigateButton2');
    const finalProceedBtn = document.getElementById('finalProceedButton');
    const documentSelect = document.getElementById('Documents');

    addAdultBtn?.addEventListener('click', () => this.addInputField('adult'));
    addChildBtn?.addEventListener('click', () => this.addInputField('child'));
    proceedBtn?.addEventListener('click', () => this.collectFormData());
    finalProceedBtn?.addEventListener('click', () => this.redirectToPayment());
    documentSelect?.addEventListener('change', (e) => this.handleDocumentChange(e));

    this.setupModalEvents();
  }

  setupModalEvents() {
    const modalButton = document.querySelector('.box');
    const closeButton = document.querySelector('.close-button');

    closeButton?.addEventListener('click', () => this.toggleModal(false));
    window.addEventListener('click', (e) => {
      if (e.target === modalButton) this.toggleModal(false);
    });
  }

  addInputField(type) {
    const container = type === 'adult' 
      ? document.getElementById('adultFields') 
      : document.getElementById('childFields');
    
    if (!container) return;

    if (type === 'child' && container.children.length === 0) {
      this.createSectionTitle(container, "Child's Name:");
    }

    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    inputGroup.innerHTML = `
      <input type="text" placeholder="Name" class="quantity">
      <button class="removeBtn">-</button>
    `;

    inputGroup.querySelector('.removeBtn').addEventListener('click', () => {
      inputGroup.remove();
      if (container.querySelectorAll('.input-group').length === 0) {
        const title = container.querySelector('.section-title');
        title?.remove();
      }
    });

    container.appendChild(inputGroup);
  }

  createSectionTitle(container, text) {
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = text;
    container.appendChild(title);
  }

  collectFormData() {
    const adultContainer = document.getElementById('adultFields');
    const childContainer = document.getElementById('childFields');

    this.state.museumHeader = document.getElementById('Museum')?.textContent || '';
    this.state.date = document.getElementById('Date')?.value;
    
    const nationality = document.getElementById('Nationality');
    this.state.nationality = nationality?.options[nationality.selectedIndex]?.text || '';
    this.state.nationalityPrice = parseInt(nationality?.value) || 0;

    const items = document.getElementById('Items');
    this.state.item = items?.options[items.selectedIndex]?.text || '';
    this.state.itemValue = parseInt(items?.value) || 0;

    const documents = document.getElementById('Documents');
    this.state.document = documents?.options[documents.selectedIndex]?.text || '';
    this.state.documentNumber = document.querySelector('input[placeholder="Enter Document Number"]')?.value || '';

    this.state.adultNames = this.getNamesFromContainer(adultContainer);
    this.state.childNames = this.getNamesFromContainer(childContainer);

    if (!this.validateForm()) return;

    this.state.totalPrice = (this.state.nationalityPrice * this.state.adultNames.length) + this.state.itemValue;
    if (this.state.totalPrice === 0) this.state.totalPrice = 5;

    this.populateModal();
    this.toggleModal(true);
  }

  getNamesFromContainer(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="text"]'))
      .map(input => input.value.trim())
      .filter(name => name !== '');
  }

  validateForm() {
    const missingFields = [];
    
    if (!this.state.date) {
      missingFields.push('Date');
      document.getElementById('Date')?.style?.setProperty('border-color', 'red');
    } else {
      const selectedDate = new Date(this.state.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Please select today or a future date for booking.');
        document.getElementById('Date')?.style?.setProperty('border-color', 'red');
        return false;
      }
      document.getElementById('Date')?.style?.setProperty('border-color', '');
    }
    
    if (!this.state.nationalityPrice || this.state.nationalityPrice === 0) {
      missingFields.push('Nationality');
      document.getElementById('Nationality')?.style?.setProperty('border-color', 'red');
    } else {
      document.getElementById('Nationality')?.style?.setProperty('border-color', '');
    }
    
    if (!this.state.document) {
      missingFields.push('Document');
      document.getElementById('Documents')?.style?.setProperty('border-color', 'red');
    } else {
      document.getElementById('Documents')?.style?.setProperty('border-color', '');
    }
    
    if (!this.state.documentNumber) {
      missingFields.push('Document Number');
      document.querySelector('input[placeholder="Enter Document Number"]')?.style?.setProperty('border-color', 'red');
    } else {
      let isValid = false;
      let errorMessage = '';
      
      switch(this.state.document) {
        case 'Passport':
          const passportPattern = /^[A-Za-z][A-Za-z0-9]{7}$/;
          isValid = passportPattern.test(this.state.documentNumber);
          errorMessage = 'Invalid Passport Number format!\n\nExample format: A6779809 (1 alphabet + 7 alphanumeric characters)\n\nPlease enter a valid passport number.';
          break;
          
        case 'Aadhar Card':
          const aadharPattern = /^\d{12}$/;
          isValid = aadharPattern.test(this.state.documentNumber);
          errorMessage = 'Invalid Aadhar Card Number format!\n\nExample format: 123456789012 (12 digits)\n\nPlease enter a valid 12-digit Aadhar number.';
          break;
          
        case 'Voter ID Card':
          const voterPattern = /^[A-Za-z0-9]{5,20}$/;
          isValid = voterPattern.test(this.state.documentNumber);
          errorMessage = 'Invalid Voter ID format!\n\nVoter ID should be 5-20 alphanumeric characters.\n\nPlease enter a valid Voter ID.';
          break;
          
        case 'Driving License':
          const licensePattern = /^[A-Za-z0-9]{5,20}$/;
          isValid = licensePattern.test(this.state.documentNumber);
          errorMessage = 'Invalid Driving License format!\n\nDriving License should be 5-20 alphanumeric characters.\n\nPlease enter a valid Driving License number.';
          break;
          
        default:
          const otherPattern = /^[A-Za-z0-9\-]{3,30}$/;
          isValid = otherPattern.test(this.state.documentNumber);
          errorMessage = 'Invalid Document Number format!\n\nDocument number should be 3-30 alphanumeric characters.\n\nPlease enter a valid document number.';
      }
      
      if (!isValid) {
        alert(errorMessage);
        document.querySelector('input[placeholder="Enter Document Number"]')?.style?.setProperty('border-color', 'red');
        return false;
      }
      document.querySelector('input[placeholder="Enter Document Number"]')?.style?.setProperty('border-color', '');
    }
    
    if (this.state.adultNames.length === 0) {
      missingFields.push('Adult Name (at least one required)');
    }
    
    if (missingFields.length > 0) {
      alert('Please fill the following required fields:\n\n' + missingFields.join('\n'));
      return false;
    }
    
    return true;
  }

  populateModal() {
    const modalFields = {
      museumHeader: `Museum: ${this.state.museumHeader}`,
      date: `Date: ${this.state.date}`,
      nationality: `Nationality: ${this.state.nationality}`,
      AdultNum: `Adult's Name: ${this.state.adultNames.join(', ') || 'None'}`,
      ChildNum: `Children's Name: ${this.state.childNames.join(', ') || 'None'}`,
      items: `Item: ${this.state.item} (Value: ₹${this.state.itemValue})`,
      documents: `Document: ${this.state.document}`,
      documentNumber: `Document Number: ${this.state.documentNumber}`,
      TotalPrice: `Total Price: ₹${this.state.totalPrice}`
    };

    for (const [id, text] of Object.entries(modalFields)) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }
  }

  toggleModal(show) {
    const modalButton = document.querySelector('.box');
    const modalContent = document.querySelector('.box-content');
    if (modalButton && modalContent) {
      modalButton.classList.toggle('show-modal', show);
      modalContent.style.display = show ? 'block' : 'none';
      if (show) {
        window.scrollTo(0, 0);
      }
    }
  }

  async redirectToPayment() {
    try {
      const response = await fetch('/payment/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          museumHeader: this.state.museumHeader,
          date: this.state.date,
          nationality: this.state.nationality,
          nationalityPrice: this.state.nationalityPrice,
          item: this.state.item,
          itemValue: this.state.itemValue,
          document: this.state.document,
          documentNumber: this.state.documentNumber,
          adultNames: this.state.adultNames.join(','),
          childNames: this.state.childNames.join(','),
          totalPrice: this.state.totalPrice
        })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Failed to create order: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  }

  handleDocumentChange(event) {
    const container = document.querySelector('.input-container');
    const existingInput = document.getElementById('otherDocument');
    const existingLabel = document.querySelector('label[for="otherDocument"]');
    const existingHint = document.getElementById('docHint');

    if (event.target.value === 'Others') {
      if (!existingInput) {
        container.insertAdjacentHTML('beforeend', `
          <label for="otherDocument">Other's Document Name:</label>
          <input type="text" id="otherDocument" placeholder="Enter Other Document Name" class="quantity">
        `);
      }
    } else {
      existingInput?.remove();
      existingLabel?.remove();
    }

    const hintMessages = {
      'Passport': 'Format: 1 alphabet + 7 alphanumeric (e.g., A6779809)',
      'Aadhar Card': 'Format: 12 digits only (e.g., 123456789012)',
      'Voter ID Card': 'Format: 5-20 alphanumeric characters',
      'Driving License': 'Format: 5-20 alphanumeric characters',
      'Others': 'Format: 3-30 alphanumeric characters'
    };

    if (existingHint) existingHint.remove();
    
    const docInput = document.querySelector('input[placeholder="Enter Document Number"]');
    if (docInput && hintMessages[event.target.options[event.target.selectedIndex].text]) {
      const hint = document.createElement('small');
      hint.id = 'docHint';
      hint.style.color = '#666';
      hint.style.display = 'block';
      hint.textContent = hintMessages[event.target.options[event.target.selectedIndex].text];
      docInput.parentNode.insertBefore(hint, docInput.nextSibling);
    }
  }

  initCustomSelects() {
    const selects = document.getElementsByClassName('custom-select');
    Array.from(selects).forEach(selectWrapper => {
      const select = selectWrapper.querySelector('select');
      if (!select) return;

      const selected = document.createElement('div');
      selected.className = 'select-selected';
      selected.textContent = select.options[select.selectedIndex]?.text || '';
      selectWrapper.appendChild(selected);

      const items = document.createElement('div');
      items.className = 'select-items select-hide';

      Array.from(select.options).forEach(option => {
        const item = document.createElement('div');
        item.textContent = option.text;
        item.addEventListener('click', () => {
          select.selectedIndex = option.index;
          selected.textContent = option.text;
          items.querySelectorAll('div').forEach(d => d.classList.remove('same-as-selected'));
          item.classList.add('same-as-selected');
        });
        items.appendChild(item);
      });

      selectWrapper.appendChild(items);
      selected.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAllSelects();
        items.classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
      });
    });

    document.addEventListener('click', () => this.closeAllSelects());
  }

  closeAllSelects() {
    document.querySelectorAll('.select-items').forEach(item => item.classList.add('select-hide'));
    document.querySelectorAll('.select-selected').forEach(item => item.classList.remove('select-arrow-active'));
  }
}

class ImageModal {
  constructor() {
    this.container = document.getElementById('imageContainer');
    this.expandedImage = document.getElementById('expandedImage');
    this.imgText = document.getElementById('imgtext');
    this.init();
  }

  init() {
    document.querySelectorAll('.column img').forEach(img => {
      img.addEventListener('click', () => this.open(img));
    });

    document.querySelector('.closebtn')?.addEventListener('click', () => this.close());
  }

  open(imgElement) {
    if (this.container && this.expandedImage) {
      this.expandedImage.src = imgElement.src;
      if (this.imgText) this.imgText.textContent = imgElement.alt;
      this.container.style.display = 'flex';
    }
  }

  close() {
    if (this.container) this.container.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MuseumForm();
  new ImageModal();
});
