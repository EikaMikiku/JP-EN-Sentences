function Learn() {
	this.answerContainer = document.getElementById("answer");
	this.answerText = document.getElementById("answer-text");
	this.jpSentenceText = document.getElementById("jp-sentence-text");
	this.jpNokanjiSentenceText = document.getElementById("jp-nokanji-sentence-text");
	this.playAudio = document.getElementById("play-audio");
	this.viewAnswer = document.getElementById("view-answer");
	this.jsLocation = "./extracted/";
	this.currentAudio = null;
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
	this.jpNokanjiSentenceText.innerHTML = tr.Hrkt || tr.Hira || tr.Latn || "";
	this.answerText.innerText = data.response.text;
};


Learn.prototype.show = function(course) {
	let sentences = this.findSentences(course);
	let picked = sentences[Math.floor(Math.random() * sentences.length)];
	this.populateData(picked);
	let audio = this.getAudio(picked.sound, window[course].id);
	audio.play();
	this.currentAudio = audio;
	this.viewAnswer.onclick = () => {
		if(this.viewAnswer.innerText === "Next") {
			this.clean();
			this.show(course);
		} else {
			this.answerContainer.classList.remove("is-hidden");
			this.viewAnswer.innerText = "Next";
		}
	};
	this.playAudio.onclick = () => {
		if(this.currentAudio) {
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
	if(!this.answerContainer.classList.contains("is-hidden")) {
		this.answerContainer.classList.add("is-hidden");
	}
};