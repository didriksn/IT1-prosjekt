// https://gwpa.no/nb/auctions
const artworks = [
	{
		title: 'Nattkafé',
		artist: 'Edvard Munch',
		year: '1901',
		image: 'assets/14661.jpg',
		price: 70000
	},
	{
		title: 'Komposisjon 1969',
		artist: 'Jorn Asger',
		year: '1969',
		image: 'assets/16907.jpg',
		price: 8000
	},
	{
		title: 'Lé málèrî',
		artist: 'Didrik Bakka Sommersten',
		year: '2025',
		image: 'assets/lemaleri.png',
		price: 22
	},
	{
		title: "Comedian",
		artist: "Maurizio Cattelan",
		year: "2024",
		image: "assets/4044.avif",
		price: 6200000
	},
	{
		title: "Salvator Mundi",
		artist: "Leonardo da Vinci",
		year: "c. 1500",
		image: "assets/Leonardo_da_Vinci,_Salvator_Mundi,_c.1500,_oil_on_walnut,_45.4_×_65.6_cm.jpg",
		price: 4600840940
	}
];

let currentIndex = 0;
const totalRounds = artworks.length;
let totalPoints = 0;

const artTitle = document.getElementById('art-title');
const artMeta = document.getElementById('art-meta');
const artYear = document.getElementById('art-year');
const artImg = document.getElementById('art-img');
const guessInput = document.getElementById('price-guess');
const submitBtn = document.getElementById('submit-guess');
const overlay = document.getElementById('overlay');
const roundNumEl = document.getElementById('round-num');
const totalRoundsEl = document.getElementById('total-rounds');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
function formatCurrency(n){
	return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(n);
}

function loadArtwork(index){
	const artwork = artworks[index];
	artTitle.textContent = artwork.title;
	artMeta.textContent = `${artwork.artist} — ${artwork.year}`;
	artImg.src = artwork.image;
	artImg.alt = `${artwork.title} by ${artwork.artist}`;
	
	if (roundNumEl) roundNumEl.textContent = String(index + 1);
	if (overlay) overlay.classList.add('hidden');
	if (guessInput) guessInput.value = '';

}

function showResult(guess){
	const actual = artworks[currentIndex].price;
	const diff = Math.abs(guess - actual);

	const ratio = actual > 0 ? Math.min(1, diff / actual) : 1;
	const pointsThisRound = Math.max(0, Math.round(1000 * (1 - ratio)));

	totalPoints += pointsThisRound;

	if (overlay) {
		const isLast = currentIndex === totalRounds - 1;
		overlay.innerHTML = `
		  <div class="result-body">
		    <div>Ditt gjett: <strong>${formatCurrency(guess)}</strong></div>
		    <div>Riktig pris: <strong>${formatCurrency(actual)}</strong></div>
		    <div>Du fikk: <strong>${pointsThisRound}</strong> poeng</div>
		  </div>
		  <div class="overlay-actions"><button id="next-round">${isLast ? 'Fullfør' : 'Neste'}</button></div>
		`;
		overlay.classList.remove('hidden');

		const nextBtn = document.getElementById('next-round');
		nextBtn.addEventListener('click', ()=>{
			if (!isLast) {
				currentIndex += 1;
				loadArtwork(currentIndex);
			} else {
				showFinalSummary();
			}
		});
	}
}

function showFinalSummary(){
	const message = `<strong>Spillet er ferdig</strong><br/>Runder: ${totalRounds}<br/>Poeng total: ${totalPoints}`;
	if (overlay) {
		overlay.innerHTML = `<div class="result-body">${message}</div><div class="overlay-actions"><button id="restart-game">Spill igjen</button></div>`;
		overlay.classList.remove('hidden');
		const restart = document.getElementById('restart-game');
		if (restart) restart.addEventListener('click', ()=>{
			currentIndex = 0;
			totalPoints = 0;
			loadArtwork(currentIndex);
		});
	}
}

function parseGuess(value){
	const digits = String(value).replace(/\D+/g, '');
	if (digits === '') return NaN;
	return Number(digits);
}

submitBtn.addEventListener('click', () => {
	const val = parseGuess(guessInput.value);
	if (!Number.isFinite(val) || val < 0) {
		if (overlay) {
			overlay.innerHTML = 'Vennligst skriv inn et gyldig ikke-negativt tall.';
			overlay.classList.remove('hidden');
		}
		return;
	}
	showResult(val);
});

guessInput.addEventListener('keydown', (e)=>{
	if (e.key !== 'Enter') return;
	const isOverlayHidden = overlay.classList.contains('hidden');
	if (isOverlayHidden) {
		e.preventDefault();
		e.stopPropagation();
		submitBtn.click();
		return;
	}
	e.preventDefault();
	e.stopPropagation();
	const nextBtn = document.getElementById('next-round');
	const restartBtn = document.getElementById('restart-game');
	const target = nextBtn || restartBtn;
	if (target) target.click();
});


guessInput.addEventListener('input', ()=>{
	if (overlay) overlay.classList.add('hidden');
	const raw = guessInput.value;
	let digits = raw.replace(/\D+/g, '');
	digits = digits.replace(/^0+/, '');
	if (!digits) {
		guessInput.value = '';
		return;
	}

	const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	guessInput.value = `kr ${formatted}`;
	guessInput.setSelectionRange(guessInput.value.length, guessInput.value.length);
});


if (totalRoundsEl) {
	totalRoundsEl.textContent = String(totalRounds);
}
loadArtwork(currentIndex);