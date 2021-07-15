function generateMarkerPixels(id) {
	let bytes = dict[MARKER_SIZE.toString() + "x" + MARKER_SIZE.toString() + "_1000"][id];
	let bits = [];
	let bitsCount = MARKER_SIZE * MARKER_SIZE;

	for (let byte of bytes) {
		let start = bitsCount - bits.length;
		for (let i = Math.min(7, start - 1); i >= 0; i--) {
			bits.push((byte >> i) & 1);
		}
	}

	let pixels = [];

	for (let i = 0; i < MARKER_SIZE; i++) {
		pixels.push([]);
		for (let j = 0; j < MARKER_SIZE; j++) {
			pixels[i].push(bits[i * MARKER_SIZE + j]);
		}
	}

	return pixels;
}

function generateKonvaMarkerGroup(pixels) {
	let marker = new Konva.Group({
		x: 100 + Math.random() * 400,
		y: -200 - Math.random() * 400,
		draggable: true,
		name: 'marker'
	});

	let bg_pixel = new Konva.Rect({
		x: 0,
		y: 0,
		width: PIXEL_SIZE * (MARKER_SIZE + 2),
		height: PIXEL_SIZE * (MARKER_SIZE + 2),
		fill: 'black',
		name: 'pixel',
	});
	marker.add(bg_pixel);

	for (let i = 0; i < MARKER_SIZE; i++) {
		for (let j = 0; j < MARKER_SIZE; j++) {
			if (pixels[i][j]) {
				let pixel = new Konva.Rect({
					x: (j + 1) * PIXEL_SIZE,
					y: (i + 1) * PIXEL_SIZE,
					width: PIXEL_SIZE,
					height: PIXEL_SIZE,
					fill: 'white',
					name: 'pixel'
				});
				marker.add(pixel);
			}
		}
	}

	return marker
}

function generateMarker(layer, id) {
	let pixels = generateMarkerPixels(id)
	let marker = generateKonvaMarkerGroup(pixels);

	marker.on('transform', function (e) {
		updateCoordinates();
	});

	/* marker.on('transform', function (e) {
		let scales = [];
		console.log(e.target.scale());
		layer.find('.marker').forEach((marker_element) => {
			if (marker_element !== e.target) {
				scales.push(marker_element.scaleX() - e.target.scaleX());
			}
		});

		let snap = scales.sort(function (a, b) {
			return Math.abs(a) - Math.abs(b);
		})[0];

		if (Math.abs(snap) < SCALING_THRESHOLD) {
			let box = e.target.getClientRect();
			let marker_center = {
				x: box.x + box.width / 2,
				y: box.y + box.height / 2
			};

			e.target.scaleX(snap + e.target.scaleX());
			e.target.scaleY(snap + e.target.scaleY());
			box = e.target.getClientRect();
			let new_marker_center = {
				x: box.x + box.width / 2,
				y: box.y + box.height / 2
			};
			// TODO Поправить!!!!!!!
			e.target.x(e.target.x() + (marker_center.x - new_marker_center.x));
			e.target.y(e.target.y() + (marker_center.y - new_marker_center.y));
			layer.batchDraw();
		}
	}) */

	marker.marker_id = id;
	marker.z_axis = 0;
	marker.is_marker = true;
	return marker;
}

function addMarker(layer, id) {
	layer.add(generateMarker(layer, id));
	layer.draw();
}