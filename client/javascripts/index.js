const dropZone = document.querySelector(".drop-zone")
const fileInput = document.querySelector("#fileInput")
const browseBtn = document.querySelector("#browseBtn")

const bgProgress = document.querySelector(".bg-progress")
const progressBar = document.querySelector(".progress-bar")
const percentContainer = document.querySelector(".percent-container")
const progressContainer = document.querySelector(".progress-container")
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container")
const fileURL = document.querySelector("#fileURL")
const copyBtn = document.querySelector("#copyBtn")

const emailForm = document.querySelector("#emailForm")
const toast = document.querySelector(".toast")

const host = "https://saajha.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURl = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; //100mb;

dropZone.addEventListener("dragover", (e) => {
	//console.log("dragging");
	e.preventDefault();
	if (!dropZone.classList.contains("dragged")) {
		dropZone.classList.add("dragged")
	}
});

dropZone.addEventListener("dragleave", () => {
	dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop", (e) => {
	e.preventDefault();
	dropZone.classList.remove("dragged");
	const files = e.dataTransfer.files;
	console.log(files);
	if (files.length) {
		fileInput.files = files;
		uploadFiles();
	}
})

fileInput.addEventListener("change", () => {
	uploadFiles();
})

browseBtn.addEventListener("click", () => {
	fileInput.click();
})

copyBtn.addEventListener("click", () => {
	fileURL.select();
	document.execCommand("copy");
	showToast("Link Copied")
})

const uploadFiles = () => {
	if (fileInput.files.length > 1) {
		resetFileInput()
		showToast("Only upload one file!")
		return;
	}
	const files = fileInput.files[0];
	if (files.size > maxAllowedSize) {
		showToast("File size limit exceeded")
		resetFileInput();
		return;
	}
	progressContainer.style.display = "block";
	
	const formData = new FormData();
	formData.append("userFile", files);

	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			console.log(xhr.response);
			onUploadSuccess(JSON.parse(xhr.response));
		}
	};

	xhr.upload.onprogress = updateProgress;

	xhr.upload.onerror = () => {
		resetFileInput()
		showToast(`Error in upload: ${xhr.statusText}`)
	}

	xhr.open("POST", uploadURL);
	xhr.send(formData);
}

const updateProgress = (e) => {
	const percent = Math.round((e.loaded / e.total) * 100);
	console.log(percent);
	percentContainer.innerText = percent;
	bgProgress.style.width = `${percent}%`;
	progressBar.style.transform = `scaleX(${percent/100})`;
}

const onUploadSuccess = ({ file: url }) => {
	console.log(url);
	resetFileInput()
	emailForm[2].removeAttribute("disabled");
	progressContainer.style.display = "none";
	sharingContainer.style.display = "block";
	fileURL.value = url;
}

const resetFileInput = () => {
	fileInput.value = "";
}

emailForm.addEventListener("submit", (e) => {
	e.preventDefault();
	console.log("Form Submitted");
	const url = fileURL.value;

	const formData = {
		uuid: url.split("/").splice(-1, 1)[0],
		senderEmail: emailForm.elements["from-email"].value,
		receiverEmail: emailForm.elements["to-email"].value,
	};

	emailForm[2].setAttribute("disabled", "true");

	console.table(formData);

	fetch(emailURl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(formData)
	})
	.then((res) => res.json())
	.then(({ success }) => {
			if (success) {
				sharingContainer.style.display = "none";
				showToast("Email Sent");
			}
			//console.log(data);
		})
})

let toastTimer;
const showToast = (msg) => {
	toast.innerText = msg;
	toast.style.transform = "translate(-50%, 0)";
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toast.style.transform = "translate(-50%, 60px)";
	}, 2000);
}



