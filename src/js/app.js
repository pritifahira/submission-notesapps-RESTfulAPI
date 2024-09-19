import Swal from 'sweetalert2';
import anime from 'animejs/lib/anime.es.js';

const API_URL = 'https://notes-api.dicoding.dev/v2';
const notesContainer = document.querySelector('#notes-container');
let notes = [];

async function fetchNotes() {
  const loadingIndicator = document.querySelector('loading-indicator');
  loadingIndicator.show();
  try {
    const response = await fetch(`${API_URL}/notes`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return [];
  } finally {
    setTimeout(() => {
      loadingIndicator.hide();
    }, 2000);
  }
}

function displayNotes(notes) {
  notesContainer.innerHTML = '';
  notes.forEach((note) => {
    const noteElement = document.createElement('note-item');
    noteElement.setAttribute('id', note.id);
    noteElement.setAttribute('title', note.title);
    noteElement.setAttribute('body', note.body);
    noteElement.setAttribute('createdAt', note.createdAt);
    notesContainer.appendChild(noteElement);
    anime({
      targets: notes,
      translateX: [-100, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutQuad',
    });
  });
}

class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                display: none;
            }
            .loader {
                width: 100px;
                height: 100px;
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #8981d8;
                -webkit-animation: spin 2s linear infinite;
                animation: spin 2s linear infinite;
            }
            @-webkit-keyframes spin {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <div class="loading-overlay">
            <div class="loader"></div>
        </div>
        `;
  }

  show() {
    this.shadowRoot.querySelector('.loading-overlay').style.display = 'flex';
  }

  hide() {
    this.shadowRoot.querySelector('.loading-overlay').style.display = 'none';
  }
}
customElements.define('loading-indicator', LoadingIndicator);

class AppBarSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
            @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            @import url('css/style.css');
        </style>
        <div class="container">
            <h1 class="logo">Notes Apps</h1>
            <div class="profile-section">
                <a href="#profile" class="icon">
                    <i class="bi bi-person-circle"></i>
                </a>
                <span class="profile-name">Hai, Priti Fahira!</span>
                <a href="#notifications" class="icon">
                    <i class="bi bi-bell"></i>
                </a>
            </div>
        </div>
        `;
  }
}
customElements.define('app-bar', AppBarSection);

// custom element form
class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
            @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
            @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
            @import url('css/style.css');
        </style>
        <div class="modal-overlay">
            <form id="note-form" class="modal-form">
                <h3>Add New Note</h3>
                <button type="button" class="close-button" aria-label="Close">&times;</button>
                <div class="form-section">
                    <label for="title">Title</label>
                    <input type="text" id="title" placeholder="Title">
                </div>
                <div class="form-section">
                    <label for="body">Detail</label>
                    <textarea id="body" placeholder="Detail Notes"></textarea>
                </div>
                <button type="submit">Save</button>
            </form>
        </div>
        `;
    this.shadowRoot
      .querySelector('.close-button')
      .addEventListener('click', () => {
        this.closeModal();
      });
    this.shadowRoot
      .querySelector('#note-form')
      .addEventListener('submit', this.addNote);
  }

  openModal() {
    const modal = this.shadowRoot.querySelector('.modal-overlay');
    modal.style.display = 'grid';
    anime({
      targets: modal,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeInOutQuad',
    });
  }

  // Fungsi untuk menutup modal
  closeModal() {
    const modal = this.shadowRoot.querySelector('.modal-overlay');
    anime({
      targets: modal,
      opacity: [1, 0],
      duration: 500,
      easing: 'easeInOutQuad',
      complete: () => {
        modal.style.display = 'none';
      },
    });
    this.shadowRoot.querySelector('#title').value = '';
    this.shadowRoot.querySelector('#body').value = '';
  }

  addNote = async (event) => {
    event.preventDefault();
    const title = this.shadowRoot.querySelector('#title').value;
    const body = this.shadowRoot.querySelector('#body').value;
    if (!title || !body) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Data',
        text: 'Please fill out both the title and detail fields before saving!',
      });
      return;
    }
    const newNote = { title, body };
    const loadingIndicator = document.querySelector('loading-indicator');
    loadingIndicator.show();
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      const result = await response.json();
      if (response.ok) {
        notes = await fetchNotes();
        this.closeModal();
        displayNotes(notes);
      } else {
        throw new Error(result.message || 'Failed to add note');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to add note! Please try again later.',
      });
    } finally {
      setTimeout(() => {
        loadingIndicator.hide();
      }, 5000);
    }
  };
}
customElements.define('note-form', NoteForm);

// Custom element note-item
class NoteItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
            .note-item {
                display: grid;
                grid-template-rows: auto 1fr auto auto;
                grid-template-columns: 1fr auto;
                gap: 10px;
                padding: 16px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                position: relative;
                margin-bottom: 20px;
                width: 350px;
                height: 190px;
                overflow: hidden;
            }
            .note-item h3 {
                margin: 0;
                grid-column: 1 / -1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .note-item p {
                margin: 0;
                grid-column: 1 / -1;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
                white-space: normal;
            }
            .note-item small {
                color: #777;
                grid-column: 1 / -1;
                margin-bottom: 10px;
            }
            .note-item button {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 5px;
                justify-self: start;
                grid-column: 2;
                grid-row: 4;
                align-self: end;
            }
            .note-item .archive-button {
                display: block;
                background-color: #ff4b4b;
                color: #fff;
            }
            .note-item .archive-button:hover {
                background-color: #e60000;
            }
        </style>
        <div class="note-item">
            <h3>${this.getAttribute('title')}</h3>
            <p>${this.getAttribute('body')}</p>
            <small>${new Date(this.getAttribute('createdAt')).toLocaleString()}</small>
            <button class="archive-button">${this.getAttribute('archived') === 'true' ? 'Unarchive' : 'Archive'}</button>
        </div>
        `;
    this.shadowRoot
      .querySelector('.archive-button')
      .addEventListener('click', () => this.archiveNote());
  }

  async archiveNote() {
    const noteId = this.getAttribute('id');
    const endpoint = `${API_URL}/notes/${noteId}/archive`;

    const loadingIndicator = document.querySelector('loading-indicator');
    loadingIndicator.show();
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const archiveEvent = new CustomEvent('archive-note', {
          detail: { id: noteId },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(archiveEvent);
      } else {
        console.error('Failed to archive note:', result.message);
      }
    } catch (error) {
      console.error('Failed to archive note:', error);
    } finally {
      setTimeout(() => {
        loadingIndicator.hide();
      }, 2000);
    }
  }
}
customElements.define('note-item', NoteItem);

document.addEventListener('archive-note', async (event) => {
  const noteId = event.detail.id;
  const endpoint = `${API_URL}/notes/${noteId}/archive`;

  const loadingIndicator = document.createElement('loading-indicator');
  document.body.appendChild(loadingIndicator);
  loadingIndicator.show();
  try {
    const response = await fetch(endpoint, { method: 'POST' });
    const result = await response.json();

    if (response.ok && result.status === 'success') {
      const updatedNotes = await fetchNotes();
      displayNotes(updatedNotes);
    } else {
      console.error('Failed to archive note:', result.message);
    }
  } catch (error) {
    console.error('Failed to archive note:', error);
  } finally {
    setTimeout(() => {
      loadingIndicator.hide();
    }, 2000);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  notes = await fetchNotes();
  displayNotes(notes);
});

document.getElementById('add-note-btn').addEventListener('click', () => {
  const noteFormElement = document.querySelector('note-form');
  if (noteFormElement) {
    noteFormElement.openModal();
  } else {
    console.error('NoteForm element not found in the DOM.');
  }
});

document.querySelector('.search-button').addEventListener('click', () => {
  const searchTerm = document
    .querySelector('.search-input')
    .value.toLowerCase();
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm)
  );
  displayNotes(filteredNotes);
});

document.querySelector('.search-input').addEventListener('input', () => {
  const searchTerm = document
    .querySelector('.search-input')
    .value.toLowerCase();
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm)
  );
  displayNotes(filteredNotes);
});
