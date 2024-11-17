const socket = io();

const productList = document.getElementById('product-list');
const addProductForm = document.getElementById('add-product-form');

// Actualizar lista de productos en tiempo real
socket.on('updateProducts', (products) => {
    productList.innerHTML = '';
    products.forEach((product) => {
        const li = document.createElement('li');
        li.textContent = `${product.title} - ${product.description} - $${product.price}`;
        productList.appendChild(li);
    });
});

// Enviar nuevo producto al servidor
addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(addProductForm);
    const newProduct = {};

    formData.forEach((value, key) => {
        if (!value.trim()) {
            alert(`El campo ${key} no puede estar vacío`);
            return;
        }
        newProduct[key] = key === 'price' || key === 'stock' ? Number(value) : value;
    });

    socket.emit('newProduct', newProduct, (response) => {
        if (response.error) {
            alert('Error al añadir producto: ' + response.error);
        } else {
            alert('Producto añadido con éxito');
        }
    });
});

