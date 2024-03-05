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

	var guy = document.getElementById("guy");
	// Part picking
	guy.addEventListener("mousedown", (event) => {
		if (event.button != 0) return;

		var canvasRect = guy.getBoundingClientRect();

		var x = event.x - canvasRect.x;
		var y = event.y - canvasRect.y;
		if (canvasRect.width > canvasRect.height) {
			x -= (canvasRect.width - canvasRect.height) / 2;
		} else {
			y -= (canvasRect.height - canvasRect.width) / 2;
		}

		var p;
		for (pk in partLayerBBoxes) {
			for (pl in partLayerBBoxes[pk]) {
				var bb = partLayerBBoxes[pk][pl];
				if (bb[2] == 0 || bb[3] == 0) continue;

				// Check bounding box
				if (x > bb[0] && y > bb[1] && x < (bb[0] + bb[2]) && y < (bb[1] + bb[3])) {
					function getPixel(img, x, y) {
						var canvas = document.createElement('canvas');
						canvas.width = img.width;
						canvas.height = img.height;
						var context = canvas.getContext('2d');
						context.drawImage(img, 0, 0);
						return context.getImageData(x, y, 1, 1).data;
					}

					var tex;
					var partid = activeParts[pk][0].id;
					if (!guyDefinitions.parts[pk][partid].layers) {
						texturePath = guyDefinitions.parts[pk][partid].texture;
						tex = guyDefinitions.textures[texturePath];
					}
					else {
						for (i in guyDefinitions.parts[pk][partid].layers) {
							texturePath = guyDefinitions.parts[pk][partid].layers[i].texture;
							tex = guyDefinitions.textures[texturePath];
						}
					}

					var u = Math.round((x - bb[0]) / bb[2] * tex.width);
					var v = Math.round((y - bb[1]) / bb[3] * tex.height);

					var px = getPixel(tex, u, v);
					if (px[3] > 25)
						p = pk;
				}
			}
			if (p) break;
		}

		if (p) {
			targetCategory = p;
			document.getElementById("tab-" + targetCategory).click();
		}
	});

	// Part dragging
	guy.addEventListener("mousemove", (event) => {
		if (!guy.matches(":hover")) return;
		if (event.buttons & 1) {
			var movex = (event.movementX / ctx.width) * 850;
			var movey = (event.movementY / ctx.height) * 850;

			if (event.shiftKey) {
				for (p of ["heads", "mouths", "eyes", "noses", "hats", "accessories"])
					if(p != targetCategory)
						movePartTest(p, movex, movey);
			}
			event.preventDefault();
		}
	});
	// Grab cursor
	guy.addEventListener("mousedown", (event) => {
		if (event.button != 0) return;
		guy.style.cursor = "grabbing";
	});
	guy.addEventListener("mouseup", (event) => {
		if (event.button != 0) return;
		guy.style.cursor = "default";
	});

	// Part scaling with mouse wheel
	guy.addEventListener("wheel", (event) => {
		if (event.deltaY != 0) {
			var scaleby = -event.deltaY * 0.0005;

			if (event.shiftKey) {
				for (p of ["heads", "mouths", "eyes", "noses", "hats", "accessories"])
					if(p != targetCategory)
						scalePartTest(p, scaleby);
			}
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

		{
			var overlayLabel = document.createElement("label");
			overlayLabel.innerText = "Draw Donoguys Plus overlay";
			overlayLabel.setAttribute("for", "dgpOverlayCheck");
			con.appendChild(overlayLabel);

			var overlayCheck = document.createElement("input");
			overlayCheck.id = "dgpOverlayCheck";
			overlayCheck.setAttribute("type", "checkbox");
			overlayCheck.checked = dgpDrawOverlay;
			overlayCheck.addEventListener("change", () => { dgpDrawOverlay = overlayCheck.checked });
			con.appendChild(overlayCheck);
			con.appendChild(document.createElement("br"));
		}

		{
			var bboxLabel = document.createElement("label");
			bboxLabel.innerText = "Draw layer bounding boxes";
			bboxLabel.setAttribute("for", "dgpBboxCheck");
			con.appendChild(bboxLabel);

			var bboxCheck = document.createElement("input");
			bboxCheck.id = "dgpBboxCheck";
			bboxCheck.setAttribute("type", "checkbox");
			bboxCheck.checked = dgpDrawOverlay;
			bboxCheck.addEventListener("change", () => { dgpDrawBbox = bboxCheck.checked });
			con.appendChild(bboxCheck);
			con.appendChild(document.createElement("br"));
		}
	}

	// JSON exporter
	{
		// To output
		{
			var jsonCodebox = document.createElement("textarea");
			jsonCodebox.placeholder = "Generated JSON will be saved here";

			var genButton = document.createElement("button");
			genButton.innerText = "Generate JSON";
			genButton.onclick = () => {
				jsonCodebox.value = JSON.stringify(generateSaveBundle());
			};
			settingsList.appendChild(genButton);

			var loadButton = document.createElement("button");
			loadButton.innerText = "Load JSON";
			loadButton.onclick = () => {
				try {
					window.lastSaved = JSON.parse(jsonCodebox.value);
					completeLoading();
				}
				catch (e) {
					console.error(e);
					alert("Error while loading JSON:\n" + e);
				}
			};
			settingsList.appendChild(loadButton);

			settingsList.appendChild(document.createElement("br"));
			settingsList.appendChild(jsonCodebox);
			settingsList.appendChild(document.createElement("br"));
		}

		// File
		{
			var saveButton = document.createElement("button");
			saveButton.innerText = "Save to file";
			saveButton.onclick = () => {
				var a = document.createElement("a");
				var file = new Blob([JSON.stringify(generateSaveBundle())], { type: "application/json" });
				a.href = URL.createObjectURL(file);
				a.download = "download.donoguy";
				a.click();
			};
			settingsList.appendChild(saveButton);

			var loadButton = document.createElement("button");
			loadButton.innerText = "Load from file";
			loadButton.onclick = () => {
				var fi = document.createElement("input");
				fi.type = "file";
				fi.accept = ".donoguy";
				fi.addEventListener("change", () => {
					if (fi.files.length != 1) return;

					const fr = new FileReader();
					fr.readAsText(fi.files[0])
					fr.onload = function () {
						try {
							window.lastSaved = JSON.parse(fr.result);
							completeLoading();
						}
						catch (e) {
							console.error(e);
							alert("Error while loading JSON:\n" + e);
						}
					};

				});
				fi.click();
			};
			settingsList.appendChild(loadButton);
		}

		settingsList.appendChild(document.createElement("br"));
	}
}

var dgpDrawOverlay = true;
var dgpDrawBbox = false;
var partLayerBBoxes = {}

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

	// Calculate bounding boxes
	for (pkey of ["heads", "mouths", "eyes", "noses", "accessories", "hats"]) {
		var canvasClientWidth = ctx.canvas.clientWidth;
		var canvasClientHeight = ctx.canvas.clientHeight;
		var squareSize = Math.min(canvasClientHeight, canvasClientWidth);

		// Calculate layer bounding boxes for alpha test
		var p = activeParts[pkey][0];
		partLayerBBoxes[pkey] = [];
		if (p && p.options) {
			var x = p.options.position[0] || 0;
			var y = p.options.position[1] || 0;
			x *= guyScale;
			y *= guyScale;
			x += squareSize / 2;
			y += squareSize / 2;
			var scale = p.options.scale || 1;
			scale *= guyScale;

			if (!guyDefinitions.parts[pkey][p.id].layers) {
				var texturePath = guyDefinitions.parts[pkey][p.id].texture;
				var tex = guyDefinitions.textures[texturePath];

				var lw = tex.width * scale;
				var lh = tex.height * scale;
				var lx = x - (lw / 2);
				var ly = y - (lh / 2);

				partLayerBBoxes[pkey][0] = [lx, ly, lw, lh];
			}
			else {
				for (i in guyDefinitions.parts[pkey][p.id].layers) {
					var texturePath = guyDefinitions.parts[pkey][p.id].layers[i].texture;
					var tex = guyDefinitions.textures[texturePath];

					var lw = tex.width * scale;
					var lh = tex.height * scale;
					var lx = x - (lw / 2);
					var ly = y - (lh / 2);

					partLayerBBoxes[pkey][i] = [lx, ly, lw, lh];
				}
			}

		}
	}

	if (dgpDrawBbox) {
		for (pk in partLayerBBoxes) {
			ctx.strokeStyle = pk == targetCategory ? 'lime' : 'red';
			for (pl in partLayerBBoxes[pk]) {
				var bb = partLayerBBoxes[pk][pl];
				ctx.strokeRect(bb[0], bb[1], bb[2], bb[3]);
			}
		}
	}

	requestAnimationFrame(newDraw);
}

function hslToHexStr(v) {
	// Extract HSL values
	var [h, s, l] = v.match(/\d+(\.\d+)?/g).map(Number);
	return hslToHex(h, s, l);
}