// Imposta la data del matrimonio
var weddingDate = new Date("Sep 13, 2025 00:00:00").getTime();
var countdown = setInterval(function() {
	var now = new Date().getTime();
	var distance = weddingDate - now;
	if (distance > 0) {
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		if(window.innerWidth > 590)
			document.getElementById("time").innerHTML = "Wedding Countdown: " + days + "g " + hours + "h " + minutes + "m " + seconds + "s ";
		else
			document.getElementById("time").innerHTML = "Wedding Countdown: <br>" + days + "g " + hours + "h " + minutes + "m " + seconds + "s ";
	}
	else if (distance <= 0 && distance > -86400000) {
		clearInterval(countdown);
		document.getElementById("time").innerHTML = "È il giorno del matrimonio!";
	}
	else {
		clearInterval(countdown);
		document.getElementById("time").innerHTML = "Ci siamo SPOSATI!";
	}
}, 1000);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Autoplay video
let video = document.getElementById('bg-video');
video.play();
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Aggiungi animazioni al caricamento delle sezioni
let contents = document.querySelectorAll('.logo-image');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('nav ul li a');
window.addEventListener('scroll', function() {
	// Effetto Parallax su immagini di sfondo
	let win_pos = window.pageYOffset;
	contents.forEach((content) => {
		let content_move = content.getBoundingClientRect().top;
		if (win_pos > content_move) {
		    content.style.transform = "translateY(" + content_move * 0.15 + "px";
		}
	});
	
	//Effetto Parallax su video
	let video_move = video.getBoundingClientRect().top;
	if (win_pos > video_move) {
		video.style.transform = "translateY(" + video_move * -0.80 + "px";
	}

	// Selezione del link nella navbar in base alla sezione
	sections.forEach((section, index) => {
		let rect = section.getBoundingClientRect();
		if (rect.top <= 70 && rect.bottom >= 70) {
		    navLinks.forEach(link => link.classList.remove('active'));
		    navLinks[index].classList.add('active');
		}
	});
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Mostra/nasconde il menu di navigazione al clic del menu hamburger
document.querySelector('.menu-toggle').addEventListener('click', function() {
	this.classList.toggle('active');
	document.querySelector('nav ul').classList.toggle('show');
	document.querySelector('body').classList.toggle('menu-active');
});

// Nascondi il menu al click sui link delle sezioni 
document.querySelector('nav ul').addEventListener('click', function() {
	setTimeout(function() {
		document.querySelector('.menu-toggle').classList.remove('active');
		document.querySelector('nav ul').classList.remove('show');
	}, 400); // 1000 ms = 1 sec
	document.querySelector('body').classList.remove('menu-active');
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Invio dati del form per la prenotazione
document.getElementById('reservation-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        name: event.target.name.value,
        guests: event.target.guests.value,
        notes: event.target.notes.value
    };

    try {
        const response = await fetch('https://matrimonio-nicholas-e-carlotta.netlify.app/.netlify/functions/submit-reservation', { //'https://matrimonio-nicholas-e-carlotta.netlify.app/.netlify/functions/submit-reservation'
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Prenotazione inviata con successo!');
        } else {
            alert('Errore durante l\'invio della prenotazione.');
        }
    } catch (error) {
        alert('Errore durante l\'invio della prenotazione.');
        console.error(error);
    }
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Funzione per copiare l'IBAN
const copyButton = document.getElementById('copy-button');
const ibanText = document.getElementById('iban').textContent;
const popup = document.getElementById('popup');
copyButton.addEventListener('click', () => {
    // Copia il contenuto negli appunti
    navigator.clipboard.writeText(ibanText).then(() => {
        // Mostra il popup
        popup.style.opacity = '1';
        
        // Nasconde il popup dopo 3 secondi con animazione fade-out
        setTimeout(() => {
            popup.style.opacity = '0';
        }, 2000);
    });
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Funzione per calcolare il numero di slide visibili in base alla larghezza dello schermo
function calculateSlidesPerView() {
    const screenWidth = window.innerWidth;
	return Math.floor(screenWidth / 300) + 1;
}

// Inizializza Swiper
var swiper = new Swiper('.swiper-container', {
	slidesPerView: calculateSlidesPerView(),
	centeredSlides: true,
	loop: true,
	slideToClickedSlide: false,
	spaceBetween: -5,  // Sovrapposizione leggera tra le slide
	effect: 'coverflow',
	coverflowEffect: {
		rotate: 0,
		stretch: 0,
		depth: 100,
		modifier: 1,
		slideShadows: false,
	},
	autoplay: {
		delay: 3000,  // 3 secondi
		disableOnInteraction: false,  // Continua anche se l'utente interagisce
	},
	on: {
		setTranslate: function() {
			this.slides.forEach(function(slide) {
				const slideProgress = slide.progress;
				const scale = 1 - Math.abs(slideProgress) * 0.08;
				const opacity = 1 - Math.abs(slideProgress) * 0.15;
				const zIndex = 999 - Math.abs(slideProgress) * 10;  // Z-index decrescente
				slide.style.transform = `scale(${scale})`;
				slide.style.opacity = opacity;
				slide.style.zIndex = Math.round(zIndex);
			});
		}
	}
});

// Funzione per aggiornare slidesPerView su ridimensionamento della finestra
function updateSwiperSlidesPerView() {
    swiper.params.slidesPerView = calculateSlidesPerView();
    swiper.update();
}

// Aggiungi un listener per l'evento resize della finestra
window.addEventListener('resize', updateSwiperSlidesPerView);
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Caricamento immagini
document.getElementById('file').addEventListener('change', function() {
    const fileInput = this;
    const fileNameDisplay = document.getElementById('file-name');
	const buttonSubmitPhotos = document.getElementById('submit-photos');

    if (fileInput.files.length === 1) {
        // Se è stato selezionato un solo file, mostra il nome del file
        fileNameDisplay.textContent = fileInput.files[0].name;
		buttonSubmitPhotos.disabled = false;
    } else if (fileInput.files.length > 1) {
        // Se sono stati selezionati più file, mostra il numero di file
        fileNameDisplay.textContent = fileInput.files.length + " file selezionati";
		buttonSubmitPhotos.disabled = false;
    } else {
        // Se non è stato selezionato alcun file
        fileNameDisplay.textContent = "";
		buttonSubmitPhotos.disabled = true;
    }
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Invio delle foto dal form nella gallery
document.getElementById('upload-form').addEventListener('submit', async function(event) {
	event.preventDefault();
	const files = document.getElementById('file').files;
	const fileArray = [];
	const timestamp = Date.now();
	
	for (let i = 0; i < files.length; i++) {
		const fileContent = await toBase64(files[i]);
		const originalName = files[i].name;
		const newFileName = `${timestamp}_${originalName}`;
		fileArray.push({
		    fileContent,
		    fileName: newFileName
		});
	}
	try {
	const response = await fetch('https://matrimonio-nicholas-e-carlotta.netlify.app/.netlify/functions/upload-to-github', {
		method: 'POST',
		body: JSON.stringify({ files: fileArray }),
		headers: { 'Content-Type': 'application/json' }
	});
	
	if(response.ok) {
		const result = await response.json();
		//document.getElementById('upload-status').innerText = result.message;
		alert(result.message);
	}
	else
		alert('Si è verificato un errore, ti preghiamo di riprovare più tardi.');
	
	} catch (error) {
		alert('Errore nel caricamento! Ti preghiamo di riprovare più tardi.\nNel caso il problema persista puoi contattare Nicholas.');
		//document.getElementById('upload-status').innerText = 'Errore nel caricamento delle foto';
		console.error('Errore:', error);
	}

	function toBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.split(',')[1]);
			reader.onerror = error => reject(error);
		});
	}
});

// Funzione per mostrare la galleria completa
const galleryButton = document.getElementById('button-gallery');
const galleryButtonGoBack = document.querySelector('.back-arrow');
galleryButton.addEventListener('click', () => {
    document.querySelector('body').classList.toggle('gallery-active');
    document.getElementById('complete-gallery').style.display = 'flex';
	document.getElementById('gallery-title').style.display = 'block';
	galleryButtonGoBack.style.display = 'block';
	document.querySelector('.menu-toggle').classList.toggle('gallery-show');
    document.querySelector("nav ul").classList.toggle('gallery-show');
});

// Funzione per tornare indietro dalla galleria completa la galleria completa
galleryButtonGoBack.addEventListener('click', () => {
    document.querySelector('body').classList.toggle('gallery-active');
    document.getElementById('complete-gallery').style.display = 'none';
	document.getElementById('gallery-title').style.display = 'none';
	galleryButtonGoBack.style.display = 'none';
	document.querySelector('.menu-toggle').classList.toggle('gallery-show');
    document.querySelector("nav ul").classList.toggle('gallery-show');
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


document.addEventListener("DOMContentLoaded", function () {
    const imageGallery = document.getElementById("image-gallery");
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    const closeModal = document.querySelector(".close");
    const prev = document.querySelector(".prev");
    const next = document.querySelector(".next");
    const selectButton = document.getElementById("select-button");
    const downloadButton = document.getElementById("download-button");
    const downloadModalButton = document.getElementById("download-modal-button");

    let images = [];
    let selectedImages = new Set();
    let isSelecting = false;
    let currentIndex = 0;

    // Funzione per caricare immagini dalla repository GitHub
    function loadImages() {
        const apiUrl = "https://api.github.com/repos/nicograzio/Sito_Matrimonio/contents/images";

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                data.forEach((file) => {
                    if (file && (file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg|ico|heic|avif|raw|jfif)$/i.test(file.name))) {
			const div = document.createElement("div"); // new
			div.classList.add("img-container-div"); // new
                        const img = document.createElement("img");
                        img.src = file.download_url;
                        img.classList.add("gallery-image");
                        img.addEventListener("click", function () {
                            if (isSelecting) {
                                toggleSelection(this);
                            } else {
                                openModal(this.src);
                            }
                        });
			div.appendChild(img); // new
                        imageGallery.appendChild(div); // imageGallery.appendChild(img); 
                        images.push(file.download_url);
                    }
                });
            })
            .catch(error => console.error('Error fetching images:', error));
    }

    // Funzione per aprire il modal con l'immagine
    function openModal(src) {
        currentIndex = images.indexOf(src);
        if (currentIndex === -1) {
            console.error('Invalid image source:', src);
            return;
        }
        modal.style.display = "block";
        modalImage.src = src;
    }

    // Funzione per gestire la selezione delle immagini
    function toggleSelection(img) {
        const isSelected = selectedImages.has(img.src);
        if (isSelected) {
            selectedImages.delete(img.src);
            img.classList.remove("selected");
        } else {
            selectedImages.add(img.src);
            img.classList.add("selected");
        }
        updateDownloadButton();
    }

    // Funzione per aggiornare lo stato del pulsante di download
    function updateDownloadButton() {
        if (selectedImages.size > 0) {
            downloadButton.classList.remove("disabled");
            downloadButton.disabled = false;
        } else {
            downloadButton.classList.add("disabled");
            downloadButton.disabled = true;
        }
    }

    // Funzione per scaricare le immagini selezionate
    function downloadSelectedImages() {
        selectedImages.forEach(src => {
            fetch(src)
                .then(response => response.blob())
                .then(blob => {
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = src.substring(src.lastIndexOf("/") + 1); // Imposta il nome del file per il download
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(a.href); // Libera l'oggetto URL creato
                })
                .catch(error => console.error('Error downloading image:', error));
        });
    }

    // Funzione per scaricare l'immagine visualizzata nel modal
    function downloadImageInModal() {
        const src = modalImage.src;
        fetch(src)
            .then(response => response.blob())
            .then(blob => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = src.substring(src.lastIndexOf("/") + 1); // Imposta il nome del file per il download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href); // Libera l'oggetto URL creato
            })
            .catch(error => console.error('Error downloading image:', error));
    }

    // Evento per il pulsante "Seleziona"
    selectButton.onclick = function () {
        isSelecting = !isSelecting;
        if (isSelecting) {
            selectButton.textContent = "Annulla Selezione";
            selectButton.classList.add("active");
        } else {
            selectButton.textContent = "Seleziona";
            selectButton.classList.remove("active");
            clearSelections();
        }
    };

    // Funzione per deselezionare tutte le immagini
    function clearSelections() {
        selectedImages.clear();
        const selectedElements = document.querySelectorAll(".gallery-image.selected");
        selectedElements.forEach(img => img.classList.remove("selected"));
        updateDownloadButton();
    }

    // Evento per il pulsante "Scarica"
    downloadButton.onclick = function () {
        if (selectedImages.size > 0) {
            downloadSelectedImages();
        }
    };

    // Evento per il pulsante "Scarica Immagine" nel modal
    downloadModalButton.onclick = function () {
        downloadImageInModal();
    };

    // Evento per chiudere il modal cliccando sulla "x"
    closeModal.onclick = function () {
        modal.style.display = "none";
    };

    // Evento per chiudere il modal cliccando sullo sfondo scuro
    modal.onclick = function (event) {
        if (event.target === modal || event.target === document.querySelectorAll(".modal-content-container")) {
            modal.style.display = "none";
        }
    };

    // Evento per il pulsante "Precedente" nel modal
    prev.onclick = function () {
        currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
        modalImage.src = images[currentIndex];
    };

    // Evento per il pulsante "Successivo" nel modal
    next.onclick = function () {
        currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
        modalImage.src = images[currentIndex];
    };

    // Carica le immagini all'avvio della pagina
    loadImages();
});

