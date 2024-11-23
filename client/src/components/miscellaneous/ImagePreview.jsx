import React from 'react'

const ImagePreview = ({previewImage,closePreview, handleDownload}) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="relative w-full max-w-5xl p-4">
        {/* Image container */}
        <div className="relative flex justify-center items-center">
          <img
            src={previewImage}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] rounded-md object-contain"
          />
        </div>
        {/* Buttons */}
        <div className="absolute top-4 left-4">
          <button
            className="bg-white text-black px-4 py-2 rounded shadow-md hover:bg-gray-200 transition"
            onClick={closePreview}
          >
            Close
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <button
            className="bg-white text-black px-4 py-2 rounded shadow-md hover:bg-gray-200 transition"
            onClick={() => handleDownload(previewImage)}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImagePreview