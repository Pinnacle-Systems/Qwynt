import React, { useState } from 'react';

const Popup = ({ closePopup,productId ,stockQty }) => {
  const [docid, setDocid] = useState('');
  const [date, setDate] = useState('');
  const [product, setProduct] = useState('');
  const [qty, setQty] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ docid, date, product, qty });
    closePopup();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center transition-opacity z-50 duration-300 ease-in-out">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-md transition-transform transform scale-100 sm:scale-95">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Add Stock</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Document ID</label>
            <input
              type="text"
              value={docid}
              onChange={(e) => setDocid(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Product</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={closePopup}
              className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
