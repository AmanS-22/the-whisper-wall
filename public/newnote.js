document.addEventListener("DOMContentLoaded", () => {
  const note = document.getElementById("note");
  const postBtn = document.getElementById("postBtn");
  const notesContainer = document.getElementById("notes");
  const counter = document.getElementById("counter");
  const error = document.getElementById("error");
  const MAX_CHARS = 300;
  
  let isPollingActive = true;
  const POLL_INTERVAL = 3000;

  // Create note element
  function createNoteElement(noteData) {
    const div = document.createElement("div");
    div.classList.add("note");
    
    const content = document.createElement("p");
    content.textContent = noteData.content;
    div.appendChild(content);
    
    const timestamp = document.createElement("div");
    timestamp.classList.add("timestamp");
    timestamp.textContent = new Date(noteData.created_at).toLocaleString();
    div.appendChild(timestamp);
    
    return div;
  }

  // Load initial notes via API
  async function loadInitialNotes() {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      notesContainer.innerHTML = "";

      if (!data || data.length === 0) {
        showEmptyMessage();
      } else {
        data.forEach(noteData => {
          notesContainer.appendChild(createNoteElement(noteData));
        });
      }
    } catch (err) {
      console.error("Initial load failed:", err);
      notesContainer.innerHTML = '<div class="empty">Error loading notes</div>';
    }
  }

  function showEmptyMessage() {
    notesContainer.innerHTML = '<div class="empty">No notes yet. Be the first to write one!</div>';
  }

  // Check for new notes via API
  async function checkForNewNotes() {
    if (!isPollingActive) return;
    
    try {
      const response = await fetch('/api/notes?limit=5');
      if (!response.ok) throw new Error('Failed to fetch new notes');
      
      const data = await response.json();

      if (data && data.length > 0) {
        data.forEach(noteData => {
          // Check if note already exists
          const existingNotes = Array.from(notesContainer.querySelectorAll('.note'));
          const noteExists = existingNotes.some(note => 
            note.querySelector('p').textContent === noteData.content
          );
          
          if (!noteExists) {
            notesContainer.prepend(createNoteElement(noteData));
          }
        });

        const emptyMsg = notesContainer.querySelector('.empty');
        if (emptyMsg) emptyMsg.remove();
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }

  // Character counter
  note.addEventListener("input", () => {
    const len = note.value.length;
    counter.textContent = `${len}/${MAX_CHARS}`;
    
    counter.className = "muted count " + (
      len > MAX_CHARS ? "bad" : 
      len > MAX_CHARS * 0.8 ? "warn" : "ok"
    );
    
    error.textContent = len > MAX_CHARS ? "Maximum 300 characters!" : "";
  });

  // Post new note via API
  postBtn.addEventListener("click", async () => {
    const content = note.value.trim();
    if (!content) {
      error.textContent = "Note cannot be empty!";
      return;
    }
    if (content.length > MAX_CHARS) {
      error.textContent = "Maximum 300 characters!";
      return;
    }

    postBtn.disabled = true;
    postBtn.innerHTML = "Posting...";

    try {
      const response = await fetch('/api/newnote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to post note');

      const data = await response.json();

      note.value = "";
      counter.textContent = `0/${MAX_CHARS}`;
      counter.className = "muted count ok";
      error.textContent = "";

      if (data && data.length > 0) {
        notesContainer.prepend(createNoteElement(data[0]));
        notesContainer.querySelector('.empty')?.remove();
      }
    } catch (err) {
      console.error(err);
      error.textContent = "Failed to post note. Please try again.";
    } finally {
      postBtn.disabled = false;
      postBtn.innerHTML = "Post";
    }
  });

  // Initial setup
  loadInitialNotes();
  
  // Start polling
  const poll = () => {
    checkForNewNotes().finally(() => {
      if (isPollingActive) setTimeout(poll, POLL_INTERVAL);
    });
  };
  poll();

  // Clean up
  window.addEventListener("beforeunload", () => {
    isPollingActive = false;
  });
});