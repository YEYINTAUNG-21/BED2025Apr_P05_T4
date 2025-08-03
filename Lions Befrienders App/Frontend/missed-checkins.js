document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#missedCheckinsTable tbody');
  const token = localStorage.getItem('token');

  async function loadMissedCheckins() {
    try {
      const res = await fetch('/api/missed-checkins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load missed check-ins');
      const data = await res.json();

      tableBody.innerHTML = '';

      data.forEach((entry) => {
        const tr = document.createElement('tr');

        const nameTd = document.createElement('td');
        nameTd.textContent = entry.senior_name;
        tr.appendChild(nameTd);

        const lastCheckinTd = document.createElement('td');
        lastCheckinTd.textContent = new Date(entry.last_checkin_date).toLocaleDateString();
        tr.appendChild(lastCheckinTd);

        const daysMissedTd = document.createElement('td');
        daysMissedTd.textContent = entry.days_missed;
        tr.appendChild(daysMissedTd);

        const statusTd = document.createElement('td');
        statusTd.textContent = entry.status;
        statusTd.style.color = (entry.status.toLowerCase() === 'resolved') ? 'green' : 'red';
        tr.appendChild(statusTd);

        const notesTd = document.createElement('td');
        notesTd.textContent = entry.notes || '';
        tr.appendChild(notesTd);

        const actionsTd = document.createElement('td');

        const resolveBtn = document.createElement('button');
        resolveBtn.classList.add('resolve-btn');
        resolveBtn.title = (entry.status.toLowerCase() === 'resolved') ? 'Mark as Unresolved' : 'Mark as Resolved';
        resolveBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        resolveBtn.addEventListener('click', () => toggleResolved(entry.checkin_id, entry.status));
        actionsTd.appendChild(resolveBtn);

        const noteBtn = document.createElement('button');
        noteBtn.classList.add('note-btn');
        noteBtn.title = 'Add/Edit Note';
        noteBtn.innerHTML = '<i class="fas fa-sticky-note"></i>';
        noteBtn.addEventListener('click', () => editNote(entry.checkin_id, entry.notes));
        actionsTd.appendChild(noteBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.title = 'Delete Record';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.checkin_id));
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);

        tableBody.appendChild(tr);
      });
    } catch (error) {
      console.error(error);
      alert('Error loading missed check-ins');
    }
  }

  async function toggleResolved(id, currentStatus) {
    const newStatus = (currentStatus.toLowerCase() === 'resolved') ? 'Unresolved' : 'Resolved';
    try {
      const res = await fetch(`/api/missed-checkins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await loadMissedCheckins();
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    }
  }

  async function editNote(id, currentNote) {
    const newNote = prompt('Enter note:', currentNote || '');
    if (newNote === null) return;

    try {
      const res = await fetch(`/api/missed-checkins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: newNote })
      });
      if (!res.ok) throw new Error('Failed to update note');
      await loadMissedCheckins();
    } catch (error) {
      console.error(error);
      alert('Error updating note');
    }
  }

  async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`/api/missed-checkins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete record');
      await loadMissedCheckins();
    } catch (error) {
      console.error(error);
      alert('Error deleting record');
    }
  }

  loadMissedCheckins();
});