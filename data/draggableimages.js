class DraggableImageManager
{
	constructor()
	{
		this.db = null;
		this.draggedElement = null;
		this.resizingElement = null;
		this.dragOffset = { x: 0, y: 0 };
		this.resizeStart = { x: 0, y: 0, width: 0, height: 0 };
		this.imageCounter = 0;
		this.init();
	}

	async initDB()
	{
		this.db = await OpenSettingsDB();
	}

	async init()
	{
		await this.initDB();
		this.initEventListeners();
		await this.loadSavedImages();
	}

	async saveImageToDB(imageData)
	{
		return new Promise((resolve, reject) =>
		{
			const transaction = this.db.transaction(['images'], 'readwrite');
			const store = transaction.objectStore('images');
			const request = store.put(imageData);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async loadSavedImages()
	{
		const canvas = document.getElementById('canvas');
		canvas.innerHTML = '';

		if (!this.db)
		{
			await this.initDB();
		}

		return new Promise((resolve, reject) =>
		{
			const transaction = this.db.transaction(['images'], 'readonly');
			const store = transaction.objectStore('images');
			const request = store.getAll();

			request.onsuccess = () =>
			{
				const images = request.result;
				// Sort by timestamp to maintain order
				images.sort((a, b) => a.timestamp - b.timestamp);
				images.forEach(imageData =>
				{
					this.createDraggableImage(imageData);
				});
				resolve();
			};
			
			request.onerror = () => reject(request.error);
		});
	}

	async updateImageSize(imageId, width, height)
	{
		return new Promise((resolve, reject) =>
		{
			const transaction = this.db.transaction(['images'], 'readwrite');
			const store = transaction.objectStore('images');
			const getRequest = store.get(imageId);

			getRequest.onsuccess = () =>
			{
				const imageData = getRequest.result;
				if (imageData)
				{
					imageData.width = width;
					imageData.height = height;
					const putRequest = store.put(imageData);
					putRequest.onsuccess = () => resolve();
					putRequest.onerror = () => reject(putRequest.error);
				}
			};
		});
	}


	handleResizeStart(e, element)
	{
		e.stopPropagation();
		e.preventDefault();

		this.resizingElement = element;
		const rect = element.getBoundingClientRect();

		this.resizeStart =
		{
			x: e.clientX,
			y: e.clientY,
			width: rect.width,
			height: rect.height,
			aspectRatio: rect.width / rect.height // Save aspect ratio
		};

		document.addEventListener('mousemove', this.handleResizing);
		document.addEventListener('mouseup', this.handleResizeEnd);
	}

	handleResizing = (e) =>
	{
		if (!this.resizingElement) return;

		const dx = e.clientX - this.resizeStart.x;
		const newWidth = Math.max(50, this.resizeStart.width + dx);
		const newHeight = Math.max(50, newWidth / this.resizeStart.aspectRatio); // Maintain aspect ratio

		this.resizingElement.style.width = newWidth + 'px';
		this.resizingElement.style.height = newHeight + 'px';
		document.getElementById('Avatar').classList.add('ghost');
		document.getElementById('ToggleMicrophone').click();s
	};


	handleResizeEnd = () =>
	{
		if (!this.resizingElement) return;

		const imageId = this.resizingElement.dataset.imageId;
		const newWidth = parseInt(this.resizingElement.style.width);
		const newHeight = parseInt(this.resizingElement.style.height);

		this.updateImageSize(imageId, newWidth, newHeight);

		this.resizingElement = null;
		document.removeEventListener('mousemove', this.handleResizing);
		document.removeEventListener('mouseup', this.handleResizeEnd);
		const toggleMenu = document.getElementById("togglemenu");
		if (toggleMenu)
		{
			toggleMenu.checked = !toggleMenu.checked;
		}
		document.getElementById('Avatar').classList.remove('ghost');
		document.getElementById('ToggleMicrophone').click();
	};


	createDraggableImage(imageData)
	{
		const canvas = document.getElementById('canvas');
		const imgContainer = document.createElement('div');
		imgContainer.className = `draggable-image ${imageData.type}`;
		imgContainer.style.left = imageData.x + 'px';
		imgContainer.style.top = imageData.y + 'px';
		const maxHeight = window.innerHeight * 0.9; // or 0.9 if you prefer
		const maxWidth = window.innerWidth * 1;

		const originalWidth = imageData.width || 150;
		const originalHeight = imageData.height || 150;

		// Calculate scale factors
		const heightScale = maxHeight / originalHeight;
		const widthScale = maxWidth / originalWidth;
		const scale = Math.min(1, heightScale, widthScale); // Use the smallest scale <= 1

		imgContainer.style.width = (originalWidth * scale) + 'px';
		imgContainer.style.height = (originalHeight * scale) + 'px';
		imgContainer.dataset.imageId = imageData.id;
		imgContainer.title = `${imageData.type === 'imported' ? 'Local' : 'Remote'}: ${imageData.name}`;

		const img = document.createElement('img');
		img.src = imageData.src;
		img.alt = imageData.name || 'Draggable image';
		img.style.width = '100%';
		img.style.height = '100%';
		img.draggable = false;

		// Add resize handle
		const resizeHandle = document.createElement('div');
		resizeHandle.className = 'resize-handle';
		resizeHandle.innerHTML = '↘'; // Corner resize icon

		// Handle image load errors for remote images
		img.onerror = () =>
		{
			img.style.background = '#f8f9fa';
			img.alt = 'Failed to load image';
			imgContainer.style.border = '2px solid #dc3545';
		};

		const controls = document.createElement('div');
		controls.className = 'image-controls';

		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'control-btn delete-btn';
		deleteBtn.textContent = '×';
		deleteBtn.title = 'Delete image';
		deleteBtn.onclick = (e) =>
		{
			e.stopPropagation();
			this.deleteImage(imageData.id);
		};

		const infoBtn = document.createElement('button');
		infoBtn.className = 'control-btn info-btn';
		infoBtn.textContent = 'i';
		infoBtn.title = 'Image info';
		infoBtn.onclick = (e) =>
		{
			e.stopPropagation();
			this.showImageInfo(imageData);
		};

		controls.appendChild(infoBtn);
		controls.appendChild(deleteBtn);
		imgContainer.appendChild(img);
		imgContainer.appendChild(controls);
		imgContainer.appendChild(resizeHandle);
		canvas.appendChild(imgContainer);
		resizeHandle.addEventListener('mousedown', (e) => this.handleResizeStart(e, imgContainer));
	}

	showImageInfo(imageData)
	{
		const info = `
Image Info:
- Type: ${imageData.type === 'imported' ? 'Local File' : 'Remote URL'}
- Name: ${imageData.name}
- Position: (${imageData.x}, ${imageData.y})
- Added: ${new Date(imageData.timestamp).toLocaleString()}
${imageData.type === 'remote' ? '- URL: ' + imageData.originalUrl : ''}
		`.trim();
		alert(info);
	}

	handlePointerDown(clientX, clientY, target)
	{
		if (!target.classList.contains('draggable-image')) return;

		this.draggedElement = target;
		target.classList.add('dragging');

		const rect = target.getBoundingClientRect();
		const canvasRect = document.getElementById('canvas').getBoundingClientRect();

		this.dragOffset =
		{
			x: clientX - rect.left,
			y: clientY - rect.top
		};
		document.getElementById('Avatar').classList.add('ghost');
		document.getElementById('ToggleMicrophone').click();
	}

	handlePointerMove(clientX, clientY)
	{
		if (!this.draggedElement) return;

		const canvasRect = document.getElementById('canvas').getBoundingClientRect();
		const newX = clientX - canvasRect.left - this.dragOffset.x;
		const newY = clientY - canvasRect.top - this.dragOffset.y;

		// Keep within bounds
		const maxX = canvasRect.width - this.draggedElement.offsetWidth;
		const maxY = canvasRect.height - this.draggedElement.offsetHeight;

		const boundedX = Math.max(0, Math.min(newX, maxX));
		const boundedY = Math.max(0, Math.min(newY, maxY));

		this.draggedElement.style.left = boundedX + 'px';
		this.draggedElement.style.top = boundedY + 'px';
	}

	handlePointerUp()
	{
		if (!this.draggedElement) return;

		const imageId = this.draggedElement.dataset.imageId;
		const x = parseInt(this.draggedElement.style.left);
		const y = parseInt(this.draggedElement.style.top);

		this.updateImagePosition(imageId, x, y);

		this.draggedElement.classList.remove('dragging');
		this.draggedElement = null;
		const toggleMenu = document.getElementById("togglemenu");
		if (toggleMenu)
		{
			toggleMenu.checked = !toggleMenu.checked;
		}
		document.getElementById('Avatar').classList.remove('ghost');
		document.getElementById('ToggleMicrophone').click();
	}


	initEventListeners()
	{
		const canvas = document.getElementById('canvas');

		// Mouse events
		canvas.addEventListener('mousedown', (e) =>
		{
			const target = e.target.closest('.draggable-image');
			if (target) this.handlePointerDown(e.clientX, e.clientY, target);
		});

		canvas.addEventListener('mousemove', (e) =>
		{
			this.handlePointerMove(e.clientX, e.clientY);
		});

		canvas.addEventListener('mouseup', () => this.handlePointerUp());
		canvas.addEventListener('mouseleave', () => this.handlePointerUp());

		// Touch events
		canvas.addEventListener('touchstart', (e) =>
		{
			const touch = e.touches[0];
			const target = e.target.closest('.draggable-image');
			if (target) this.handlePointerDown(touch.clientX, touch.clientY, target);
		}, { passive: false });

		canvas.addEventListener('touchmove', (e) =>
		{
			if (this.draggedElement)
			{
				const touch = e.touches[0];
				this.handlePointerMove(touch.clientX, touch.clientY);
				e.preventDefault(); // Prevent scrolling
			}
		}, { passive: false });

		canvas.addEventListener('touchend', () => this.handlePointerUp());
		canvas.addEventListener('touchcancel', () => this.handlePointerUp());

		// Prevent built-in drag behavior
		canvas.addEventListener('dragstart', (e) => e.preventDefault());

		// Other listeners
		document.getElementById('remoteUrl').addEventListener('keypress', (e) =>
		{
			if (e.key === 'Enter')
			{
				addRemoteImage();
			}
		});
	}

	async updateImagePosition(imageId, x, y)
	{
		return new Promise((resolve, reject) =>
		{
			const transaction = this.db.transaction(['images'], 'readwrite');
			const store = transaction.objectStore('images');
			const getRequest = store.get(imageId);

			getRequest.onsuccess = () =>
			{
				const imageData = getRequest.result;
				if (imageData)
				{
					imageData.x = x;
					imageData.y = y;
					const putRequest = store.put(imageData);
					putRequest.onsuccess = () => resolve();
					putRequest.onerror = () => reject(putRequest.error);
				}
			};
		});
	}

	async deleteImage(imageId)
	{
		if (!confirm('Are you sure you want to delete this image?')) return;

		return new Promise((resolve, reject) =>
		{
			const transaction = this.db.transaction(['images'], 'readwrite');
			const store = transaction.objectStore('images');
			const request = store.delete(imageId);

			request.onsuccess = () =>
			{
				document.querySelector(`[data-image-id="${imageId}"]`).remove();
				this.showStatus('Image deleted successfully', 'success');
				resolve();
			};
			request.onerror = () => reject(request.error);
		});
	}

	showStatus(message, type)
	{
		const status = document.getElementById('status');
		status.textContent = message;
		status.className = `status ${type}`;
		status.style.display = 'block';

		setTimeout(() =>
		{
			status.style.display = 'none';
		}, 3000);
	}

	generateId()
	{
		return `img_${Date.now()}_${++this.imageCounter}`;
	}
}

// Initialize the manager
let imageManager;
window.addEventListener('DOMContentLoaded', () =>
{
	imageManager = new DraggableImageManager();
});

// Global functions for UI interactions
async function loadImportedImages()
{
	const fileInput = document.getElementById('fileInput');
	const files = fileInput.files;

	if (files.length === 0)
	{
		imageManager.showStatus('Please select at least one image', 'error');
		return;
	}

	let successCount = 0;

	for (let file of files)
	{
		if (!file.type.startsWith('image/')) continue;

		const reader = new FileReader();
		reader.onload = async (e) =>
		{
			const tempImg = new Image();
			tempImg.onload = async () =>
			{
				const imageData =
				{
					id: imageManager.generateId(),
					src: e.target.result,
					name: file.name,
					type: 'imported',
					x: Math.random() * 300,
					y: Math.random() * 300,
					width: tempImg.naturalWidth,
					height: tempImg.naturalHeight,
					timestamp: Date.now()
				};

				await imageManager.saveImageToDB(imageData);
				imageManager.createDraggableImage(imageData);
				successCount++;
			};
			tempImg.src = e.target.result;
		};

		reader.readAsDataURL(file);
	}

	fileInput.value = '';
	setTimeout(() =>
	{
		imageManager.showStatus(`${successCount} local images imported successfully`, 'success');
	}, 100);
}

async function addRemoteImage()
{
	const urlInput = document.getElementById('remoteUrl');
	const url = urlInput.value.trim();

	if (!url)
	{
		imageManager.showStatus('Please enter a valid URL', 'error');
		return;
	}

	try
	{
		// Test if image loads
		const img = new Image();
		img.onload = async () =>
		{
			const imageData =
			{
				id: imageManager.generateId(),
				src: url,
				name: url.split('/').pop() || 'Remote image',
				type: 'remote',
				originalUrl: url,
				x: Math.random() * 300,
				y: Math.random() * 300,
				timestamp: Date.now()
			};

			await imageManager.saveImageToDB(imageData);
			imageManager.createDraggableImage(imageData);
			imageManager.showStatus('Remote image added successfully', 'success');
		};
		img.onerror = () =>
		{
			imageManager.showStatus('Failed to load remote image. Check the URL.', 'error');
		};

		// Set a timeout for loading
		setTimeout(() =>
		{
			if (!img.complete)
			{
				imageManager.showStatus('Image loading timeout. Please try again.', 'error');
			}
		}, 10000);

		img.src = url;
		urlInput.value = '';
	}
	catch (error)
	{
		imageManager.showStatus('Error adding remote image', 'error');
	}
}

async function clearAllImages()
{
	if (!confirm('Are you sure you want to clear all images? This cannot be undone.')) return;

	return new Promise((resolve, reject) =>
	{
		const transaction = imageManager.db.transaction(['images'], 'readwrite');
		const store = transaction.objectStore('images');
		const request = store.clear();

		request.onsuccess = () =>
		{
			document.getElementById('canvas').innerHTML = '';
			imageManager.showStatus('All images cleared', 'success');
			resolve();
		};
		request.onerror = () => reject(request.error);
	});
}

async function exportPositions()
{
	return new Promise((resolve, reject) =>
	{
		const transaction = imageManager.db.transaction(['images'], 'readonly');
		const store = transaction.objectStore('images');
		const request = store.getAll();

		request.onsuccess = () =>
		{
			const data = request.result;
			const exportData =
			{
				timestamp: new Date().toISOString(),
				totalImages: data.length,
				images: data.map(img =>
				({
					...img,
					// Keep base64 data intact for local images
					src: img.src // no filtering, always include original src
				}))
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `draggable-images-export-${new Date().toISOString().split('T')[0]}.json`;
			a.click();
			URL.revokeObjectURL(url);

			imageManager.showStatus('Positions exported successfully (with base64 data)', 'success');
			resolve();
		};
		request.onerror = () => reject(request.error);
	});
}

function importPositions()
{
	const input = document.getElementById('importInput');
	input.onchange = async (e) =>
	{
		const file = e.target.files[0];
		if (!file) return;

		try
		{
			const text = await file.text();
			const data = JSON.parse(text);

			if (!data.images || !Array.isArray(data.images))
			{
				throw new Error('Invalid file format');
			}

			for (const imageData of data.images)
			{
				imageData.id = imageManager.generateId(); // Generate new ID
				imageData.timestamp = Date.now(); // Update timestamp
				await imageManager.saveImageToDB(imageData);
				imageManager.createDraggableImage(imageData);
			}

			imageManager.showStatus(`Imported ${data.images.length} images`, 'success');
		}
		catch (error)
		{
			imageManager.showStatus('Error importing file: ' + error.message, 'error');
		}
		input.value = '';
	};
	input.click();
}

function setupImagePreview(containerId)
{
	const container = document.getElementById(containerId);
	const fileInput = container.querySelector('input[type="file"]');
	const imagePreview = container.querySelector('img');
	const customButtonText = container.querySelector('span');

	fileInput.addEventListener('change', function ()
	{
	const file = this.files[0];
	if (file)
	{
		const reader = new FileReader();
		reader.onload = function (e)
		{
			imagePreview.src = e.target.result;
			imagePreview.style.display = 'block';
			customButtonText.style.display = 'none';
		}
		reader.readAsDataURL(file);
		loadImportedImages();
	}
	});
}

// Initialize the image preview functionality
setupImagePreview('importLocalButton');
setupImagePreview('selectBGButton');