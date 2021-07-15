Konva.hitOnDragEnabled = true;

let stage = new Konva.Stage({
	container: 'map-field',   // id of container <div>
	width: window.window.innerWidth,
	height: window.window.innerHeight,
	name: 'stage'
});

let id_field = document.getElementById('id_number');
let x_field = document.getElementById('x_number');
let y_field = document.getElementById('y_number');
let z_field = document.getElementById('z_number');
let w_field = document.getElementById('w_number');
let h_field = document.getElementById('h_number');
let a_field = document.getElementById('a_number');


window.addEventListener("resize", function () {
	stage.width(window.window.innerWidth);
	stage.height(window.window.innerHeight);
});
stage.y(window.window.innerHeight);

let marker_layer = new Konva.Layer();
stage.add(marker_layer);

let tr = new Konva.Transformer({
	centeredScaling: true,
	enabledAnchors: [
		'top-left',
		'top-right',
		'bottom-left',
		'bottom-right'
	],
	rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
});

marker_layer.add(tr);
marker_layer.draw();

let selectionRectangle = new Konva.Rect({
	fill: 'rgb(0, 136, 255, 0.5)'
});

marker_layer.add(selectionRectangle);

let x1, y1, x2, y2;

function getStagePointerX() {
	return (stage.getPointerPosition().x - stage.x()) / stage.scaleX();
}

function getStagePointerY() {
	return (stage.getPointerPosition().y - stage.y()) / stage.scaleY();
}

function getMarkerCenter(marker) {
	let width = PIXEL_SIZE * (MARKER_SIZE + 2) * marker.scaleX();
	let angle_in_radians = marker.rotation() * Math.PI / 180;

	return {
		'x': marker.x() + width * (Math.cos(angle_in_radians) - Math.sin(angle_in_radians)) / 2,
		'y': marker.y() + width * (Math.cos(angle_in_radians) + Math.sin(angle_in_radians)) / 2
	}
}

function toggleCoordinatesWindow(state) {
	if (state) {
		updateCoordinates();
		document.getElementById('coords-menu').style.right = '0';
	} else {
		document.getElementById('coords-menu').style.right = '-220px';
	}
}

createMarker = function () {
	let modal = new tingle.modal({
		footer: true,
		stickyFooter: false,
		closeMethods: ['overlay', 'button', 'escape'],
		cssClass: ['trash-screen'],
		closeLabel: "Close",
		onOpen: function () {
			//console.log('modal open');
		},
		onClose: function () {
			document.getElementsByClassName('trash-screen')[0].remove();
		}
	});
	modal.setContent('<h1>Создать метку</h1><input type="number" id="marker-id-input" placeholder="id маркера" class="tingle-input"/>');
	modal.addFooterBtn('Создать метку', 'tingle-btn tingle-btn--primary', function () {
		try {
			addMarker(marker_layer, document.getElementById('marker-id-input').value);
		} catch (e) {

		}
		modal.close();
	});
	modal.open();
}

createMarkers = function () {
	/*
1	0.33	0	0	0	0	0	0
2	0.33	1	0	0	0	0	0
3	0.33	0	1	0	0	0	0
4	0.33	1	1	0	0	0	0
	*/

	let modal = new tingle.modal({
		footer: true,
		stickyFooter: false,
		closeMethods: ['overlay', 'button', 'escape'],
		cssClass: ['trash-screen'],
		closeLabel: "Close",
		onOpen: function () {
			//console.log('modal open');
		},
		onClose: function () {
			document.getElementsByClassName('trash-screen')[0].remove();
		}
	});
	modal.setContent('<h1>Создать метки, но из txt</h1><textarea class="tingle-textarea" id="marker-id-input" placeholder="маркеры"/>');
	modal.addFooterBtn('Создать метки', 'tingle-btn tingle-btn--primary', function () {
		try {
			let text = document.getElementById('marker-id-input').value;
			while (text.indexOf('\t') !== -1) {
				text = text.replaceAll('\t', ' ');
			}
			while (text.indexOf('\n') !== -1) {
				text = text.replaceAll('\n', ' ');
			}
			while (text.indexOf('  ') !== -1) {
				text = text.replaceAll('  ', ' ');
			}
			console.log(text);
			let parsed = text.split(' ');
			if (parsed.length % 8 !== 0 || parsed.length === 0)
				throw new Error;
			let markers = [];
			for (let i = 0; i < parsed.length; i += 8) {
				markers.push({
					id: parseInt(parsed[i]),
					size: 100 * parseFloat(parsed[i + 1]),
					x: 100 * parseFloat(parsed[i + 2]),
					y: 100 * parseFloat(parsed[i + 3]),
					z: 100 * parseFloat(parsed[i + 4]),
					a: parseFloat(parsed[i + 5]),
				});
			}

			markers.forEach(function (e) {
				let _marker = generateMarker(marker_layer, e.id);

				_marker.rotation(e.a * 180 / Math.PI);
				let width = PIXEL_SIZE * (MARKER_SIZE + 2) * _marker.scaleX();
				let angle_in_radians = _marker.rotation() * Math.PI / 180;
				_marker.x(e.x - width * (Math.cos(angle_in_radians) - Math.sin(angle_in_radians)) / 2);
				_marker.y(-e.y - width * (Math.cos(angle_in_radians) + Math.sin(angle_in_radians)) / 2);
				_marker.z_axis = e.z;

				let old_center = getMarkerCenter(_marker);
				let new_scale = e.size / (PIXEL_SIZE * (MARKER_SIZE + 2));
				_marker.scaleX(new_scale);
				_marker.scaleY(new_scale);
				let new_center = getMarkerCenter(_marker);
				_marker.x(_marker.x() + (old_center.x - new_center.x));
				_marker.y(_marker.y() + (old_center.y - new_center.y));

				marker_layer.add(_marker);
			});

			computezlogic()
			marker_layer.batchDraw();
			updateCoordinates();
		} catch (e) {
			alert('Не получилось(');
			console.log(e);
		}
		modal.close();
	});
	modal.open();
}

exportMarkers = function () {
	let modal = new tingle.modal({
		footer: true,
		stickyFooter: false,
		closeMethods: ['overlay', 'button', 'escape'],
		cssClass: ['trash-screen'],
		closeLabel: "Close",
		onOpen: function () {
			//console.log('modal open');
		},
		onClose: function () {
			document.getElementsByClassName('trash-screen')[0].remove();
		}
	});
	modal.setContent('<h1>Экспортировать карту</h1>');
	modal.addFooterBtn('в txt', 'tingle-btn tingle-btn--primary', function () {
		try {
			let file_text = "";

			marker_layer.children.forEach(function (e) {
				if (e.is_marker) {
					let center = getMarkerCenter(e);
					let width = PIXEL_SIZE * (MARKER_SIZE + 2) * e.scaleX();

					file_text += (e.marker_id).toString() + '\t';
					file_text += (width / 100).toString() + '\t';
					file_text += (center.x / 100).toString() + '\t';
					file_text += (-center.y / 100).toString() + '\t';
					file_text += (e.z_axis / 100).toString() + '\t';
					file_text += (e.rotation() * Math.PI / 180).toString() + '\t0\t0\n';
				}
			});

			console.log(file_text);

			var a = window.document.createElement('a');
			a.href = window.URL.createObjectURL(new Blob([file_text], { type: 'text' }));
			a.download = 'map.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (e) {
			console.log(e);
		}
		modal.close();
	});
	modal.addFooterBtn('в svg', 'tingle-btn tingle-btn--default', function () {
		try {
			//TODO
		} catch (e) {

		}
		modal.close();
	});
	modal.open();
}

stage.on('mousedown touchstart', (e) => {
	if (e.target !== stage) {
		return;
	}

	x1 = getStagePointerX();
	y1 = getStagePointerY();
	x2 = getStagePointerX();
	y2 = getStagePointerY();

	selectionRectangle.visible(true);
	selectionRectangle.width(0);
	selectionRectangle.height(0);
	marker_layer.draw();
});

stage.on('mousemove touchmove', () => {
	if (!selectionRectangle.visible()) {
		return;
	}

	x2 = getStagePointerX();
	y2 = getStagePointerY();

	selectionRectangle.setAttrs({
		x: Math.min(x1, x2),
		y: Math.min(y1, y2),
		width: Math.abs(x2 - x1),
		height: Math.abs(y2 - y1),
	});
	marker_layer.batchDraw();
});

stage.on('mouseup touchend', () => {
	if (!selectionRectangle.visible()) {
		return;
	}

	setTimeout(() => {
		selectionRectangle.visible(false);
		marker_layer.batchDraw();
	});

	let shapes = stage.find('.marker').toArray();
	let box = selectionRectangle.getClientRect();
	let selected = shapes.filter((shape) =>
		Konva.Util.haveIntersection(box, shape.getClientRect())
	);

	tr.nodes(selected);

	if (selected.length > 0) {
		toggleCoordinatesWindow(true);
	} else {
		toggleCoordinatesWindow(false);
	}

	marker_layer.batchDraw();
});

id_field.onchange = function () {
	updateCoordinates();
}

x_field.onchange = function () {
	let markers = tr.nodes();
	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			let width = PIXEL_SIZE * (MARKER_SIZE + 2) * marker.scaleX();
			let angle_in_radians = marker.rotation() * Math.PI / 180;
			marker.x(x_field.value - width * (Math.cos(angle_in_radians) - Math.sin(angle_in_radians)) / 2);
		} else {
			let x_delta = x_field.value * stage.scaleX() + stage.x() - tr.x();
			markers.forEach(function (e) {
				e.x(e.x() + x_delta);
			});
		}
		marker_layer.batchDraw();
		updateCoordinates();
	}
}

y_field.onchange = function () {
	let markers = tr.nodes();
	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			let width = PIXEL_SIZE * (MARKER_SIZE + 2) * marker.scaleX();
			let angle_in_radians = marker.rotation() * Math.PI / 180;
			marker.y(-y_field.value - width * (Math.cos(angle_in_radians) + Math.sin(angle_in_radians)) / 2);
		} else {
			let y_delta = -y_field.value * stage.scaleY() + stage.y() - tr.y();
			markers.forEach(function (e) {
				e.y(e.y() + y_delta);
			});
		}
		marker_layer.batchDraw();
		updateCoordinates();
	}
}

function computezlogic() {
	let z_markers = [];

	marker_layer.children.forEach(function (e) {
		if (e.is_marker)
			z_markers.push(e);
	});


	for (let i = 0; i < z_markers.length; i++) {
		for (let j = 0; j < z_markers.length - i - 1; j++) {
			if (z_markers[j].z_axis > z_markers[j + 1].z_axis || (z_markers[j].z_axis === z_markers[j + 1].z_axis && z_markers[j].scaleX() < z_markers[j + 1].scaleX())) {
				let t = z_markers[j];
				z_markers[j] = z_markers[j + 1];
				z_markers[j + 1] = t;
			}
		}
	}

	for (let i = 0; i < z_markers.length; i++) {
		for (let j = 0; j < marker_layer.children.length; j++) {
			if (z_markers[i] === marker_layer.children[j])
				marker_layer.children[j].zIndex(i + (marker_layer.children.length - z_markers.length));
		}
	}
}

z_field.onchange = function () {
	tr.nodes().forEach(function (e) {
		e.z_axis = parseFloat(z_field.value);
	});

	computezlogic();
	marker_layer.batchDraw();
	updateCoordinates();
}

w_field.onchange = function () {
	let markers = tr.nodes();
	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			let old_center = getMarkerCenter(marker);
			let new_scale = w_field.value / (PIXEL_SIZE * (MARKER_SIZE + 2));
			marker.scaleX(new_scale);
			marker.scaleY(new_scale);
			let new_center = getMarkerCenter(marker);
			marker.x(marker.x() + (old_center.x - new_center.x));
			marker.y(marker.y() + (old_center.y - new_center.y));
		} else {
			// TODO
		}
		computezlogic()
		marker_layer.batchDraw();
		updateCoordinates();
	}
}

h_field.onchange = function () {
	let markers = tr.nodes();
	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			let old_center = getMarkerCenter(marker);
			let new_scale = h_field.value / (PIXEL_SIZE * (MARKER_SIZE + 2));
			marker.scaleX(new_scale);
			marker.scaleY(new_scale);
			let new_center = getMarkerCenter(marker);
			marker.x(marker.x() + (old_center.x - new_center.x));
			marker.y(marker.y() + (old_center.y - new_center.y));
		} else {
			// TODO
		}
		computezlogic()
		marker_layer.batchDraw();
		updateCoordinates();
	}
}

a_field.onchange = function () {
	let markers = tr.nodes();
	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			//marker.rotation(a_field.value);
		} else {
			//tr.rotation(a_field.value);
		}
		marker_layer.batchDraw();
		updateCoordinates();
	}
}


function updateCoordinates() {
	let markers = tr.nodes();

	if (markers.length > 0) {
		if (markers.length === 1) {
			let marker = markers[0];
			let center = getMarkerCenter(marker);
			let width = PIXEL_SIZE * (MARKER_SIZE + 2) * marker.scaleX();

			id_field.value = marker.marker_id;
			z_field.value = Math.round(marker.z_axis);
			w_field.value = Math.round(width);
			x_field.value = Math.round(center.x);
			y_field.value = Math.round(-center.y);
			h_field.value = w_field.value;
			a_field.value = Math.round(marker.rotation());
		} else {
			let z_eq = true;
			markers.forEach(function (e) {
				if (markers[0].z_axis !== e.z_axis) {
					z_eq = false;
				}
			});

			if (z_eq) {
				z_field.value = Math.round(markers[0].z_axis);
			} else {
				z_field.value = null;
			}

			id_field.value = null;
			x_field.value = Math.round((tr.x() - stage.x()) / stage.scaleX());
			y_field.value = Math.round(-(tr.y() - stage.y()) / stage.scaleY());
			w_field.value = Math.round(tr.width());
			h_field.value = Math.round(tr.height());
			a_field.value = Math.round(tr.rotation());
		}
	} else {
		id_field.value = null;
		x_field.value = null;
		y_field.value = null;
		z_field.value = null;
		w_field.value = null;
		h_field.value = null;
		a_field.value = null;
	}
}

stage.on('dragstart dragmove transform', function (e) {
	updateCoordinates();
});

stage.on('click tap dragstart', function (e) {
	if (selectionRectangle.visible()) {
		return;
	}

	if (e.target.name() === 'stage') {
		toggleCoordinatesWindow(false);
		tr.nodes([]);
		marker_layer.draw();
		return;
	}

	let marker = e.target;

	if (e.target.name() === 'pixel') {
		marker = e.target.parent;
	}

	if (e.evt !== undefined) {
		const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
		const isSelected = tr.nodes().indexOf(e.target) >= 0;

		if (!metaPressed && !isSelected) {
			tr.nodes([marker]);
		} else if (metaPressed && isSelected) {
			const nodes = tr.nodes().slice(); // use slice to have new copy of array
			nodes.splice(nodes.indexOf(marker), 1);
			tr.nodes(nodes);
		} else if (metaPressed && !isSelected) {
			const nodes = tr.nodes().concat([marker]);
			tr.nodes(nodes);
		}

		marker_layer.draw();
	}

	if (tr.nodes().length > 0) {
		toggleCoordinatesWindow(true);
	} else {
		toggleCoordinatesWindow(false);
	}
});

stage.on('wheel', function (e) {
	e.evt.preventDefault();

	if (e.evt.ctrlKey && !e.evt.shiftKey) {

		let oldScale = stage.scaleX();
		let pointer = stage.getPointerPosition();
		let mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		let newScale =
			-e.evt.deltaY > 0 ? Math.min(oldScale * ZOOM_BY, ZOOM_LIMIT_MAX) :
				Math.max(ZOOM_LIMIT_MIN, oldScale / ZOOM_BY);

		stage.scale({ x: newScale, y: newScale });

		let newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
		stage.batchDraw();

	} else if (!e.evt.ctrlKey && e.evt.shiftKey) {
		let newPos = {
			x: stage.x() - e.evt.deltaY,
			y: stage.y()
		};
		stage.position(newPos);
		stage.batchDraw();
	} else {
		let newPos = {
			x: stage.x() - e.evt.deltaX,
			y: stage.y() - e.evt.deltaY
		};
		stage.position(newPos);
		stage.batchDraw();
	}
});

function fixSelectionBug() {
	selectionRectangle.setAttrs({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
	});

	setTimeout(() => {
		selectionRectangle.visible(false);
		marker_layer.batchDraw();
	});

	let shapes = stage.find('.marker').toArray();
	let box = selectionRectangle.getClientRect();
	let selected = shapes.filter((shape) =>
		Konva.Util.haveIntersection(box, shape.getClientRect())
	);
	tr.nodes(selected);
	marker_layer.batchDraw();
}

fixSelectionBug();


function getLineGuideStops(skipShape) {
	// let vertical = [0, stage.width() / 2, stage.width()];
	// let horizontal = [0, stage.height() / 2, stage.height()];
	let vertical = [];
	let horizontal = [];

	stage.find('.marker').forEach((guideItem) => {
		if (guideItem === skipShape) {
			return;
		}
		let box = guideItem.getClientRect();
		vertical.push([box.x + box.width / 2, box.x, box.x + box.width]);
		horizontal.push([box.y + box.height / 2, box.y, box.y + box.height]);
	});

	return {
		vertical: vertical.flat(),
		horizontal: horizontal.flat(),
	};
}

function getObjectSnappingEdges(node) {
	let box = node.getClientRect();
	let absPos = node.absolutePosition();

	return {
		vertical: [
			{
				guide: Math.round(box.x),
				offset: Math.round(absPos.x - box.x),
				snap: 'start',
			},
			{
				guide: Math.round(box.x + box.width / 2),
				offset: Math.round(absPos.x - box.x - box.width / 2),
				snap: 'center',
			},
			{
				guide: Math.round(box.x + box.width),
				offset: Math.round(absPos.x - box.x - box.width),
				snap: 'end',
			},
		],
		horizontal: [
			{
				guide: Math.round(box.y),
				offset: Math.round(absPos.y - box.y),
				snap: 'start',
			},
			{
				guide: Math.round(box.y + box.height / 2),
				offset: Math.round(absPos.y - box.y - box.height / 2),
				snap: 'center',
			},
			{
				guide: Math.round(box.y + box.height),
				offset: Math.round(absPos.y - box.y - box.height),
				snap: 'end',
			},
		],
	};
}

function getGuides(lineGuideStops, itemBounds) {
	let resultV = [];
	let resultH = [];

	lineGuideStops.vertical.forEach((lineGuide) => {
		itemBounds.vertical.forEach((itemBound) => {
			let diff = Math.abs(lineGuide - itemBound.guide);
			if (diff < GUIDELINE_OFFSET) {
				resultV.push({
					lineGuide: lineGuide,
					diff: diff,
					snap: itemBound.snap,
					offset: itemBound.offset,
				});
			}
		});
	});

	lineGuideStops.horizontal.forEach((lineGuide) => {
		itemBounds.horizontal.forEach((itemBound) => {
			let diff = Math.abs(lineGuide - itemBound.guide);
			if (diff < GUIDELINE_OFFSET) {
				resultH.push({
					lineGuide: lineGuide,
					diff: diff,
					snap: itemBound.snap,
					offset: itemBound.offset,
				});
			}
		});
	});

	let guides = [];

	let minV = resultV.sort((a, b) => a.diff - b.diff)[0];
	let minH = resultH.sort((a, b) => a.diff - b.diff)[0];
	if (minV) {
		guides.push({
			lineGuide: minV.lineGuide,
			offset: minV.offset,
			orientation: 'V',
			snap: minV.snap,
		});
	}
	if (minH) {
		guides.push({
			lineGuide: minH.lineGuide,
			offset: minH.offset,
			orientation: 'H',
			snap: minH.snap,
		});
	}
	return guides;
}

function drawGuides(guides) {
	guides.forEach((lg) => {
		if (lg.orientation === 'H') {
			let line = new Konva.Line({
				points: [-6000, 0, 6000, 0],
				stroke: 'rgb(0, 161, 255)',
				strokeWidth: 1,
				name: 'guid-line',
				dash: [4, 6],
			});
			marker_layer.add(line);
			line.absolutePosition({
				x: 0,
				y: lg.lineGuide,
			});
			marker_layer.batchDraw();
		} else if (lg.orientation === 'V') {
			let line = new Konva.Line({
				points: [0, -6000, 0, 6000],
				stroke: 'rgb(0, 161, 255)',
				strokeWidth: 1,
				name: 'guid-line',
				dash: [4, 6],
			});
			marker_layer.add(line);
			line.absolutePosition({
				x: lg.lineGuide,
				y: 0,
			});
			marker_layer.batchDraw();
		}
	});
}

marker_layer.on('dragmove', function (e) {
	if ((e.target.name() === 'marker') && (tr.nodes().length === 1)) {
		marker_layer.find('.guid-line').destroy();

		let lineGuideStops = getLineGuideStops(e.target);
		let itemBounds = getObjectSnappingEdges(e.target);
		let guides = getGuides(lineGuideStops, itemBounds);

		if (!guides.length) {
			return;
		}

		drawGuides(guides);

		let absPos = e.target.absolutePosition();
		guides.forEach((lg) => {
			switch (lg.snap) {
				case 'start': {
					switch (lg.orientation) {
						case 'V': {
							absPos.x = lg.lineGuide + lg.offset;
							break;
						}
						case 'H': {
							absPos.y = lg.lineGuide + lg.offset;
							break;
						}
					}
					break;
				}
				case 'center': {
					switch (lg.orientation) {
						case 'V': {
							absPos.x = lg.lineGuide + lg.offset;
							break;
						}
						case 'H': {
							absPos.y = lg.lineGuide + lg.offset;
							break;
						}
					}
					break;
				}
				case 'end': {
					switch (lg.orientation) {
						case 'V': {
							absPos.x = lg.lineGuide + lg.offset;
							break;
						}
						case 'H': {
							absPos.y = lg.lineGuide + lg.offset;
							break;
						}
					}
					break;
				}
			}
		});
		e.target.absolutePosition(absPos);
	}
});

marker_layer.on('dragend', function () {
	marker_layer.find('.guid-line').destroy();
	marker_layer.batchDraw();
});


addMarker(marker_layer, 0);
addMarker(marker_layer, 10);
// addMarker(marker_layer, 20);
