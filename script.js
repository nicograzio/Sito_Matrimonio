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
