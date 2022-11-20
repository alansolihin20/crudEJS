const mongoose = require('mongoose');

const Barang = mongoose.model('Barang', {
  namaBarang: {
    type: String,
  },
  hargaBarang: {
    type: String,
  },
  qty: {
    type: String,
  },
  berat: {
    type: String,
  },
  img: {
    type: String,
  },
});

module.exports = Barang;
