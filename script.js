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

// Mostra/nasconde il menu di navigazione al clic del menu hamburger
document.querySelector('.menu-toggle').addEventListener('click', function() {
	this.classList.toggle('active');
	document.querySelector('nav ul').classList.toggle('show');
});

// Autoplay video
var video = document.getElementById('bg-video');
video.play();

// Invio dati del form per la prenotazione
document.getElementById('Prenotazione').addEventListener('submit', async function(e) {
	e.preventDefault(); // Previene il comportamento predefinito di invio del form
	const formData = new FormData(this); // Cattura i dati del form
	const response = await fetch('https://matrimonio-nicholas-e-carlotta.netlify.app/.netlify/functions/submit', {
		method: 'POST',
		body: JSON.stringify(Object.fromEntries(formData)),
		headers: { 'Content-Type': 'application/json' }
	});
	
	if (response.ok)
		alert('Grazie per aver inoltrato la tua partecipazione!');
	else
		alert('Si è verificato un errore, ti preghiamo di riprovare più tardi.');
});

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
	
	const result = await response.json();
	document.getElementById('upload-status').innerText = result.message;
	} catch (error) {
		alert('Errore nel caricamento! Ti preghiamo di riprovare più tardi.\nNel caso il problema persista puoi contattare Nicholas.');
		document.getElementById('upload-status').innerText = 'Errore nel caricamento delle foto';
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
