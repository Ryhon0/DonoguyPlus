var chi = setInterval(() => {
	if (frameCount != undefined && frameCount > 0) {
		clearInterval(chi);
		dgpMain();
	}
}, 1);

function dgpMain() {
	// Credits
	var settingsControls = document.getElementById("controls-settings");
	var footer = settingsControls.querySelector(".small");

	var creditsdiv = document.createElement("div");
	creditsdiv.innerText = "Dono Guy Plus written by Ryhon";
	footer.insertBefore(creditsdiv, footer.firstChild);

	var ryhonxyzLink = document.createElement("a");
	ryhonxyzLink.href = "https://ryhon.xyz";
	ryhonxyzLink.target = "_blank";
	ryhonxyzLink.innerText = "ryhon.xyz";
	ryhonxyzLink.classList = "text-white text-underline mr-3";
	footer.insertBefore(ryhonxyzLink, creditsdiv.nextSibling);

	footer.insertBefore(document.createElement("br"), ryhonxyzLink.nextSibling);

	// Override the draw function
	window.ogDraw = window.draw;
	window.draw = newDraw;

	// Part dragging
	var guy = document.getElementById("guy");
	guy.addEventListener("mousemove", (event) => {
		if (!guy.matches(":hover")) return;
		if (event.buttons & 1) {
			movePartTest(targetCategory, (event.movementX / ctx.width) * 850, (event.movementY / ctx.height) * 850);
			event.preventDefault();
		}
	});
	// Part scaling with mouse wheel
	guy.addEventListener("wheel", (event) => {
		if (event.deltaY != 0) {
			scalePartTest(targetCategory, -event.deltaY / 120 * 0.05);
			event.preventDefault();
		}
	});

	// Part properties inputs
	for (p of ["heads", "mouths", "eyes", "noses", "hats", "accessories"]) {
		const part = "" + p;
		var page = document.getElementById("controls-" + part);

		// Position X
		{
			const label = document.createElement("label");
			label.innerText = "X: ";
			page.appendChild(label);
			page.insertBefore(label, page.firstChild);

			const input = document.createElement("input");
			input.type = "number";
			input.addEventListener("input", () => {
				activeParts[part][0].options.position[0] = Number(input.value);
			});
			page.insertBefore(input, label.nextSibling);

			setInterval(() => {
				try {
					if (document.activeElement != input)
						input.value = activeParts[part][0].options.position[0];
				}
				catch (e) {
					input.value = 0;
				}
			}, 100);
		}
		// Position Y
		{
			const label = document.createElement("label");
			label.innerText = "Y: ";
			page.appendChild(label);
			page.insertBefore(label, page.firstChild.nextSibling.nextSibling);

			const input = document.createElement("input");
			input.type = "number";
			input.addEventListener("input", () => {
				activeParts[part][0].options.position[1] = Number(input.value);
			});
			page.insertBefore(input, label.nextSibling);

			setInterval(() => {
				try {
					if (document.activeElement != input)
						input.value = activeParts[part][0].options.position[1];
				}
				catch (e) {
					input.value = 0;
				}
			}, 100);
		}

		// Scale
		{
			const label = document.createElement("label");
			label.innerText = "Scale: ";
			page.appendChild(label);
			page.insertBefore(label, page.firstChild.nextSibling.nextSibling.nextSibling.nextSibling);

			page.insertBefore(document.createElement("br"), label);

			const input = document.createElement("input");
			input.step = 0.05;
			input.min = 0.2;
			input.max = 1.8;
			input.type = "number";
			input.addEventListener("input", () => {
				activeParts[part][0].options.scale = Math.max(0.2, Math.min(Number(input.value), 1.8));
			});
			page.insertBefore(input, label.nextSibling);

			setInterval(() => {
				try {
					if (document.activeElement != input)
						input.value = activeParts[part][0].options.scale;
				}
				catch (e) {
					input.value = 0;
				}
			}, 100);
		}
	}

	// GDP settings
	var settingsList = settingsControls.querySelector(".pl-4");
	{
		var con = document.createElement("div");
		con.classList.add("editor-control");
		settingsList.appendChild(con);

		var label = document.createElement("label");
		label.innerText = "Draw Donoguys Plus overlay";
		label.setAttribute("for", "dgpOverlayCheck");
		con.appendChild(label);

		var check = document.createElement("input");
		check.id = "dgpOverlayCheck";
		check.setAttribute("type", "checkbox");
		check.checked = dgpDrawOverlay;
		con.appendChild(check);

		check.addEventListener("change", () => { dgpDrawOverlay = check.checked });
	}
}

var dgpDrawOverlay = true;
function newDraw() {
	ctx.clearRect(0, 0, ctx.width, ctx.height);

	var r = requestAnimationFrame;
	requestAnimationFrame = (x) => { };
	ogDraw();
	requestAnimationFrame = r;

	if (dgpDrawOverlay) {
		ctx.fillStyle = "#FFF";
		ctx.font = "16px serif";
		var line = "";
		if (targetCategory in activeParts) {
			if (activeParts[targetCategory].length != 0) {
				var op = activeParts[targetCategory][0].options;
				if (op) {
					if ("position" in op) {
						line += "x: " + Math.round(op.position[0] * 100) / 100 + "\n";
						line += "y: " + Math.round(op.position[1] * 100) / 100 + "\n";
					}
					if ("scale" in op)
						line += "scale: " + Math.round(op.scale * 100) / 100 + "\n";
				}

				if (targetCategory == "heads") {
					line += "color: " + hslToHexStr(activeColors["head"]) + "\n";
				}
				else if (targetCategory == "hats") {
					line += "color: " + hslToHexStr(activeColors["hat_color"]) + "\n";
					line += "accent: " + hslToHexStr(activeColors["hat_accent"]) + "\n";
				}
			}
			else line += "No part selected";
		}
		else line = "DonoGuyPlus by Ryhon";

		var lineheight = 16;
		var lines = line.split('\n');
		for (var i = 0; i < lines.length; i++)
			ctx.fillText(lines[i], 8, ((i + 1) * lineheight));
	}

	requestAnimationFrame(newDraw);
}

function hslToHexStr(v) {
	// Extract HSL values
	var [h, s, l] = v.match(/\d+(\.\d+)?/g).map(Number);
	return hslToHex(h, s, l);
}