class DropdownFilter {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    const dropdown = document.querySelector('.dropbtn');
    dropdown?.addEventListener('click', (e) => this.toggle(e));

    const input = document.getElementById('myInput');
    input?.addEventListener('keyup', () => this.filter());
  }

  toggle(event) {
    event?.stopPropagation();
    document.getElementById('myDropdown')?.classList.toggle('show');
  }

  filter() {
    const input = document.getElementById('myInput');
    const filter = input?.value.toUpperCase() || '';
    const links = document.querySelectorAll('.dropdown-content a');

    links.forEach(link => {
      const text = link.textContent || link.innerText;
      link.style.display = text.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
    });
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.matches('.dropbtn')) {
    document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  new DropdownFilter();
});

function logout() {
  fetch('/auth/logout', {
    method: 'POST',
    credentials: 'same-origin'
  })
    .then(() => {
      window.location.href = '/login';
    });
}

function showMyTickets() {
  fetchUserTickets();
  document.getElementById('ticketsModal').style.display = 'flex';
}

function closeTicketsModal() {
  document.getElementById('ticketsModal').style.display = 'none';
}

function fetchUserTickets() {
  document.getElementById('ticketsList').innerHTML = '<p style="text-align:center;padding:20px;">Loading tickets...</p>';
  
  fetch('/auth/user-tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success && data.tickets && data.tickets.length > 0) {
        displayTickets(data.tickets);
      } else {
        document.getElementById('ticketsList').innerHTML = '<p style="text-align:center;padding:20px;">No tickets found.</p>';
      }
    })
    .catch(err => {
      console.error('Error:', err);
      document.getElementById('ticketsList').innerHTML = '<p style="text-align:center;padding:20px;color:red;">Failed to load tickets.</p>';
    });
}

function displayTickets(tickets) {
  const ticketsList = document.getElementById('ticketsList');
  ticketsList.innerHTML = '';
  
  tickets.forEach(ticket => {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket-item';
    ticketDiv.innerHTML = `
      <div class="ticket-info">
        <p><strong>Museum:</strong> ${ticket.MuseumHeader}</p>
        <p><strong>Date:</strong> ${formatDate(ticket.Date)}</p>
        <p><strong>Document:</strong> ${ticket.Document}</p>
        <p><strong>Doc No:</strong> ${ticket.DocumentNumber}</p>
        <p><strong>Price:</strong> Rs ${ticket.totalPrice}</p>
      </div>
      <button type="button" class="download-btn" onclick="downloadTicket('${ticket._id}')">Download</button>
    `;
    ticketsList.appendChild(ticketDiv);
  });
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function downloadTicket(ticketId) {
  console.log('Downloading ticket:', ticketId);
  
  fetch('/pdf/generatePdf?bookingId=' + ticketId, {
    credentials: 'same-origin'
  })
    .then(response => {
      if (response.status === 401) {
        alert('Please log in again to download the ticket');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to download ticket');
      }
      return response.blob();
    })
    .then(blob => {
      if (!blob) return;
      console.log('Blob received:', blob.size);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ticket.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      alert('Ticket downloaded successfully!');
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Failed to download ticket: ' + (err.message || 'Unknown error'));
    });
}
