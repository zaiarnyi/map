window.addEventListener('DOMContentLoaded', animationWorld);

function animationWorld() {
	const wrapCountries = document.getElementById('wrap-country'); //Обертка для стран и динамически создаваемых объектов
	const countries = document.getElementById('countries'); //Обертка для стран
	const polygans = document.getElementsByClassName('polygans'); //Коллекция всех стран
	const startCountries = document.querySelector('[data-start="true"]'); // Начальная точка - о. Мэн
	const endCountries = document.querySelectorAll('[data-end="true"]'); // Коллекци всех сотруднических стран
	let draw = SVG().addTo(wrapCountries);

	//Получаем кординаты/значения атрибута transform
	function getPosition(el) {
		if (!el.hasAttribute('transform')) return false;
		const positionX = +el.getAttribute('transform').slice(10, 19); //Получаем значение из атрибута
		const positionY = +el.getAttribute('transform').slice(21, 30); //Получаем значение из атрибута

		const widthElem = +el.getBoundingClientRect().width.toFixed(2); //Получаем размеры текущей страны
		const heightElem = +el.getBoundingClientRect().height.toFixed(2); //Получаем размеры текущей страны
		let xCenter = positionX + widthElem / 2; //Получаем кординаты центра текущей страны
		let yCenter = positionY + heightElem / 2; //Получаем кординаты центра текущей страны

		if ( window.screen.availWidth > 385 && window.screen.availWidth < 415 && yCenter <= 75 ) {
			//Корректно задаем кординаты для мобильных телефонов
			xCenter = positionX + widthElem - 30;
			yCenter = positionY + heightElem - 5;
		} else if (window.screen.availWidth <= 385) {
			//Корректно задаем кординаты для устаревших моделей мобильных телефонов
			xCenter = positionX + widthElem;
			yCenter = positionY + heightElem;
		}
		return {
			x: positionX,
			y: positionY,
			xCenter,
			yCenter,
		};
	}

	function showColorCountry(el) {
		const color = {
			1: ['#CA40D1', '#5C0975'], //Синий
			2: ['#284AD2', '#2D308C'], //Красный
		};
		const valueCountry = el.getAttribute('data-color-country') || '1';
		if (el.querySelector('g.group-color')) {
			const groupWithColor = el.querySelector('.group-color').children;
			for (let i = 0; i < groupWithColor.length; i++) {
				const polygon = groupWithColor[i];
				let randomValue = Math.floor(Math.random() * 2);
				polygon.setAttribute('fill', color[valueCountry][randomValue]);
			}
		} else {
			for (let i = 0; i < el.children.length; i++) {
				const polygon = el.children[i];
				let randomValue = Math.floor(Math.random() * 2);
				polygon.setAttribute('fill', color[valueCountry][randomValue]);
			}
		}
	}

	function showPath(el) {
		showColorCountry(startCountries);

		el.forEach((item, i) => {
			const xStart = getPosition(startCountries).xCenter; //Получаем центр о. МЭН по х
			const yStart = getPosition(startCountries).yCenter; //Получаем центр о. МЭН по у
			const xEnd = getPosition(item).xCenter; // Получаем центр конечной точки по х
			const yEnd = getPosition(item).yCenter; // Получаем центр конечной точки по у

			showColorCountry(item);
			createPath(el, item, i, xStart, yStart, xEnd, yEnd); // Создаем луч/путь/вектор
		});
	}

	function showBlock(el) {
		const xStartCenter = getPosition(startCountries).xCenter; //Получаем центр о. МЭН по х
		const yStartCenter = getPosition(startCountries).yCenter; //Получаем центр о. МЭН по у
		createInfoBlock(startCountries, startCountries, 0, xStartCenter, yStartCenter); //Создаем блок с информацией по каждой стране

		el.forEach((item, i) => {
			const xEnd = getPosition(item).xCenter; // Получаем центр конечной точки по х
			const yEnd = getPosition(item).yCenter; // Получаем центр конечной точки по у

			createInfoBlock(el, item, i, xEnd, yEnd); //Создаем блок с информацией по каждой стране
		});
	}

	function createPath(arr, el, i, x1, y1, x2, y2) {
		const valueGradient = el.getAttribute('data-gradient') || '1';
		const colorStroke = [
			'#CA40D1',
			'url(#paint0_linear)',
			'url(#paint1_linear)',
		];

		let dalayForSmallPath = (arr.length + 1) * 500;
		let smallLineLength = dist(x1, x2, y1, y2) >= 20 ? 20 : dist(x1, x2, y1, y2); // Задаем длинну
		let numberGrad = (x2 <= x1) && valueGradient == '2' ? 1 : ((x2) => x1) && valueGradient == '2' ? 2 : 0;

		//Создаем SVG
		const group = draw.group().attr('filter', `url(#filter0_f)`);

		let pathInGroup = group
			.path(`M ${x1} ${y1} L ${x1} ${y1} ${x1} ${y1} `)
			.attr({
				stroke: `${colorStroke[numberGrad]}`,
				'stroke-width': 3,
				opacity: 0,
				fill: 'none',
			})
			.animate(2000, i * 500, 'after')
			.during(function (pos) {
				this.attr({ opacity: pos });
			})
			.plot(`M ${x1} ${y1} L ${x1} ${y1} ${x2} ${y2}`);

		let pathLine = draw
			.path(`M ${x1} ${y1} L ${x1} ${y1} ${x1} ${y1} `)
			.attr({
				stroke: `${colorStroke[numberGrad]}`,
				'stroke-width': 2,
				opacity: 0,
				fill: 'transparent',
			})
			.animate(2000, i * 500, 'after')
			.during(function (pos) {
				this.attr({ opacity: pos });
			})
			.plot(`M ${x1} ${y1} L ${x1} ${y1} ${x2} ${y2}`);

		let pathSmall = draw
			.path(`M ${x1} ${y1} L ${x1} ${y1} ${x2} ${y2}`)
			.attr({
				stroke: '#fff',
				'stroke-width': 1,
				opacity: 0,
				'stroke-dasharray': `${smallLineLength} ${
					dist(x1, x2, y1, y2) - smallLineLength
				}`,
				'stroke-dashoffset': '0px',
			})
			.animate(2000, dalayForSmallPath + dalayForSmallPath / 2, 'after')
			.attr('opacity', '1')
			.animate(2000, dalayForSmallPath / 2 + i * 600, 'after')
			.attr({
				opacity: 0.3,
				'stroke-dashoffset': `-${dist(x1, x2, y1, y2) - smallLineLength}px`,
			});
	}

	function createInfoBlock(arr, el, i, x1, y1) {
		const xCustomPos = +el.getAttribute('data-x-position') || 0; //Получаем значения если требуется сдвинуть блок по Х
		const yCustomPos = +el.getAttribute('data-y-position') || 0; //Получаем значения если требуется сдвинуть блок по У
		const valueNumber = el.getAttribute('data-number') || ''; // Получаем значение для вывода в блок
		const countryIcon = el.dataset.icon.toUpperCase(); // Получаем иконку страны и переводим в верхний регистр
		const country = el.getAttribute('data-country'); //Получаем названия страны
		const dalay = (arr.length + 1) * 500; // Задержка для появления блоков после все лучей
		let xValue = x1 + xCustomPos;
		let yValue = y1 + yCustomPos;
		let fontSizeCountry = country.length > 15 ? 3 : 4; //Для длинный названий стран, устанавливаем меньше шрифт

		//Создаем SVG
		let group = draw.group(); // Группируем новые элементы
		let rect = group.rect(55, 18); // Создаем фоновую часть
		let image = group.image(`img/counrty/${countryIcon}.svg`, 13, 12); //Добавляем иконку
		let numberText = group.plain(valueNumber); //Создаем текстовый тег
		let countryText = group.plain(country); //Создаем текстовый тег

		rect
			.attr({ x: xValue - 27, y: yValue - 23, opacity: 0, fill: '#000' })
			.radius(3)
			.animate(2000, dalay + i * 500, 'after')
			.attr({ opacity: 1 });

		let polygon = group
			.polygon(
				`${xValue - 2},${yValue - 5} ${xValue + 4} ${yValue - 5} ${
					xValue + 1
				} ${yValue} `,
			)
			.attr({ opacity: 0, fill: '#000' })
			.animate(1000, dalay + i * 500, 'after')
			.attr('opacity', '1');

		image
			.size(13, 12)
			.move(xValue - 24, yValue - 20)
			.attr('opacity', 0)
			.animate(2000, dalay + i * 500, 'after')
			.attr('opacity', 1);

		numberText
			.move(xValue - 9, yValue - 23)
			.fill('#fff')
			.attr({ 'font-size': 7, 'font-weight': 'bold', opacity: 0, fill: '#fff' })
			.animate(2000, dalay + i * 500, 'after')
			.attr('opacity', '1');

		countryText
			.move(xValue - 9, yValue - 32)
			.fill('#fff')
			.attr({
				'font-size': fontSizeCountry,
				opacity: 0,
				fill: '#fff',
				'letter-spacing': '-1.5%',
			})
			.animate(2000, dalay + i * 500, 'after')
			.attr('opacity', '1');
	}

	function dist(x1, x2, y1, y2) {
		return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2); // Для получения длинны новосозданного Path
	}

	showPath(endCountries);
	showBlock(endCountries);
}
