// Simple Auction Guess game using the user's template image.
// The game now supports multiple artworks (rounds). To add a new round,
// append an object to the `artworks` array with {title, artist, year, image, price}.

const artworks = [
	{
		title: 'Untitled',
		artist: 'Joan Mitchell',
		year: '1992',
		image: 'assets/Skjermbilde 2025-11-24 170451.png',
		// price in NOK
		price: 7136571.60
	},
	{
		title: 'Keller Fair II',
		artist: 'Lynne Drexler',
		year: '1959-1962',
		image: 'assets/Skjermbilde 2025-11-24 170917.png',
		price: 20709850.57
	},
	{
		title: 'Cubist Still Life (Study)',
		artist: 'Roy Lichtenstein',
		year: '1974',
		image: 'assets/Skjermbilde 2025-11-24 171146.png',
		price: 908290.93
	},
	{
		title: "Skull",
		artist: "Andy Warhol",
		year: "1976",
		image: "assets/Skjermbilde 2025-11-24 172041.png",
		price: 19463377.08
	},
	{
		title: "Salvator Mundi",
		artist: "Leonardo da Vinci",
		year: "c. 1500",
		image: "assets/Leonardo_da_Vinci,_Salvator_Mundi,_c.1500,_oil_on_walnut,_45.4_×_65.6_cm.jpg",
		price: 4600840940.10
	}
];

let currentIndex = 0;
const totalRounds = artworks.length;
let totalPoints = 0; // accumulated points across rounds

// DOM elements
const artTitle = document.getElementById('art-title');
const artMeta = document.getElementById('art-meta');
const artYear = document.getElementById('art-year');
const artImg = document.getElementById('art-img');
const guessInput = document.getElementById('price-guess');
const submitBtn = document.getElementById('submit-guess');
const overlay = document.getElementById('overlay');
const roundNumEl = document.getElementById('round-num');
const totalRoundsEl = document.getElementById('total-rounds');

function formatCurrency(n){
	// Format using Norwegian kroner
	return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(n);
}

function init(){
	// initialize round counter display
	if (totalRoundsEl) totalRoundsEl.textContent = String(totalRounds);
	loadArtwork(currentIndex);
	// don't pre-fill currency symbol; show it only when user types digits
	if (guessInput) guessInput.value = '';
}

function loadArtwork(index){
	const artwork = artworks[index];
	artTitle.textContent = artwork.title;
	artMeta.textContent = `${artwork.artist} — ${artwork.year}`;
	artImg.src = artwork.image;
	artImg.alt = `${artwork.title} by ${artwork.artist}`;
	if (roundNumEl) roundNumEl.textContent = String(index + 1);
	// hide overlay and clear input when loading a new artwork
	if (overlay) overlay.classList.add('hidden');
	if (guessInput) guessInput.value = '';
}

function showResult(guess){
	const actual = artworks[currentIndex].price;
	const diff = Math.abs(guess - actual);
	const pct = Math.round((diff / actual) * 100);

	// compute points for this round (scale 0..1000 where 0 = 100%+ error, 1000 = exact)
	const ratio = actual > 0 ? Math.min(1, diff / actual) : 1; // fraction error capped at 1
	const pointsThisRound = Math.max(0, Math.round(1000 * (1 - ratio)));

	// update running stats
	totalPoints += pointsThisRound;

	// show points summary in overlay (replaces previous textual message)
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
		// No special ignore flag — input handler will prevent propagation
		// of the Enter that submitted the guess so the overlay won't advance
		// on the same keypress.
		const nextBtn = document.getElementById('next-round');
		if (nextBtn) nextBtn.addEventListener('click', ()=>{
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
			// reset state and restart
			currentIndex = 0;
			totalPoints = 0;
			loadArtwork(currentIndex);
		});
	}
}

// Helper: convert formatted value (with spaces) to number
function parseGuess(value){
	// remove any non-digit characters (including currency symbol and spaces)
	const digits = String(value).replace(/\D+/g, '');
	if (digits === '') return NaN;
	try{ return Number(digits); }catch{ return NaN }
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

// Allow pressing Enter on the input
guessInput.addEventListener('keydown', (e)=>{
	if (e.key !== 'Enter') return;
	const isOverlayHidden = overlay.classList.contains('hidden');
	// If overlay is hidden, Enter should submit — prevent the key event
	// from reaching the global handler on the same press.
	if (isOverlayHidden) {
		e.preventDefault();
		e.stopPropagation();
		submitBtn.click();
		return;
	}
	// If overlay is visible and input is focused, Enter should advance.
	e.preventDefault();
	e.stopPropagation();
	const nextBtn = document.getElementById('next-round');
	const restartBtn = document.getElementById('restart-game');
	const target = nextBtn || restartBtn;
	if (target) target.click();
});

// When the overlay is visible, allow Enter to advance to next round or restart.
document.addEventListener('keydown', (e) => {
	if (e.key !== 'Enter') return;
	if (!overlay) return;
	// If overlay is visible (not hidden), find next or restart button and trigger it
	const isHidden = overlay.classList.contains('hidden');
	if (!isHidden) {
		const nextBtn = document.getElementById('next-round');
		const restartBtn = document.getElementById('restart-game');
		const target = nextBtn || restartBtn;
		if (target) {
			target.click();
			e.preventDefault();
		}
	}
});

// Hide overlay when the user starts editing a new guess
guessInput.addEventListener('input', ()=>{
	if (overlay) overlay.classList.add('hidden');
	// Live-format the input with spaces every three digits
	const raw = guessInput.value;
	// keep only digits
	let digits = raw.replace(/\D+/g, '');
	// remove leading zeros so user can't type 0 as the first digit
	digits = digits.replace(/^0+/, '');
	if (!digits) {
		// no digits -> clear input (no currency prefix)
		guessInput.value = '';
		return;
	}
	// format with space as thousands separator
	const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	// prefix with 'kr' when there are digits
	guessInput.value = `kr ${formatted}`;
	// move caret to the end
	guessInput.setSelectionRange(guessInput.value.length, guessInput.value.length);
});

init();

