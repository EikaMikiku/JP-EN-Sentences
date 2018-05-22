function Learn() {
	//Static Vars:
	this.courseSelect = document.getElementById("course-select");
	this.currentCourse = this.courseSelect.value;
	this.jpWord = document.getElementById("jp-word");
	this.engList = document.getElementById("english-list");
	this.sentenceList = document.getElementById("sentence-list");
	this.history = document.getElementById("history");
	this.jsLocation = "./extracted/";
	this.choiceCount = 6;

	//State vars:
	this.courseId = null;
	this.historyTotal = 0;
	this.historyCorrect = 0;
	this.previousCorrect = null;
}

Learn.prototype.populateTrainDom = function(pickedItems, correct) {
	this.previousCorrect = pickedItems[correct].item.id;

	//Japanese card
	let jpNoKanji = this.getJpText(pickedItems[correct]);
	let jpKanji = pickedItems[correct].item.cue.text;

	let jpKanjiDiv = document.createElement("div");
	jpKanjiDiv.innerText = jpKanji;
	let jpNoKanjiDiv = document.createElement("div");
	jpNoKanjiDiv.className = "ruby-text";
	jpNoKanjiDiv.innerText = jpNoKanji;

	if(jpKanji.replace(/\s/g, "") !==  jpNoKanji.replace(/\s/g, "")) {
		this.jpWord.appendChild(jpNoKanjiDiv);
	}
	this.jpWord.appendChild(jpKanjiDiv);

	let jpAudio = this.getAudio(pickedItems[correct].sound);
	this.jpWord.onclick = () => {
		jpAudio.play();
	};
	jpAudio.play(); //Play on load

	//English cards
	for(let i = 0; i < pickedItems.length; i++) {
		let div = document.createElement("div");
		div.className = "card eng selectable";
		div.innerText = this.getEngText(pickedItems[i]);

		div.onclick = (e) => {
			if(e.target.classList.contains("correct")) {
				this.clean();
				this.show();
				return;
			}
			let isCorrect = i === correct;
			e.target.classList.add(isCorrect ? "correct" : "incorrect");
			let audio = this.getAudio(pickedItems[i].sound);
			if(!isCorrect) {
				audio.play();
			} else {
				//Show english translation on sentenses
				let el = document.getElementsByClassName("english-sentense");
				console.log(el);
				for(let k = 0, len = el.length; k < len; k++) {
					el[k].style.display = "block";
				}
			}

			let isFirstAnswer = document.querySelectorAll(".incorrect,.correct").length === 1;
			if(isFirstAnswer) {
				//Update history
				this.historyTotal++;
				if(isCorrect) {
					this.historyCorrect++;
				}
				this.history.innerText = this.historyCorrect + "/" + this.historyTotal;
			}
		}
		this.engList.appendChild(div);
	}

	//Show sentences
	let sentences = pickedItems[correct].sentences;
	for(let k = 0; k < sentences.length; k++) {
		let sentenceAudio = this.getAudio(sentences[k].sound);
		let sDiv = document.createElement("div");
		sDiv.className = "col-6"; //Half screen
		let sCard = document.createElement("div");
		sCard.className = "card selectable";
		sDiv.appendChild(sCard);
		
		let engDiv = document.createElement("div");
		engDiv.className = "english-sentense";
		engDiv.innerHTML = this.getEngSentenceText(sentences[k]);

		let jpNoKanjiDiv = document.createElement("div");
		let jpKanjiDiv = document.createElement("div");
		let noKanjiHtml = this.getJpSentenceText(sentences[k]);
		let kanjiHtml = sentences[k].cue.text;
		jpNoKanjiDiv.innerHTML = noKanjiHtml;
		jpKanjiDiv.innerHTML = kanjiHtml;

		if(kanjiHtml.replace(/\s/g, "") !== noKanjiHtml.replace(/\s/g, "")) {
			sCard.appendChild(jpNoKanjiDiv);
		}
		sCard.appendChild(jpKanjiDiv);
		sCard.appendChild(engDiv);

		sCard.onclick = (e) => {
			sentenceAudio.play();
		};

		this.sentenceList.appendChild(sDiv);
	}
};

Learn.prototype.getAudio = function(path) {
	let audio = new Audio(
		this.jsLocation + this.courseId + "/" + 
		encodeURIComponent(encodeURIComponent(path))
	);
	return audio;
};

Learn.prototype.capitalise = function(text) {
	return text[0].toUpperCase() + text.slice(1);
};

Learn.prototype.getEngText = function(word) {
	return this.capitalise(word.item.response.text);
};

Learn.prototype.getEngSentenceText = function(sentence) {
	return this.capitalise(sentence.response.text);
};

Learn.prototype.getJpSentenceText = function(sentence) {
	let hrkt = sentence.cue.transliterations.Hrkt;
	let hira = sentence.cue.transliterations.Hira;
	if(hrkt) {
		return hrkt;
	} else if(hira) {
		return hira;
	} else {
		return "???";
	}
};

Learn.prototype.getJpText = function(word) {
	let hrkt = word.item.cue.transliterations.Hrkt;
	let hira = word.item.cue.transliterations.Hira;
	if(hrkt) {
		return hrkt;
	} else if(hira) {
		return hira;
	} else {
		return "???";
	}
};

Learn.prototype.show = function() {
	this.jpWord.style.display = "flex";
	this.engList.style.display = "block";
	let pickedItems = this.pick(this.choiceCount);
	let correct = Math.floor(Math.random() * this.choiceCount);
	this.populateTrainDom(pickedItems, correct);
};

Learn.prototype.pick = function(amount) {
	let words = window[this.currentCourse].goal_items;
	let result = [];
	let picked = {}; //To remove duplicate picking

	while(result.length !== amount) {
		let idx = Math.floor(Math.random() * words.length);
		if(!picked[idx] && this.previousCorrect !== words[idx].item.id) {
			picked[idx] = true;
			result.push(words[idx]);
		}
	}
	return result;
};

Learn.prototype.load = function() {
	let script = document.createElement("script");
	script.onload = () => {
		this.courseId = window[this.currentCourse].id;
		this.clean();
		this.show();
	};
	script.src = this.jsLocation + this.courseSelect.value + ".js";
	document.head.appendChild(script);
};

Learn.prototype.clean = function() {
	while(this.engList.firstChild) {
		this.engList.removeChild(this.engList.firstChild);
	}
	while(this.sentenceList.firstChild) {
		this.sentenceList.removeChild(this.sentenceList.firstChild);
	}
	while(this.jpWord.firstChild) {
		this.jpWord.removeChild(this.jpWord.firstChild);
	}
};