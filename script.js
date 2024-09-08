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
document.querySelector('nav ul li').addEventListener('click', function() {
	document.querySelector('.menu-toggle').classList.remove('active');
	document.querySelector('nav ul').classList.remove('show');
	document.querySelector('body').classList.remove('menu-active');
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Autoplay video
var video = document.getElementById('bg-video');
video.play();
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
        popup.style.display = 'block';
        popup.style.opacity = '1';
        
        // Nasconde il popup dopo 3 secondi con animazione fade-out
        setTimeout(() => {
            popup.classList.add('fade-out');
        }, 2000);
        
        // Rimuove il popup completamente dopo 3.5 secondi
        setTimeout(() => {
            popup.style.display = 'none';
            popup.classList.remove('fade-out');
        }, 3500);
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
