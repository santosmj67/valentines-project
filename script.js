onload = () => {
    document.body.classList.remove("container");
    // load saved card photos (if any)
    loadSavedCardPhotos();
  };

  const wrapper = document.querySelector(".wrapper");
  const openBtn = document.getElementById("openBtn");
  const closeBtn = document.getElementById("closeBtn");

  // photo elements inside letter (supports two images + drag/drop + per-slot replace)
  const photoInput = document.getElementById('photo-input');
  const cardPhotoEls = [
    document.getElementById('card-photo-1'),
    document.getElementById('card-photo-2')
  ];
  const letterPhoto = document.querySelector('.letter-photo');
  const photoSlots = document.querySelectorAll('.photo-slot');

  let activeSlotIndex = null; // when user clicks a specific slot

  function loadSavedCardPhotos() {
    try {
      const raw = localStorage.getItem('card-photos');
      const arr = raw ? JSON.parse(raw) : [];
      let any = false;

      // load saved (data URLs) first
      arr.slice(0, 2).forEach((src, i) => {
        if (src && cardPhotoEls[i]) {
          cardPhotoEls[i].src = src;
          photoSlots[i]?.classList.add('has-photo');
          any = true;
        }
      });

      // fallback to DOM-provided src attributes (preloaded images in /img/)
      if (!any) {
        cardPhotoEls.forEach((el, i) => {
          const srcAttr = el?.getAttribute('src') || '';
          if (srcAttr && srcAttr.trim() !== '') {
            photoSlots[i]?.classList.add('has-photo');
            any = true;
          }
        });
      }

      if (any && letterPhoto) letterPhoto.classList.add('has-photo');
    } catch (err) { /* ignore */ }
  }

  function saveCardPhotos() {
    try {
      const arr = cardPhotoEls.map(el => (el && el.src) ? el.src : null);
      localStorage.setItem('card-photos', JSON.stringify(arr));
    } catch (e) { /* ignore */ }
  }

  function setPhotoFromFile(file, index) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (cardPhotoEls[index]) {
        cardPhotoEls[index].src = src;
        photoSlots[index]?.classList.add('has-photo');
        if (letterPhoto) letterPhoto.classList.add('has-photo');
        saveCardPhotos();
      }
    };
    reader.readAsDataURL(file);
  }

  if (letterPhoto) {
    // click whole area to open picker (unless user clicked a slot)
    letterPhoto.addEventListener('click', (e) => {
      if (e.target.closest('.photo-slot')) return; // slot click handled separately
      activeSlotIndex = null;
      photoInput?.click();
    });

    // clicking a specific slot replaces only that slot
    photoSlots.forEach(slot => {
      slot.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const i = Number(slot.dataset.index || 0);
        activeSlotIndex = isNaN(i) ? 0 : i;
        photoInput?.click();
      });
    });

    // drag & drop support (map dropped images to slots)
    letterPhoto.addEventListener('dragover', (e) => { e.preventDefault(); letterPhoto.classList.add('drag-over'); });
    letterPhoto.addEventListener('dragleave', () => { letterPhoto.classList.remove('drag-over'); });
    letterPhoto.addEventListener('drop', (e) => {
      e.preventDefault();
      letterPhoto.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length === 0) return;
      if (files.length === 1) {
        setPhotoFromFile(files[0], 0);
      } else {
        files.slice(0,2).forEach((f, i) => setPhotoFromFile(f, i));
      }
    });
  }

  photoInput?.addEventListener('change', (ev) => {
    const files = Array.from(ev.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) { activeSlotIndex = null; return; }

    if (activeSlotIndex !== null) {
      setPhotoFromFile(files[0], activeSlotIndex);
    } else {
      files.slice(0,2).forEach((f, i) => setPhotoFromFile(f, i));
    }

    activeSlotIndex = null;
    photoInput.value = '';
  });

  // initialize saved photos (if any)
  loadSavedCardPhotos();
  
  openBtn.addEventListener("click", () => {
      wrapper.classList.add("open");
      openBtn.style.display = "none";
      closeBtn.style.display = "inline-block";
  });
  
  closeBtn.addEventListener("click", () => {
      wrapper.classList.remove("open");
      closeBtn.style.display = "none";
      openBtn.style.display = "inline-block";
  });
  