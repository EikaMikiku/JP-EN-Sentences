function Learn() {
	this.answerContainer = document.getElementById("answer");
	this.answerText = document.getElementById("answer-text");
	this.jpSentenceText = document.getElementById("jp-sentence-text");
	this.jpNokanjiSentenceText = document.getElementById("jp-nokanji-sentence-text");
	this.playAudio = document.getElementById("play-audio");
	this.viewAnswer = document.getElementById("view-answer");
	this.nextRandom = document.getElementById("next-random");
	this.indexPicker = document.getElementById("indexPicker");
	this.VolumeSlider = document.getElementById("VolumeSlider");
	this.AutoPlayAudio = document.getElementById("AutoPlayAudio");
	this.indexPicker.classList.remove("is-hidden");
	this.jsLocation = "./extracted/";
	this.currentAudio = null;
	this.currentSentenceIndex = 0;
}

Learn.prototype.getAudio = function(path, courseId) {
	let audio = new Audio(
		this.jsLocation + courseId + "/" +
		encodeURIComponent(encodeURIComponent(path))
	);
	return audio;
};

Learn.prototype.populateData = function(data) {
	this.jpSentenceText.innerHTML = data.cue.text;
	let tr = data.cue.transliterations;
	this.jpNokanjiSentenceText.innerHTML = tr.Hrkt || tr.Hira || tr.Latn || "???";
	this.answerText.innerText = data.response.text;
};

Learn.prototype.show = function(course, isRandom) {
	let sentences = this.findSentences(course);
	let idx = isRandom ? Math.floor(Math.random() * sentences.length) : this.currentSentenceIndex;
	this.currentSentenceIndex = idx;
	this.indexPicker.innerText = (idx + 1) + "/" + sentences.length;

	let picked = sentences[idx];
	this.populateData(picked);

	let audio = this.getAudio(picked.sound, window[course].id);
	document.body.appendChild(audio); //Just so we can find out the link if needed
	audio.volume = parseInt(this.VolumeSlider.value) / 100;
	if(this.AutoPlayAudio.checked) {
		audio.play();
	}
	this.currentAudio = audio;
	this.indexPicker.onclick = () => {
		let userInput = prompt("Enter new sentence index");
		let newIdx = parseInt(userInput);
		if(isNaN(newIdx) || newIdx.toString() !== userInput || newIdx > sentences.length || newIdx < 1) {
			alert("Bad index.");
		} else {
			this.currentSentenceIndex = newIdx - 1;
			this.clean();
			this.show(course);
		}
	};
	this.viewAnswer.onclick = () => {
		if(this.viewAnswer.innerText === "Next") {
			this.currentSentenceIndex++;
			this.clean();
			this.show(course);
		} else {
			this.answerContainer.classList.remove("is-hidden");
			this.viewAnswer.innerText = "Next";
			this.nextRandom.classList.remove("is-hidden");
		}
	};
	this.nextRandom.onclick = () => {
		this.clean();
		this.show(course, true);
	};
	this.playAudio.onclick = () => {
		if(this.currentAudio) {
			this.currentAudio.volume = parseInt(this.VolumeSlider.value) / 100;
			this.currentAudio.play();
		}
	};
};

Learn.prototype.findSentences = function(course) {
	let items = window[course].goal_items;
	let found = [];

	for(let i = 0; i < items.length; i++) {
		found.push(...items[i].sentences);
	}

	return found;
};

Learn.prototype.load = function() {
	let course = document.getElementById("course-select").value;
	let script = document.createElement("script");
	script.onload = () => {
		this.clean();
		this.show(course);
	};
	script.src = this.jsLocation + course + ".js";
	document.head.appendChild(script);
};

Learn.prototype.clean = function() {
	this.viewAnswer.innerText = "View answer";
	this.nextRandom.classList.add("is-hidden");
	if(!this.answerContainer.classList.contains("is-hidden")) {
		this.answerContainer.classList.add("is-hidden");
	}
	//Remove audio nodes from body
	let nodes = document.body.childNodes;
	for(let i = nodes.length -1; i >= 0; i--) {
		if(nodes[i].nodeName === "AUDIO") {
			document.body.removeChild(nodes[i]);
		}
	}
};