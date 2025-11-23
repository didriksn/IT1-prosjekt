// Simple Auction Guess game using the user's template image.
// The artwork data is currently a single item; you can add more later.

const artwork = {
	title: 'Sample Artwork',
	artist: 'Unknown Artist',
	year: '2025',
	image: 'assets/printable-number-1-silhouette.png',
	// set a mock auction price (in USD). Replace with real values later.
	price: 75000
};

// DOM elements
const artTitle = document.getElementById('art-title');
const artMeta = document.getElementById('art-meta');
const artYear = document.getElementById('art-year');
const artImg = document.getElementById('art-img');
const guessInput = document.getElementById('price-guess');
const submitBtn = document.getElementById('submit-guess');
const overlay = document.getElementById('overlay');

function formatCurrency(n){
	return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

function init(){
	artTitle.textContent = artwork.title;
	artMeta.textContent = `${artwork.artist} — `;
	artYear.textContent = artwork.year;
	artImg.src = artwork.image;
	artImg.alt = `${artwork.title} by ${artwork.artist}`;
}

function showResult(guess){
	const actual = artwork.price;
	const diff = Math.abs(guess - actual);
	const pct = Math.round((diff / actual) * 100);
	let message = '';
	if (guess === actual) message = `Perfect! You guessed the exact sale price ${formatCurrency(actual)}.`;
	else message = `Actual sale price: <strong>${formatCurrency(actual)}</strong>. Your guess: <strong>${formatCurrency(guess)}</strong> — difference ${formatCurrency(diff)} (${pct}% off).`;

		// show result as an overlay on the image
		if (overlay) {
			overlay.innerHTML = message;
			overlay.classList.remove('hidden');
		}
}

// Helper: convert formatted value (with spaces) to number
function parseGuess(value){
	const digits = String(value).replace(/\s+/g, '');
	if (digits === '') return NaN;
	// only digits allowed
	if (!/^\d+$/.test(digits)) return NaN;
	try{ return Number(digits); }catch{ return NaN }
}

submitBtn.addEventListener('click', () => {
	const val = parseGuess(guessInput.value);
	if (!Number.isFinite(val) || val < 0) {
		if (overlay) {
			overlay.innerHTML = 'Please enter a valid non-negative number for your guess.';
			overlay.classList.remove('hidden');
		}
		return;
	}
	showResult(val);
});

// Allow pressing Enter on the input
guessInput.addEventListener('keydown', (e)=>{
	if (e.key === 'Enter') submitBtn.click();
});

// Hide overlay when the user starts editing a new guess
guessInput.addEventListener('input', ()=>{
	if (overlay) overlay.classList.add('hidden');
	// Live-format the input with spaces every three digits
	const pos = guessInput.selectionStart;
	const raw = guessInput.value;
	// keep only digits
	const digits = raw.replace(/\D+/g, '');
	// format with space as thousands separator
	const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	guessInput.value = formatted;
	// move caret to the end (simple but reliable)
	guessInput.setSelectionRange(guessInput.value.length, guessInput.value.length);
});

init();

